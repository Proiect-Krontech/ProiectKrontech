import { Component, inject, signal } from '@angular/core';
import { CosStore } from '@core/store/cos.store';
import { ApiService } from '@core/services/api.service';

@Component({
  selector: 'app-order-form',
  standalone: true,
  templateUrl: './order-form.component.html',
  styleUrl: './order-form.component.css',
})
export class OrderFormComponent {

  readonly store = inject(CosStore);

  private readonly api = inject(ApiService);

  readonly orderPlaced = signal(false);

  readonly isProcessing = signal(false);

  readonly activationCodes = signal<{ code: string; pillowSize: string; quantity: number }[]>([]);

  readonly orderError = signal('');

  increaseQuantity(variantaId: string, currentQuantity: number): void {
    this.store.modificaCantitate(variantaId, currentQuantity + 1);
  }

  decreaseQuantity(variantaId: string, currentQuantity: number): void {
    this.store.modificaCantitate(variantaId, currentQuantity - 1);
  }

  removeItem(variantaId: string): void {
    this.store.stergeArticol(variantaId);
  }

  clearCart(): void {
    this.store.golesteCosu();
  }

  async placeOrder(): Promise<void> {
    const items = this.store.articole();
    if (items.length === 0) return;

    this.isProcessing.set(true);
    this.orderError.set('');
    const generatedCodes: { code: string; pillowSize: string; quantity: number }[] = [];

    try {
      for (const item of items) {
        const response = await this.api
          .generateCode(item.varianta.marime)
          .toPromise();

        if (response && response.success) {
          generatedCodes.push({
            code: response.code,
            pillowSize: item.varianta.marime,
            quantity: item.cantitate,
          });
        }
      }

      this.activationCodes.set(generatedCodes);
      this.orderPlaced.set(true);
      this.store.golesteCosu();

    } catch (error) {
      this.orderError.set(
        'Eroare la procesarea comenzii. Asigura-te ca serverul este pornit si incearca din nou.'
      );
    } finally {
      this.isProcessing.set(false);
    }
  }

  newOrder(): void {
    this.orderPlaced.set(false);
    this.activationCodes.set([]);
  }
}
