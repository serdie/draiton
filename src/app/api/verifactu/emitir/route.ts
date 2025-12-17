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
    const fechaExpedicion = invoiceData.FechaExpedicionFactura 
      ? invoiceData.FechaExpedicionFactura.split('-').reverse().join('-') 
      : new Date().toLocaleDateString('es-ES').replace(/\//g, '-');

    // Lógica para separar serie y número si vienen juntos (Ej: "F24-001")
    const partesSerie = invoiceData.NumSerieFactura ? invoiceData.NumSerieFactura.split('-') : [];
    let numeroFactura = invoiceData.NumSerieFactura;
    let serieFactura = "GEN"; 

    if (partesSerie.length > 1) {
        numeroFactura = partesSerie.pop() || ""; 
        serieFactura = partesSerie.join('-');    
    }

    const payloadVerifacti = {
      serie: serieFactura,
      numero: numeroFactura,
      fecha_expedicion: fechaExpedicion,
      tipo_factura: 'F1', // Factura normal
      descripcion: invoiceData.DescripcionOperacion,
      nif_emisor: invoiceData.IDEmisorFactura, 
      nif: invoiceData.Destinatarios?.[0]?.NIF || "",
      nombre: invoiceData.Destinatarios?.[0]?.NombreRazon || "",
      direccion: invoiceData.Destinatarios?.[0]?.Domicilio || "",
      cod_postal: invoiceData.Destinatarios?.[0]?.CodigoPostal || "",
      municipio: invoiceData.Destinatarios?.[0]?.Municipio || "",
      provincia: invoiceData.Destinatarios?.[0]?.Provincia || "",
      lineas: invoiceData.Desglose.map((d: any) => ({
        base_imponible: d.BaseImponible,
        tipo_impositivo: d.TipoImpositivo,
        cuota_repercutida: d.CuotaRepercutida,
      })),
      importe_total: invoiceData.ImporteTotal
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
        verifactuQR: resultado.data?.qr || resultado.data?.url_qr || '', 
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