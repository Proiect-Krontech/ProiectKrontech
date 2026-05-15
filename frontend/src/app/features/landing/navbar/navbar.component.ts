import {
  Component,
  signal,
  computed,
  inject,
  HostListener,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { CosStore } from '@core/store/cos.store';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {


  readonly cosStore = inject(CosStore);

 
  readonly esteScrollat = signal(false);

 
  readonly meniuDeschis = signal(false);

 
  readonly claseNavbar = computed(() =>
    this.esteScrollat()
      ? 'navbar navbar--scrollat'
      : 'navbar'
  );

  
  readonly linkuriNavigare = signal([
    { eticheta: 'Functionalitati', ancora: '#functionalitati' },
    { eticheta: 'Cum Functioneaza', ancora: '#cum-functioneaza' },
    { eticheta: 'Marimi', ancora: '#marimi' },
  ]);


  @HostListener('window:scroll')
  laScroll(): void {
    this.esteScrollat.set(window.scrollY > 20);
  }


  comutaMeniu(): void {
    this.meniuDeschis.update(deschis => !deschis);
  }


  inchideMeniu(): void {
    this.meniuDeschis.set(false);
  }
}