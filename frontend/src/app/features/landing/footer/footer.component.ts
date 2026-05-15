import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent {

  readonly anCurent = new Date().getFullYear();

  readonly linkuriNavigare = signal([
    { eticheta: 'Funcționalități', href: '#functionalitati' },
    { eticheta: 'Cum Funcționează', href: '#cum-functioneaza' },
    { eticheta: 'Mărimi & Prețuri', href: '#marimi' },
    { eticheta: 'Dashboard', href: '/dashboard' },
  ]);

  readonly linkuriLegale = signal([
    { eticheta: 'Termeni și Condiții', href: '#' },
    { eticheta: 'Politica de Confidențialitate', href: '#' },
    { eticheta: 'Politica de Cookies', href: '#' },
    { eticheta: 'ANPC', href: '#' },
  ]);
}
