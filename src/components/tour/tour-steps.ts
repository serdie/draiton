
export type TourStep = {
  id: string;
  title: string;
  content: string;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
};

export const tourStepsBase: TourStep[] = [
  {
    id: "tour-logo",
    title: "Bienvenido a GestorIA",
    content: "¡Empecemos un rápido recorrido por la plataforma! Este es el logo, siempre te llevará al escritorio principal.",
    side: "right",
    align: "start",
  },
  {
    id: "tour-escritorio",
    title: "Escritorio Principal",
    content: "Aquí tendrás una visión general de tu negocio, con resúmenes financieros y actividad reciente.",
    side: "right",
    align: "start",
  },
  {
    id: "tour-finanzas",
    title: "Módulo de Finanzas",
    content: "Gestiona facturas, gastos, impuestos y nóminas. Todo tu control financiero en un solo lugar.",
     side: "right",
    align: "start",
  },
  {
    id: "tour-operaciones",
    title: "Módulo de Operaciones",
    content: "Organiza tus proyectos, tareas, clientes y registra las horas de trabajo de tu equipo.",
    side: "right",
    align: "start",
  },
   {
    id: "tour-perfil",
    title: "Tu Perfil",
    content: "Desde aquí puedes acceder a la configuración de tu cuenta, cambiar de plan o cerrar la sesión.",
    side: "bottom",
    align: "end",
  },
];


export const tourStepsPro: TourStep[] = [
    {
        id: "tour-ia",
        title: "Herramientas de IA",
        content: "Potencia tu negocio con inteligencia artificial. Crea contenido de marketing, analiza tu web y mucho más.",
        side: "right",
        align: "start",
    },
];

export const tourStepsFree: TourStep[] = [
    {
        id: "tour-upgrade",
        title: "Mejora tu Plan",
        content: "Algunas funcionalidades avanzadas requieren un plan superior. ¡Explora los beneficios de Pro y Empresa!",
        side: "top",
        align: "center",
    },
]


export const tourStepsAdmin: TourStep[] = [
    {
        id: "tour-admin",
        title: "Panel de Administración",
        content: "Desde aquí puedes gestionar usuarios, ver analíticas y configurar aspectos globales de la aplicación.",
        side: "right",
        align: "start"
    }
]
