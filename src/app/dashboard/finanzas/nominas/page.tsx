
'use client';

import { NominasPageContent } from './nominas-page-content';

export type Employee = {
    id: string;
    ownerId: string;
    name: string;
    email: string;
    position: string;
    nif: string;
    socialSecurityNumber: string;
    contractType: 'Indefinido' | 'Temporal' | 'Formación' | 'Prácticas';
    grossAnnualSalary: number;
};

export default function NominasPage() {
    return <NominasPageContent />;
}

