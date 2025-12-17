// src/lib/verifacti/api.ts

interface VerifactuResponse {
  success: boolean;
  message: string;
  data?: any;
}

class VerifactiClient {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    // En el futuro, aquí leerás la URL real de Veri*factu o de tu intermediario
    this.apiKey = process.env.VERIFACTU_API_KEY || 'test-key';
    this.baseUrl = process.env.VERIFACTU_API_URL || 'https://api.verifactu-simulado.es'; 
  }

  async crearFactura(payload: any): Promise<VerifactuResponse> {
    console.log("📡 [Simulación Veri*factu] Enviando factura:", payload.serie, payload.numero);

    // SIMULACIÓN: Hacemos una pausa para parecer que procesamos
    await new Promise(resolve => setTimeout(resolve, 1500));

    // SIMULACIÓN: Generamos datos falsos de éxito (Huella, QR, CSV)
    // Cuando tengas la API real, aquí harás un fetch() real.
    const mockHuella = "A1B2C3D4E5F67890-" + Date.now();
    const mockQr = "https://verifactu.gob.es/qr?h=" + mockHuella;
    
    // Devolvemos éxito
    return {
      success: true,
      message: "Factura registrada correctamente en el sistema Veri*factu (Simulación)",
      data: {
        huella: mockHuella,
        qr: mockQr,
        csv: "datos;de;la;factura;firmados",
        url_qr: mockQr // Por si acaso usamos este nombre de campo
      }
    };
  }
}

// Exportamos una instancia única (Singleton)
export const verifactiClient = new VerifactiClient();