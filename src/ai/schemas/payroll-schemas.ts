
import { z } from 'genkit';

export const GeneratePayrollInputSchema = z.object({
  employeeName: z.string().describe('Full name of the employee.'),
  nif: z.string().describe('NIF/NIE of the employee.'),
  socialSecurityNumber: z.string().describe('Social Security affiliation number of the employee.'),
  contractType: z.string().describe('Type of contract (e.g., Indefinido, Temporal).'),
  professionalGroup: z.string().describe('Professional category or group.'),
  grossAnnualSalary: z.number().describe('The total gross annual salary of the employee.'),
  paymentPeriod: z.string().describe('The month and year for the payslip (e.g., "Julio 2024").'),
  companyName: z.string().describe('The legal name of the company.'),
  cif: z.string().describe('The CIF of the company.'),
  contributionAccountCode: z.string().describe('The company\'s Social Security Contribution Account Code (Código de Cuenta de Cotización).'),
});
export type GeneratePayrollInput = z.infer<typeof GeneratePayrollInputSchema>;

const PayrollItemSchema = z.object({
    concept: z.string().describe('The concept of the accrual or deduction (e.g., "Salario Base", "Contingencias Comunes").'),
    amount: z.number().describe('The monetary amount for this concept.'),
});

export const GeneratePayrollOutputSchema = z.object({
  header: z.object({
    companyName: z.string(),
    employeeName: z.string(),
    period: z.string(),
  }),
  accruals: z.object({
    items: z.array(PayrollItemSchema).describe('List of salary accruals (devengos).'),
    total: z.number().describe('Total accrued amount.'),
  }),
  deductions: z.object({
    items: z.array(PayrollItemSchema).describe('List of deductions to be made.'),
    total: z.number().describe('Total amount to be deducted.'),
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
