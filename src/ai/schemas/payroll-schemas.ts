

import { z } from 'genkit';

const AdditionalConceptSchema = z.object({
    concept: z.string().describe('The name of the additional concept (e.g., "Horas Extra", "Bonus Productividad").'),
    amount: z.number().describe('The monetary value of the concept.'),
});

export const GeneratePayrollInputSchema = z.object({
  employeeName: z.string().describe('Full name of the employee.'),
  nif: z.string().describe('NIF/NIE of the employee.'),
  socialSecurityNumber: z.string().describe('Social Security affiliation number of the employee.'),
  contractType: z.enum(['Indefinido', 'Temporal', 'Formación', 'Prácticas']).describe('Type of contract.'),
  professionalGroup: z.string().describe('Professional category or group.'),
  position: z.string().describe('El puesto del trabajador (ej. Comercial, Gerente).'),
  hireDate: z.string().optional().describe('La fecha de contratación del empleado.'),
  grossAnnualSalary: z.number().describe('The total gross annual salary of the employee.'),
  paymentPeriod: z.string().describe('The month and year for the payslip (e.g., "Julio 2024").'),
  companyName: z.string().describe('The legal name of the company.'),
  cif: z.string().describe('The CIF of the company.'),
  companyAddress: z.string().describe('La dirección fiscal de la empresa.'),
  contributionAccountCode: z.string().describe('The company\'s Social Security Contribution Account Code (Código de Cuenta de Cotización).'),
  additionalConcepts: z.array(AdditionalConceptSchema).optional().describe('An optional list of additional concepts to include in the accruals (devengos).'),
});
export type GeneratePayrollInput = z.infer<typeof GeneratePayrollInputSchema>;

const PayrollItemSchema = z.object({
    code: z.string().describe('Código del concepto (ej. "001").'),
    concept: z.string().describe('Nombre del concepto (ej. "Salario Base").'),
    quantity: z.number().describe('Unidades (ej. 30 días).'),
    price: z.number().describe('Precio por unidad (ej. salario diario).'),
    accrual: z.number().optional().describe('Importe del devengo (si aplica).'),
    deduction: z.number().optional().describe('Importe de la deducción (si aplica).'),
});

export const GeneratePayrollOutputSchema = z.object({
  header: z.object({
    companyName: z.string(),
    companyCif: z.string(),
    companyAddress: z.string(),
    contributionAccountCode: z.string(),
    employeeName: z.string(),
    employeeNif: z.string(),
    employeeSocialSecurityNumber: z.string(),
    employeeCategory: z.string(),
    employeeSeniority: z.string().describe('Fecha de antigüedad, ej: "20 NOV 23"'),
    paymentPeriod: z.string().describe('Periodo de liquidación detallado, ej: "Del 01/10/2024 al 31/10/2024"'),
    totalDays: z.number().describe('Total de días del periodo, ej. 30'),
  }),
  body: z.object({
    items: z.array(PayrollItemSchema).describe('Lista detallada de todos los conceptos de la nómina.'),
  }),
  summary: z.object({
    totalAccruals: z.number().describe('Total devengado.'),
    totalDeductions: z.number().describe('Total a deducir.'),
  }),
  netPay: z.number().describe('The final net amount to be paid to the employee (Líquido a percibir).'),
  contributionBases: z.object({
    commonContingencies: z.number().describe('Contribution base for common contingencies.'),
    professionalContingencies: z.number().describe('Contribution base for professional contingencies (AT y EP).'),
    irpfWithholding: z.number().describe('Base for IRPF withholding.'),
    irpfPercentage: z.number().describe('The IRPF withholding percentage applied.'),
  }),
});
export type GeneratePayrollOutput = z.infer<typeof GeneratePayrollOutputSchema>;


export const ReviewPayrollInputSchema = z.object({
    payrollData: GeneratePayrollOutputSchema.describe('The full JSON data of the generated payroll to be reviewed.'),
});
export type ReviewPayrollInput = z.infer<typeof ReviewPayrollInputSchema>;

const ExplanationStepSchema = z.object({
    concept: z.string().describe('The payroll concept being explained (e.g., "Salario Base", "Retención IRPF").'),
    explanation: z.string().describe('A clear and simple explanation of how this value was calculated or what it means.'),
});

export const ReviewPayrollOutputSchema = z.object({
  explanations: z.array(ExplanationStepSchema).describe('A list of step-by-step explanations for the payroll calculation.'),
});
export type ReviewPayrollOutput = z.infer<typeof ReviewPayrollOutputSchema>;
