export type StareConexiune = 'deconectat' | 'conectare' | 'conectat' | 'eroare';

export interface DateSenzor {

  timestamp: number;

  unghiCervical: number;

  unghiToracic: number;

  presiuneStanga: number;

  presiuneDreapta: number;

  scorPostura: number;
}

export type NivelAlerta = 'info' | 'avertizare' | 'critic';

export interface AlertaPostura {

  id: string;

  mesaj: string;

  nivel: NivelAlerta;

  timestamp: number;

  citita: boolean;
}

export interface ProfilUtilizator {

  codActivare: string;

  nume: string;

  email: string;

  dataConectare: Date;
}
