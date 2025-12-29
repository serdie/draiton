import { NextRequest, NextResponse } from 'next/server';
// Importamos la instancia de Admin que ya está inicializada correctamente
import { adminDb } from '@/lib/firebase-admin'; 
import { verifactiClient } from '@/lib/verifacti/api';

export async function POST(req: NextRequest) {
  try {
    console.log("🚀 [API] Iniciando proceso de emisión Veri*factu...");

    // 1. Recibir datos del frontend
    const body = await req.json();
    const { userId, invoiceId, invoiceData } = body;

    if (!userId || !invoiceId || !invoiceData) {
      console.error("❌ [API] Datos incompletos:", { userId, invoiceId, hasData: !!invoiceData });
      return NextResponse.json({ success: false, message: 'Datos incompletos' }, { status: 400 });
    }

    // 2. Verificación de seguridad (Rol) en Firebase Admin
    // Usamos adminDb directamente, que es lo que exporta tu archivo lib/firebase-admin.ts
    const userDoc = await adminDb.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
        throw new Error("Usuario no encontrado en base de datos");
    }

    const userData = userDoc.data();

    // Verificamos permisos (ajusta los roles según tu app)
    if (!userData || (userData.role !== 'pro' && userData.role !== 'empresa')) {
      return NextResponse.json(
        { success: false, message: 'Acceso denegado. Función exclusiva para suscriptores.' },
        { status: 403 }
      );
    }

    // 3. Preparar el paquete para Verifacti
    // Convertimos la fecha de YYYY-MM-DD a DD-MM-YYYY si es necesario
    let fechaExpedicion = '';

    if (invoiceData.FechaExpedicionFactura) {
      // Verificar si la fecha ya está en formato DD-MM-YYYY (por ejemplo: 29-12-2025)
      if (invoiceData.FechaExpedicionFactura.includes('-') && invoiceData.FechaExpedicionFactura.split('-').length === 3) {
        const partes = invoiceData.FechaExpedicionFactura.split('-');
        // Si la primera parte tiene 4 dígitos, es formato YYYY-MM-DD (por ejemplo: 2025-12-29)
        if (partes[0].length === 4) {
          // Formato YYYY-MM-DD, necesitamos convertirlo a DD-MM-YYYY
          fechaExpedicion = `${partes[2]}-${partes[1]}-${partes[0]}`;
        } else {
          // Ya está en formato DD-MM-YYYY
          fechaExpedicion = invoiceData.FechaExpedicionFactura;
        }
      } else {
        // Formato no estándar, intentamos convertirlo
        const partes = invoiceData.FechaExpedicionFactura.split('-');
        if (partes.length === 3 && partes[0].length === 4) {
          // Parece formato YYYY-MM-DD
          fechaExpedicion = `${partes[2]}-${partes[1]}-${partes[0]}`;
        } else {
          // Usamos tal cual o formato por defecto
          fechaExpedicion = invoiceData.FechaExpedicionFactura;
        }
      }
    } else {
      // Si no se proporciona fecha, usar la fecha actual
      const hoy = new Date();
      fechaExpedicion = `${hoy.getDate().toString().padStart(2, '0')}-${(hoy.getMonth() + 1).toString().padStart(2, '0')}-${hoy.getFullYear()}`;
    }

    // Validar que la fecha no sea posterior a la fecha actual
    const [dia, mes, anio] = fechaExpedicion.split('-').map(Number);
    const fechaObj = new Date(anio, mes - 1, dia);
    const fechaActual = new Date();
    fechaActual.setHours(0, 0, 0, 0); // Establecer hora a 00:00:00 para comparación precisa

    if (fechaObj > fechaActual) {
      return NextResponse.json(
        { success: false, message: 'La fecha de expedición no puede ser posterior a la fecha actual' },
        { status: 400 }
      );
    }

    // Validar que la fecha no sea anterior a 28-10-2024
    const fechaLimite = new Date(2024, 9, 28); // Octubre es 9 (0-indexed)
    if (fechaObj < fechaLimite) {
      return NextResponse.json(
        { success: false, message: 'La fecha de expedición no puede ser anterior al 28-10-2024' },
        { status: 400 }
      );
    }

    // Lógica para separar serie y número si vienen juntos (Ej: "F24-001")
    const partesSerie = invoiceData.NumSerieFactura ? invoiceData.NumSerieFactura.split('-') : [];
    let numeroFactura = invoiceData.NumSerieFactura;
    let serieFactura = "GEN"; 

    if (partesSerie.length > 1) {
        numeroFactura = partesSerie.pop() || ""; 
        serieFactura = partesSerie.join('-');    
    }

    // Preparamos el payload para Verifactu con el formato adecuado según la documentación oficial
    const payloadVerifacti = {
      serie: serieFactura,
      numero: numeroFactura,
      fecha_expedicion: fechaExpedicion,
      tipo_factura: invoiceData.TipoFactura || 'F1', // Factura normal
      descripcion: invoiceData.DescripcionOperacion || `Factura ${serieFactura}-${numeroFactura}`,
      nif: invoiceData.Destinatarios?.[0]?.NIF || invoiceData.IDEmisorFactura || "",
      nombre: invoiceData.Destinatarios?.[0]?.NombreRazon || "Cliente",
      lineas: invoiceData.Desglose?.map((d: any) => ({
        base_imponible: d.BaseImponible?.toString() || "0.00",
        tipo_impositivo: d.TipoImpositivo?.toString() || "0.00",
        cuota_repercutida: d.CuotaRepercutida?.toString() || "0.00",
        descripcion: d.Descripcion || "Servicio",
        impuesto: d.Impuesto || "01", // IVA por defecto
        calificacion_operacion: d.CalificacionOperacion || "S1", // Operación sujeta y no exenta
        clave_regimen: d.ClaveRegimen || "01" // Operación de régimen general
      })) || [],
      importe_total: invoiceData.ImporteTotal?.toString() || "0.00",
      nif_emisor: invoiceData.IDEmisorFactura || "",
      fecha_operacion: invoiceData.FechaOperacion, // Opcional: si la operación fue en otra fecha
      validar_destinatario: invoiceData.ValidarDestinatario ?? true, // Validar que el destinatario esté censado
    };

    console.log(`📤 [API] Enviando a Veri*factu factura ${serieFactura}-${numeroFactura}...`);
    
    // 4. Enviar a Verifacti (Usando nuestro cliente simulado o real)
    const resultado = await verifactiClient.crearFactura(payloadVerifacti);

    // 5. Si sale bien, guardamos el estado en Firebase
    if (resultado.success) {
      console.log(`✅ [API] Respuesta exitosa recibida.`);
      
      // Actualizamos el documento de la factura en Firestore con los datos oficiales
      await adminDb.collection('invoices').doc(invoiceId).update({
        estado: 'Emitido', // Cambiamos el estado general
        verifactuStatus: 'sent',
        verifactuQR: resultado.data?.url || resultado.data?.qr || resultado.data?.url_qr || '',
        verifactuCSV: resultado.data?.csv || '',
        verifactuChainHash: resultado.data?.huella || '',
        verifactuDate: new Date().toISOString()
      });
    } else {
      console.error(`❌ [API] Fallo al enviar: ${resultado.message}`);
    }

    return NextResponse.json(resultado);

  } catch (error: any) {
    console.error('💥 [API Error Crítico]:', error);
    // Devolvemos el mensaje exacto del error para que lo veas en el frontend
    return NextResponse.json({ success: false, message: error.message || "Error desconocido en servidor" }, { status: 500 });
  }
}