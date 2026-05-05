import { Component, inject, signal } from '@angular/core';
import { CosStore } from '@core/store/cos.store';

@Component({
  selector: 'app-order-form',
  standalone: true,
  templateUrl: './order-form.component.html',
  styleUrl: './order-form.component.css',
})
export class OrderFormComponent {


  readonly store = inject(CosStore);


  readonly comandaPlasata = signal(false);


  cresceCantitate(variantaId: string, cantitateCurenta: number): void {
    this.store.modificaCantitate(variantaId, cantitateCurenta + 1);
  }


  scadeCantitate(variantaId: string, cantitateCurenta: number): void {
    this.store.modificaCantitate(variantaId, cantitateCurenta - 1);
  }


  stergeArticol(variantaId: string): void {
    this.store.stergeArticol(variantaId);
  }


  golesteCosu(): void {
    this.store.golesteCosu();
  }


  plaseazaComanda(): void {
    this.comandaPlasata.set(true);
    /** Golim coșul după plasare */
    this.store.golesteCosu();

   
    setTimeout(() => {
      this.comandaPlasata.set(false);
    }, 5000);
  }
}