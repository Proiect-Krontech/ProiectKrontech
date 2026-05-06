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
      dimensiuni: '40 x 30 cm',
      pret: 299,
      inStoc: true,
      descriere: 'Ideala pentru copii si adolescenti. Forma compacta, aceiasi senzori de performanta.',
    },
    {
      id: 'perna-m',
      marime: 'M',
      eticheta: 'Medium',
      dimensiuni: '50 x 40 cm',
      pret: 399,
      inStoc: true,
      descriere: 'Cea mai populara alegere. Potrivita pentru majoritatea adultilor cu greutate sub 80kg.',
    },
    {
      id: 'perna-l',
      marime: 'L',
      eticheta: 'Large',
      dimensiuni: '60 x 45 cm',
      pret: 479,
      inStoc: true,
      descriere: 'Suport suplimentar pentru persoane cu greutate peste 80kg. Confort premium extins.',
    },
    {
      id: 'perna-xl',
      marime: 'XL',
      eticheta: 'Extra Large',
      dimensiuni: '70 x 50 cm',
      pret: 549,
      inStoc: true,
      descriere: 'Dimensiune maxima pentru confort superior. Acoperire completa cap, gat si umeri.',
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