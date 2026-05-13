import { Component, signal, output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '@core/services/api.service';

@Component({
  selector: 'app-connect',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './connect.component.html',
  styleUrl: './connect.component.css',
})
export class ConnectComponent {

  private readonly api = inject(ApiService);

  readonly codeInput = signal('');

  readonly errorMessage = signal('');

  readonly isLoading = signal(false);

  readonly codeValidated = output<string>();

  validateCode(): void {
    const code = this.codeInput().trim().toUpperCase();

    if (!code) {
      this.errorMessage.set('Te rugam introdu un cod de activare.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.api.validateCode(code).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.success) {

          this.codeValidated.emit(response.code);
        }
      },
      error: (err) => {
        this.isLoading.set(false);

        this.errorMessage.set(
          err.error?.message || 'Eroare de conexiune. Te rugam incearca din nou.'
        );
      },
    });
  }

  onCodeChange(value: string): void {
    this.codeInput.set(value);

    if (this.errorMessage()) {
      this.errorMessage.set('');
    }
  }
}
