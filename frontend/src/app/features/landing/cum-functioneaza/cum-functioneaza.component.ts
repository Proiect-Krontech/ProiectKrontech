/**
 * =============================================================
 * FIȘIER: cum-functioneaza.component.ts
 * ROL: Secțiunea "Cum Funcționează" — explică în 4 pași simpli
 *      cum se folosește perna inteligentă.
 *      Afișează un timeline/stepper vizual cu pașii:
 *      1. Alege mărimea → 2. Primești perna → 3. Conectează → 4. Monitorizează
 * =============================================================
 */

import { Component, signal } from '@angular/core';
import { PasFunctionare } from '@core/models';

@Component({
  selector: 'app-cum-functioneaza',
  standalone: true,
  templateUrl: './cum-functioneaza.component.html',
  styleUrl: './cum-functioneaza.component.css',
})
export class CumFunctioneazaComponent {

  readonly pasiFunctionare = signal<PasFunctionare[]>([
    {
      numar: 1,
      icon: '📏',
      titlu: 'Alege Mărimea',
      descriere:
        'Selectează dimensiunea potrivită pentru tine — S, M, L sau XL. Fiecare mărime este optimizată pentru diferite tipuri de corp.',
    },
    {
      numar: 2,
      icon: '📦',
      titlu: 'Primești Perna',
      descriere:
        'Livrare gratuită în 2-3 zile lucrătoare. În cutie vei găsi perna, cablul de încărcare USB-C și codul unic de activare.',
    },
    {
      numar: 3,
      icon: '🔑',
      titlu: 'Conectează cu Codul',
      descriere:
        'Accesează dashboard-ul online și introdu codul de activare din cutie. Perna se conectează automat prin WiFi.',
    },
    {
      numar: 4,
      icon: '📊',
      titlu: 'Monitorizează Postura',
      descriere:
        'Urmărește în timp real scorul posturii tale, primește alerte inteligente și consultă statisticile zilnice, săptămânale și lunare.',
    },
  ]);
}
