export type MarimePerna = 'S' | 'M' | 'L' | 'XL';

export interface VariantaPerna {

  id: string;

  marime: MarimePerna;

  eticheta: string;

  dimensiuni: string;

  pret: number;

  inStoc: boolean;

  descriere: string;
}

export interface ComandaPerna {

  varianta: VariantaPerna;

  cantitate: number;

  codActivare?: string;
}

export interface Functionalitate {

  icon: string;

  titlu: string;

  descriere: string;
}

export interface PasFunctionare {

  numar: number;

  titlu: string;

  descriere: string;

  icon: string;
}
