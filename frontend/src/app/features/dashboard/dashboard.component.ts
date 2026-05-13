import {
  Component,
  signal,
  computed,
  inject,
  OnDestroy,
  ElementRef,
  viewChild,
  ApplicationRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConnectComponent } from './connect/connect.component';
import { ApiService, ArduinoStatus, DashboardData } from '@core/services/api.service';

declare const Chart: any;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ConnectComponent, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnDestroy {

  private readonly api = inject(ApiService);
  private readonly appRef = inject(ApplicationRef);

  readonly activationCode = signal<string | null>(null);
  readonly isConnected = computed(() => this.activationCode() !== null);

  readonly arduinoStatus = signal<ArduinoStatus | null>(null);
  readonly isOnline = computed(() => this.arduinoStatus()?.online ?? false);

  readonly currentPosture = computed(() => {
    const p = this.arduinoStatus()?.posture;
    if (p === 'good') return 'Corecta';
    if (p === 'bad') return 'Gresita';
    if (p === 'empty') return 'Gol';
    return 'Necunoscut';
  });

  readonly postureColor = computed(() => {
    const p = this.arduinoStatus()?.posture;
    if (p === 'good') return '#22c55e';
    if (p === 'bad') return '#ef4444';
    if (p === 'empty') return '#94a3b8';
    return '#94a3b8';
  });

  readonly weight = computed(() => this.arduinoStatus()?.kg ?? 0);
  readonly sensorF = computed(() => this.arduinoStatus()?.F ?? 0);
  readonly sensorS = computed(() => this.arduinoStatus()?.S ?? 0);
  readonly sensorL = computed(() => this.arduinoStatus()?.L ?? 0);
  readonly sensorR = computed(() => this.arduinoStatus()?.R ?? 0);
  readonly weightRef = computed(() => this.arduinoStatus()?.weight_ref ?? 60);
  readonly isBuzzerOn = computed(() => this.arduinoStatus()?.buzzer ?? false);
  readonly isCalibrated = computed(() => this.arduinoStatus()?.calibrated ?? false);
  readonly confidence = computed(() => this.arduinoStatus()?.confidence ?? 0);

  readonly frontPercent = computed(() => {
    const f = this.sensorF();
    const s = this.sensorS();
    const total = f + s;
    return total > 0 ? Math.round((f / total) * 100) : 50;
  });
  readonly backPercent = computed(() => 100 - this.frontPercent());

  readonly leftPercent = computed(() => {
    const l = this.sensorL();
    const r = this.sensorR();
    const total = l + r;
    return total > 0 ? Math.round((l / total) * 100) : 50;
  });
  readonly rightPercent = computed(() => 100 - this.leftPercent());

  readonly dashboardData = signal<DashboardData | null>(null);
  readonly dailyScore = computed(() => this.dashboardData()?.dailyScore ?? 0);
  readonly timeDistribution = computed(() => this.dashboardData()?.timeDistribution ?? { correct: 0, attention: 0, wrong: 0 });
  readonly quickStats = computed(() => this.dashboardData()?.quickStats ?? { totalTime: '0m', correctTime: '0m', attentionTime: '0m', wrongTime: '0m' });

  readonly dailyScoreMessage = computed(() => {
    const score = this.dailyScore();
    if (score >= 80) return 'Excelent! Continua tot asa!';
    if (score >= 60) return 'Bine! Continua asa!';
    if (score >= 40) return 'Necesita imbunatatire.';
    return 'Concentreaza-te pe postura.';
  });

  readonly isLoading = signal(false);
  readonly commandFeedback = signal('');
  readonly weightInput = signal(65);

  readonly isCalibrating = signal(false);
  readonly calibrationPhase = signal<1 | 2>(1);
  readonly calibrationCountdown = signal(0);
  private calibrationTimer: any = null;

  readonly historyChartCanvas = viewChild<ElementRef>('historyChartCanvas');
  readonly doughnutChartCanvas = viewChild<ElementRef>('doughnutChartCanvas');
  readonly weeklyChartCanvas = viewChild<ElementRef>('weeklyChartCanvas');

  private historyChartInstance: any = null;
  private doughnutChartInstance: any = null;
  private weeklyChartInstance: any = null;

  private statusInterval: any = null;
  private dashboardInterval: any = null;

  onCodeValidated(code: string): void {
    this.activationCode.set(code);
    this.fetchStatus();
    this.fetchDashboardData();

    this.statusInterval = setInterval(() => this.fetchStatus(), 2000);

    this.dashboardInterval = setInterval(() => this.fetchDashboardData(), 30000);
  }

  fetchStatus(): void {
    const code = this.activationCode();
    if (!code) return;

    this.api.getArduinoStatus(code).subscribe({
      next: (status) => {
        this.arduinoStatus.set(status);
        if (status.history && status.history.length > 0) {
          setTimeout(() => this.renderHistoryChart(status), 0);
        }
      },
      error: () => { /* silently retry on next interval */ },
    });
  }

  fetchDashboardData(): void {
    const code = this.activationCode();
    if (!code) return;

    this.api.getDashboardData(code).subscribe({
      next: (response) => {
        if (response.success) {
          this.dashboardData.set(response.data);
          setTimeout(() => {
            this.renderDoughnutChart(response.data);
            this.renderWeeklyChart(response.data);
          }, 0);
        }
      },
      error: () => { /* silently retry */ },
    });
  }

  sendCommand(cmd: string, value?: number): void {
    const code = this.activationCode();
    if (!code) return;

    this.api.sendCommand(code, cmd, value).subscribe({
      next: () => {
        const messages: Record<string, string> = {
          buzzer_on: 'Buzzer activat',
          buzzer_off: 'Buzzer dezactivat',
          calibrate: 'Calibrare initiata',
          reset_calibration: 'Calibrare resetata',
          set_weight: `Greutate referinta setata: ${value} kg`,
        };
        this.commandFeedback.set(messages[cmd] || 'Comanda trimisa');
        setTimeout(() => this.commandFeedback.set(''), 3000);
      },
      error: () => {
        this.commandFeedback.set('Eroare la trimiterea comenzii');
        setTimeout(() => this.commandFeedback.set(''), 3000);
      },
    });
  }

  setReferenceWeight(): void {
    this.sendCommand('set_weight', this.weightInput());
  }

  startCalibration(): void {
    this.isCalibrating.set(true);
    this.calibrationPhase.set(1);
    this.calibrationCountdown.set(15);
    this.appRef.tick();

    this.sendCommand('calibrate');

    this.runCountdown(15, () => {

      this.calibrationPhase.set(2);
      this.calibrationCountdown.set(0);
      this.appRef.tick();

      this.calibrationTimer = setInterval(() => {
        if (this.isCalibrated()) {
          this.stopCalibration();
          this.commandFeedback.set('Calibrare finalizata!');
          setTimeout(() => this.commandFeedback.set(''), 3000);
        }
        this.appRef.tick();
      }, 2000);
    });
  }

  private runCountdown(seconds: number, onDone: () => void): void {
    let remaining = seconds;
    this.calibrationCountdown.set(remaining);
    this.appRef.tick();

    this.calibrationTimer = setInterval(() => {
      remaining--;
      if (remaining > 0) {
        this.calibrationCountdown.set(remaining);
        this.appRef.tick();
      } else {
        clearInterval(this.calibrationTimer);
        this.calibrationTimer = null;
        onDone();
      }
    }, 1000);
  }

  stopCalibration(): void {
    if (this.calibrationTimer) {
      clearInterval(this.calibrationTimer);
      this.calibrationTimer = null;
    }
    this.isCalibrating.set(false);
    this.appRef.tick();
  }

  onWeightInputChange(value: string): void {
    this.weightInput.set(parseFloat(value) || 65);
  }

  renderHistoryChart(status: ArduinoStatus): void {
    const canvas = this.historyChartCanvas()?.nativeElement;
    if (!canvas) return;
    if (this.historyChartInstance) this.historyChartInstance.destroy();

    const ctx = canvas.getContext('2d');
    const history = status.history;

    const colors = history.map((h: any) => {
      if (h.p === 'good') return '#22c55e';
      if (h.p === 'bad') return '#ef4444';
      return '#f59e0b';
    });

    const scores = history.map((h: any) => {
      const total = h.F + h.S + h.L + h.R;
      if (total === 0) return 0;
      const nF = (h.F / total) * 100;
      const nS = (h.S / total) * 100;
      const nL = (h.L / total) * 100;
      const nR = (h.R / total) * 100;
      const dev = Math.abs(nF - 25) + Math.abs(nS - 25) + Math.abs(nL - 25) + Math.abs(nR - 25);
      return Math.max(0, Math.round(100 - (dev / 150) * 100));
    });

    const labels = history.map((h: any) => {
      const d = new Date(h.t);
      return d.getHours().toString().padStart(2, '0') + ':' +
             d.getMinutes().toString().padStart(2, '0');
    });

    this.historyChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Scor Postura',
          data: scores,
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.1)',
          fill: true,
          tension: 0.3,
          pointBackgroundColor: colors,
          pointRadius: 5,
          pointHoverRadius: 7,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, max: 100, title: { display: true, text: 'Scor' } },
          x: { title: { display: true, text: 'Ora' } },
        },
      },
    });
  }

  renderDoughnutChart(data: DashboardData): void {
    const canvas = this.doughnutChartCanvas()?.nativeElement;
    if (!canvas) return;
    if (this.doughnutChartInstance) this.doughnutChartInstance.destroy();

    const ctx = canvas.getContext('2d');
    const dist = data.timeDistribution;

    this.doughnutChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Corect', 'Atentie', 'Gresit'],
        datasets: [{
          data: [dist.correct, dist.attention, dist.wrong],
          backgroundColor: ['#22c55e', '#f59e0b', '#ef4444'],
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: { position: 'right', labels: { usePointStyle: true, padding: 16 } },
        },
      },
    });
  }

  renderWeeklyChart(data: DashboardData): void {
    const canvas = this.weeklyChartCanvas()?.nativeElement;
    if (!canvas) return;
    if (this.weeklyChartInstance) this.weeklyChartInstance.destroy();

    const ctx = canvas.getContext('2d');

    this.weeklyChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.weeklyHistory.map((d: any) => d.day),
        datasets: [{
          label: 'Scor',
          data: data.weeklyHistory.map((d: any) => d.score),
          backgroundColor: '#22c55e',
          borderRadius: 6,
          maxBarThickness: 40,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, max: 100 } },
      },
    });
  }

  disconnect(): void {
    this.activationCode.set(null);
    this.arduinoStatus.set(null);
    this.dashboardData.set(null);
    this.clearIntervals();
  }

  private clearIntervals(): void {
    if (this.statusInterval) { clearInterval(this.statusInterval); this.statusInterval = null; }
    if (this.dashboardInterval) { clearInterval(this.dashboardInterval); this.dashboardInterval = null; }
  }

  ngOnDestroy(): void {
    this.clearIntervals();
    this.stopCalibration();
    if (this.historyChartInstance) this.historyChartInstance.destroy();
    if (this.doughnutChartInstance) this.doughnutChartInstance.destroy();
    if (this.weeklyChartInstance) this.weeklyChartInstance.destroy();
  }
}
