/**
 * =============================================================
 * FIȘIER: dashboard.component.ts
 * ROL: Placeholder pentru pagina Dashboard (monitorizare postură).
 *      Va fi implementat complet în etapa 2.
 *      Acum afișează doar un mesaj de "în construcție".
 * =============================================================
 */

import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="container-pagina" style="text-align: center; padding-top: 6rem;">
      <h1 class="titlu-sectiune"></h1>
      <p class="subtitlu-sectiune">
      
      </p>
      <a routerLink="/"
         style="
           display: inline-block;
           padding: 0.75rem 2rem;
           background: var(--culoare-primara);
           color: white;
           border-radius: 0.5rem;
           text-decoration: none;
           font-weight: 600;
         ">
        Înapoi la pagina principală
      </a>
    </div>
  `
})
export class DashboardComponent {}
