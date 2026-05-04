import { Routes } from '@angular/router';

export const rpiectRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/landing/landing.component')
        .then(m => m.LandingComponent),
    title: 'Smart Pillow — Perna Inteligentă pentru Postura Ta'
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component')
        .then(m => m.DashboardComponent),
    title: 'Smart Pillow — Dashboard Monitorizare'
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];
