

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
    workModality: 'Presencial' | 'Mixto' | 'Teletrabajo';
    paymentFrequency: 'Mensual' | 'Diario' | 'Semanal' | 'Quincenal' | 'Personalizar';
    grossAnnualSalary: number;
    proratedExtraPays: boolean;
    hireDate?: Date;
    avatar?: string;
    employeePortalActive?: boolean;
    employeePortalId?: string;
};

export type Fichaje = {
    id: string;
    employeeId: string;
    employeeName: string;
    ownerId: string;
    type: 'Entrada' | 'Salida' | 'Inicio Descanso' | 'Fin Descanso';
    timestamp: Date;
    requestChangeReason?: string;
    requestedTimestamp?: Date;
    requestStatus?: 'pending' | 'approved' | 'rejected';
    requestedAt?: Date;
    requesterId?: string;
    requesterName?: string;
}
