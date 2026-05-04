import { computed } from '@angular/core';
import {
  signalStore,
  withState,
  withComputed,
  withMethods,
  patchState,
} from '@ngrx/signals';
import { VariantaPerna } from '@core/models';


export interface ArticolCos {
 
  varianta: VariantaPerna;

 
  cantitate: number;
}


export interface StareCos {
  
  articole: ArticolCos[];

 
  esteVizibil: boolean;
}


const stareInitiala: StareCos = {
  articole: [],
  esteVizibil: false,
};


export const CosStore = signalStore(
 
  { providedIn: 'root' },


  withState(stareInitiala),

 
  withComputed((store) => ({

    
    numarArticole: computed(() =>
      store.articole().reduce(
        (total, articol) => total + articol.cantitate,
        0
      )
    ),

    
    pretTotal: computed(() =>
      store.articole().reduce(
        (total, articol) => total + (articol.varianta.pret * articol.cantitate),
        0
      )
    ),

    
    esteGol: computed(() => store.articole().length === 0),

  })),

  withMethods((store) => ({


    adaugaArticol(varianta: VariantaPerna): void {
      const articoleCurente = store.articole();

      
      const indexExistent = articoleCurente.findIndex(
        a => a.varianta.id === varianta.id
      );

      if (indexExistent >= 0) {
    
        const articoleActualizate = articoleCurente.map((articol, index) =>
          index === indexExistent
            ? { ...articol, cantitate: articol.cantitate + 1 }
            : articol
        );
        patchState(store, { articole: articoleActualizate });
      } else {
       
        patchState(store, {
          articole: [...articoleCurente, { varianta, cantitate: 1 }],
        });
      }
    },

 
    stergeArticol(variantaId: string): void {
      patchState(store, {
        articole: store.articole().filter(a => a.varianta.id !== variantaId),
      });
    },

   
    modificaCantitate(variantaId: string, cantitateNoua: number): void {
      if (cantitateNoua <= 0) {
        /** Cantitate 0 sau negativă = ștergere din coș */
        patchState(store, {
          articole: store.articole().filter(a => a.varianta.id !== variantaId),
        });
      } else {
        
        patchState(store, {
          articole: store.articole().map(a =>
            a.varianta.id === variantaId
              ? { ...a, cantitate: cantitateNoua }
              : a
          ),
        });
      }
    },

    
    golesteCosu(): void {
      patchState(store, { articole: [] });
    },

    
    comutaVizibilitate(): void {
      patchState(store, { esteVizibil: !store.esteVizibil() });
    },

    
    seteazaVizibilitate(vizibil: boolean): void {
      patchState(store, { esteVizibil: vizibil });
    },

  })),
);