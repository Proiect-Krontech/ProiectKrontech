
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
        'Senzorii integrați măsoară continuu poziția coloanei tale în timp ce stai pe scaun, oferindu-ți date precise despre postura ta pe parcursul zilei.',
    },
    {
      icon: '🔔',
      titlu: 'Alerte Inteligente',
      descriere:
        'Un buzzer integrat în pernă te avertizează discret când poziția ta devine incorectă, ajutându-te să corectezi postura înainte de a apărea dureri de spate.',
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
        'Design ergonomic care se adaptează formei corpului tău, oferind suport optim pentru ședere îndelungată la birou sau acasă.',
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
        'Perna se alimentează printr-o baterie externă compactă, ușor de înlocuit sau reîncărcat prin USB-C.',
    },
  ]);
}
