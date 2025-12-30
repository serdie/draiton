'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, LifeBuoy, MessageCircle, Headset } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FaqItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

const faqData: FaqItem[] = [
  {
    id: 1,
    question: "¿Qué es Draiton y cómo puede ayudar a mi negocio?",
    answer: "Draiton es una plataforma integral de gestión empresarial que combina herramientas de finanzas, marketing, operaciones y recursos humanos con inteligencia artificial. Nuestra solución está diseñada específicamente para autónomos y pymes que buscan optimizar su tiempo, reducir errores y crecer de forma sostenible. Con Draiton, puedes gestionar facturas, gastos, proyectos, clientes y empleados desde una única interfaz intuitiva.",
    category: "General"
  },
  {
    id: 2,
    question: "¿Es Draiton adecuado para mi tipo de negocio?",
    answer: "Draiton está diseñado para adaptarse a una amplia variedad de negocios, desde autónomos individuales hasta pequeñas empresas con múltiples empleados. Ya seas un profesional liberal, un pequeño comercio, una consultoría o una empresa de servicios, nuestra plataforma se adapta a tus necesidades específicas. Ofrecemos diferentes planes que se escalan según las funcionalidades que necesites.",
    category: "General"
  },
  {
    id: 3,
    question: "¿Cómo garantiza Draiton la seguridad de mis datos?",
    answer: "La seguridad de tus datos es nuestra máxima prioridad. Utilizamos cifrado de nivel bancario para proteger tu información, almacenamiento en servidores europeos que cumplen con la normativa GDPR, y seguimos las mejores prácticas de seguridad informática. Además, realizamos copias de seguridad regulares y auditorías de seguridad para garantizar la integridad de tus datos en todo momento.",
    category: "Seguridad"
  },
  {
    id: 4,
    question: "¿Puedo importar mis datos desde otros sistemas?",
    answer: "Sí, ofrecemos herramientas de migración que te permiten importar tus datos desde la mayoría de los sistemas de gestión comunes. Soportamos importación desde archivos CSV, Excel y conexiones directas con muchas plataformas populares. Nuestro equipo de soporte te guiará durante todo el proceso para asegurar una transición sin problemas.",
    category: "Funcionalidades"
  },
  {
    id: 5,
    question: "¿Cómo se integra Draiton con la facturación electrónica Verifactu?",
    answer: "Draiton se integra completamente con el sistema Verifactu de la Agencia Tributaria, permitiéndote emitir facturas electrónicas que cumplen con todos los requisitos legales. Las facturas se registran automáticamente en el sistema de la AEAT, y puedes acceder a tu historial completo de facturación electrónica en cualquier momento. Esta integración garantiza el cumplimiento normativo y te ahorra tiempo en trámites burocráticos.",
    category: "Facturación"
  },
  {
    id: 6,
    question: "¿Qué herramientas de marketing con IA ofrece Draiton?",
    answer: "Nuestra suite de marketing con IA incluye generación automática de contenido para redes sociales y correos electrónicos, análisis de audiencia para optimizar tus campañas, sugerencias de hashtags y mejores momentos para publicar, y herramientas de automatización que programan y envían contenido de forma inteligente. La IA aprende de tus interacciones pasadas para mejorar continuamente las recomendaciones.",
    category: "Marketing"
  },
  {
    id: 7,
    question: "¿Cómo funciona el control horario y la gestión de empleados?",
    answer: "Nuestro sistema de control horario permite a los empleados fichar desde su dispositivo móvil con geolocalización y verificación por foto. Puedes gestionar turnos, pausas, vacaciones y ausencias desde una interfaz centralizada. El sistema cumple con la legislación laboral vigente y genera informes detallados para la nómina y la administración.",
    category: "Recursos Humanos"
  },
  {
    id: 8,
    question: "¿Puedo personalizar los informes y análisis?",
    answer: "Sí, ofrecemos una amplia gama de informes predefinidos y la posibilidad de crear informes personalizados según tus necesidades específicas. Puedes seleccionar los datos que deseas incluir, el periodo de tiempo, el formato de visualización y programar envíos automáticos. Nuestra IA también puede generar insights personalizados basados en tus datos.",
    category: "Informes"
  },
  {
    id: 9,
    question: "¿Qué tipo de soporte ofrecen?",
    answer: "Ofrecemos soporte multicanal con atención personalizada. Dispones de chat en vivo dentro de la aplicación, correo electrónico prioritario para usuarios Pro y Empresa, y sesiones de onboarding personalizadas. Nuestro equipo de expertos no solo resuelve problemas técnicos, sino que también te ayuda a optimizar el uso de la plataforma para maximizar el valor para tu negocio.",
    category: "Soporte"
  },
  {
    id: 10,
    question: "¿Cómo se calculan los impuestos y se preparan las declaraciones?",
    answer: "Draiton calcula automáticamente tus obligaciones fiscales (IVA, IRPF, etc.) en tiempo real basándose en tus ingresos y gastos. La plataforma te avisa con anticipación de fechas límite, prepara borradores de declaraciones y te proporciona guías paso a paso para completar modelos oficiales. Nuestro asistente fiscal con IA puede responder preguntas específicas sobre tu situación fiscal.",
    category: "Fiscalidad"
  }
];

const categories = ["Todas", "General", "Facturación", "Marketing", "Recursos Humanos", "Informes", "Seguridad", "Soporte"];

export function FaqAccordion() {
  const [openId, setOpenId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  
  const toggleAccordion = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  const filteredFaqs = selectedCategory === "Todas" 
    ? faqData 
    : faqData.filter(faq => faq.category === selectedCategory);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          Preguntas Frecuentes
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Encuentra respuestas a las preguntas más comunes sobre Draiton. ¿No encuentras lo que buscas? Nuestro equipo de soporte está listo para ayudarte.
        </p>
      </div>

      <div className="mb-12">
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((category) => (
            <button
              key={category}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredFaqs.map((faq) => (
          <div 
            key={faq.id} 
            className="border rounded-xl overflow-hidden transition-all duration-200 hover:shadow-md"
          >
            <button
              className="flex justify-between items-center w-full p-6 text-left bg-background hover:bg-muted/50 transition-colors"
              onClick={() => toggleAccordion(faq.id)}
              aria-expanded={openId === faq.id}
            >
              <span className="text-lg font-medium text-foreground">{faq.question}</span>
              {openId === faq.id ? (
                <ChevronUp className="h-5 w-5 text-primary flex-shrink-0 ml-4" />
              ) : (
                <ChevronDown className="h-5 w-5 text-primary flex-shrink-0 ml-4" />
              )}
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                openId === faq.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="p-6 pt-0 text-muted-foreground border-t bg-muted/10">
                {faq.answer}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold mb-6">¿Todavía tienes preguntas?</h2>
        <p className="text-muted-foreground max-w-xl mx-auto mb-8">
          Nuestro equipo de expertos está listo para ayudarte. Contáctanos para resolver cualquier duda específica sobre cómo Draiton puede transformar tu negocio.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button size="lg" className="gap-2" asChild>
            <a href="/soporte">
              <MessageCircle className="h-5 w-5" />
              Chatear con soporte
            </a>
          </Button>
          <Button size="lg" variant="outline" className="gap-2" asChild>
            <a href="/tutoriales-video">
              <Headset className="h-5 w-5" />
              Video tutoriales
            </a>
          </Button>
          <Button size="lg" variant="secondary" className="gap-2" asChild>
            <a href="/centro-de-ayuda">
              <LifeBuoy className="h-5 w-5" />
              Centro de ayuda
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}