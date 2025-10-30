

export type Employee = {
    id: string;
    ownerId: string;
    name: string;
    email: string;
    phone?: string;
    position: string;
    nif: string;
    socialSecurityNumber: string;
    contractType: 'Indefinido' | 'Temporal' | 'Formación' | 'Prácticas';
    paymentFrequency: 'Mensual' | 'Diario' | 'Semanal' | 'Quincenal' | 'Personalizar';
    grossAnnualSalary: number;
    hireDate?: Date;
    avatar?: string;
};

export type Fichaje = {
    id: string;
    employeeId: string;
    employeeName: string;
    ownerId: string;
    type: 'Entrada' | 'Salida';
    timestamp: Date;
}
