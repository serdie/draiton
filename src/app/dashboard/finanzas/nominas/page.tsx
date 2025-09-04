
'use client';

import { NominasPageContent } from './nominas-page-content';

export type Employee = {
    id: string;
    name: string;
    position: string;
    nif: string;
    socialSecurityNumber: string;
    contractType: 'Indefinido' | 'Temporal' | 'Formación' | 'Prácticas';
    grossAnnualSalary: number;
};

export default function NominasPage() {
    return <NominasPageContent />;
}

