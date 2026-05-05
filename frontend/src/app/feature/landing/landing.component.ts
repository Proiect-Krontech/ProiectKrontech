import { Component } from '@angular/core';
import { NavbarComponent } from './navbar/navbar.component';
import { HeroComponent } from './hero/hero.component';
import { FeaturesSectionComponent } from './features-section/features-section.component';
import { CumFunctioneazaComponent } from './cum-functioneaza/cum-functioneaza.component';
import { SizeSelectorComponent } from './size-selector/size-selector.component';
import { OrderFormComponent } from './order-form/order-form.component';
import { FooterComponent } from './footer/footer.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    NavbarComponent,
    HeroComponent,
    FeaturesSectionComponent,
    CumFunctioneazaComponent,
    SizeSelectorComponent,
    OrderFormComponent,
    FooterComponent,
  ],
  template: `
    <app-navbar />

    <main>
      <app-hero />
      <app-features-section />
      <app-cum-functioneaza />
      <app-size-selector />
      <app-order-form />
    </main>

    <app-footer />
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
    }

    main {
      margin-top: var(--navbar-inaltime);
    }
  `]
})
export class LandingComponent {}