import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = `http://${window.location.hostname}:3000/api`;

export interface CodeGenerateResponse {
  success: boolean;
  code: string;
  message: string;
}

export interface CodeValidateResponse {
  success: boolean;
  code: string;
  pillowSize: string;
  message: string;
}

export interface ArduinoStatus {
  online: boolean;
  lastSeen: number | null;
  posture: string;
  kg: number;
  F: number;
  S: number;
  L: number;
  R: number;
  buzzer: boolean;
  calibrated: boolean;
  calibratedOnce: boolean;
  weight_ref: number;
  state_duration: number;
  confidence: number;
  hasPendingCmd: boolean;
  pendingCmd: any;
  history: HistoryPoint[];
}

export interface HistoryPoint {
  t: number;
  kg: number;
  F: number;
  S: number;
  L: number;
  R: number;
  p: string;
}

export interface SensorReading {
  activationCode: string;
  sensors: { fl: number; fr: number; bl: number; br: number };
  weight: number;
  posture: 'correct' | 'attention' | 'wrong';
  score: number;
  timestamp: string;
}

export interface DailyChartPoint {
  hour: string;
  correct: number;
  attention: number;
  wrong: number;
}

export interface TimeDistribution {
  correct: number;
  attention: number;
  wrong: number;
}

export interface QuickStats {
  totalTime: string;
  correctTime: string;
  attentionTime: string;
  wrongTime: string;
}

export interface WeeklyHistoryPoint {
  date: string;
  day: string;
  score: number;
}

export interface DashboardData {
  currentPosture: SensorReading | null;
  dailyChart: DailyChartPoint[];
  timeDistribution: TimeDistribution;
  dailyScore: number;
  quickStats: QuickStats;
  weeklyHistory: WeeklyHistoryPoint[];
  pillowSize: string;
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardData;
}

export interface CommandResponse {
  ok: boolean;
  queued: { cmd: string; value?: number };
}

@Injectable({ providedIn: 'root' })
export class ApiService {

  private readonly http = inject(HttpClient);

  generateCode(pillowSize: string): Observable<CodeGenerateResponse> {
    return this.http.post<CodeGenerateResponse>(
      `${API_URL}/codes/generate`,
      { pillowSize }
    );
  }

  validateCode(code: string): Observable<CodeValidateResponse> {
    return this.http.post<CodeValidateResponse>(
      `${API_URL}/codes/validate`,
      { code }
    );
  }

  getArduinoStatus(code: string): Observable<ArduinoStatus> {
    return this.http.get<ArduinoStatus>(
      `${API_URL}/status/${code}`
    );
  }

  sendCommand(code: string, cmd: string, value?: number): Observable<CommandResponse> {
    return this.http.post<CommandResponse>(
      `${API_URL}/cmd/${code}`,
      { cmd, value }
    );
  }

  getDashboardData(code: string): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(
      `${API_URL}/dashboard/${code}`
    );
  }
}
