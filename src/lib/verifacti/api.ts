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
    this.apiKey = process.env.VERIFACTU_API_KEY || 'vf_test_NCnFbjyV/qxNO72Px4Gu2jaywBmDnzgIeBaNe2GydSY=';
    this.baseUrl = process.env.VERIFACTU_API_URL || 'https://api.verifacti.com';
  }

  async crearFactura(payload: any): Promise<VerifactuResponse> {
    console.log("📡 [Veri*factu API] Enviando factura:", payload.serie, payload.numero);

    try {
      const response = await fetch(`${this.baseUrl}/verifactu/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        console.error(`❌ [Veri*factu API] Error ${response.status}:`, result);

        // Manejo específico de errores según la documentación de Verifactu
        let errorMessage = '';

        // Si result es un objeto vacío o no tiene propiedades útiles, creamos un mensaje por defecto
        if (!result || Object.keys(result).length === 0) {
          errorMessage = `Error ${response.status} en la API de Verifactu: La respuesta está vacía o no es válida`;
        } else {
          errorMessage = result.message || `Error ${response.status} en la API de Verifactu`;

          if (response.status === 400) {
            errorMessage = `Error de validación: ${result.error || result.message || 'Los datos de la factura no cumplen con los requisitos de Verifactu'}`;
          } else if (response.status === 401 || response.status === 403) {
            errorMessage = 'Error de autenticación: API Key inválida o sin permisos suficientes';
          } else if (response.status === 429) {
            errorMessage = 'Límite de peticiones excedido, inténtelo más tarde';
          } else if (response.status === 500) {
            errorMessage = `Error interno del servidor de Verifactu: ${result.error || result.message || 'Error desconocido'}`;
          }
        }

        return {
          success: false,
          message: errorMessage
        };
      }

      console.log("✅ [Veri*factu API] Factura registrada correctamente:", result);

      // Verificamos que la respuesta contenga los campos esperados según la documentación
      if (!result || Object.keys(result).length === 0) {
        console.error("❌ [Veri*factu API] La respuesta está vacía:", result);
        return {
          success: false,
          message: "La API de Verifactu devolvió una respuesta vacía. Inténtalo de nuevo más tarde."
        };
      }

      if (!result.uuid || !result.estado || !result.qr || !result.url) {
        console.warn("⚠️ [Veri*factu API] La respuesta no contiene todos los campos esperados:", result);
      }

      return {
        success: true,
        message: result.message || "Factura registrada correctamente en el sistema Verifactu",
        data: {
          uuid: result.uuid,
          estado: result.estado,
          qr: result.qr,
          url: result.url,
          huella: result.huella
        }
      };
    } catch (error: any) {
      console.error("💥 [Veri*factu API] Error de red o conexión:", error);
      return {
        success: false,
        message: error.message || "Error de conexión con la API de Verifactu"
      };
    }
  }
}

// Exportamos una instancia única (Singleton)
export const verifactiClient = new VerifactiClient();