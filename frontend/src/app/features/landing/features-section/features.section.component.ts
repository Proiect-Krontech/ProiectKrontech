
import { Component, signal } from '@angular/core';
import { Functionalitate } from '@core/models';

@Component({
  selector: 'app-features-section',
  standalone: true,
  templateUrl: './features-section.component.html',
  styleUrl: './features-section.component.css',
})
export class FeaturesSectionComponent {

  readonly functionalitati = signal<Functionalitate[]>([
    {
      icon: '📊',
      titlu: 'Monitorizare în Timp Real',
      descriere:
        'Senzorii integrați măsoară continuu poziția coloanei tale cervicale și toracice, oferindu-ți date precise despre postura ta în timpul somnului.',
    },
    {
      icon: '🔔',
      titlu: 'Alerte Inteligente',
      descriere:
        'Primești notificări instant pe telefon când poziția ta devine incorectă, ajutându-te să corectezi postura înainte de a apărea dureri.',
    },
    {
      icon: '📈',
      titlu: 'Statistici Detaliate',
      descriere:
        'Dashboard-ul îți arată grafice cu evoluția posturii tale în timp — pe ore, zile sau săptămâni — pentru a urmări progresul.',
    },
    {
      icon: '🌙',
      titlu: 'Confort Premium',
      descriere:
        'Spumă cu memorie de înaltă densitate care se adaptează formei capului și gâtului tău, oferind suport ergonomic optim.',
    },
    {
      icon: '📱',
      titlu: 'Conectare Simplă',
      descriere:
        'Conectează perna la dashboard-ul online folosind codul unic de activare. Fără aplicații suplimentare — totul funcționează din browser.',
    },
    {
      icon: '🔋',
      titlu: 'Autonomie Extinsă',
      descriere:
        'Bateria integrată oferă până la 30 de zile de monitorizare continuă cu o singură încărcare USB-C.',
    },
  ]);
}
