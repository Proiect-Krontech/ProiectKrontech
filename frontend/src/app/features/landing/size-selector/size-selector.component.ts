import { Component, signal, computed, inject } from '@angular/core';
import { VariantaPerna, MarimePerna } from '@core/models';
import { CosStore } from '@core/store/cos.store';

@Component({
  selector: 'app-size-selector',
  standalone: true,
  templateUrl: './size-selector.component.html',
  styleUrl: './size-selector.component.css',
})
export class SizeSelectorComponent {


  readonly cosStore = inject(CosStore);

  readonly variante = signal<VariantaPerna[]>([
    {
      id: 'perna-s',
      marime: 'S',
      eticheta: 'Small',
      dimensiuni: '40 x 40 cm',
      pret: 280,
      inStoc: true,
      descriere: 'Ideală pentru copii si adolescenți. Forma compactă, aceiasi senzori de performanță.',
    },
    {
      id: 'perna-m',
      marime: 'M',
      eticheta: 'Medium',
      dimensiuni: '45 x 45 cm',
      pret: 300,
      inStoc: true,
      descriere: 'Cea mai populară alegere. Potrivită pentru majoritatea adulților cu greutate sub 80kg.',
    },
    {
      id: 'perna-l',
      marime: 'L',
      eticheta: 'Large',
      dimensiuni: '50 x 50 cm',
      pret: 320,
      inStoc: true,
      descriere: 'Suport suplimentar pentru persoane cu greutate peste 80kg. Confort premium extins.',
    },
    {
      id: 'perna-xl',
      marime: 'XL',
      eticheta: 'Extra Large',
      dimensiuni: '55 x 55 cm',
      pret: 340,
      inStoc: true,
      descriere: 'Dimensiune maximă pentru confort superior.',
    },
  ]);


  readonly marimeSelectata = signal<MarimePerna>('M');


  readonly variantaSelectata = computed(() => {
    return this.variante().find(v => v.marime === this.marimeSelectata());
  });


  selecteazaMarime(marime: MarimePerna): void {
    const varianta = this.variante().find(v => v.marime === marime);
    if (varianta && varianta.inStoc) {
      this.marimeSelectata.set(marime);
    }
  }

  
  esteSelectata(marime: MarimePerna): boolean {
    return this.marimeSelectata() === marime;
  }


  adaugaInCos(): void {
    const varianta = this.variantaSelectata();
    if (varianta) {
      this.cosStore.adaugaArticol(varianta);
      this.cosStore.seteazaVizibilitate(true);
    }
  }
}