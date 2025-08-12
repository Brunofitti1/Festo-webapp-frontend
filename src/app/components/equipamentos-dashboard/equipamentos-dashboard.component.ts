import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  EquipamentoPneumaticoService,
  EquipamentoPneumaticoResponse,
} from '../../services/equipamento-pneumatico.service';
import { Subject, takeUntil, interval } from 'rxjs';

interface DashboardStats {
  totalEquipamentos: number;
  equipamentosOperando: number;
  equipamentosParados: number;
  equipamentosManutencao: number;
  equipamentosFalha: number;
  manutencaoVencida: number;
  percentualConfiabilidade: number;
}

@Component({
  selector: 'app-equipamentos-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './equipamentos-dashboard.component.html',
  styleUrl: './equipamentos-dashboard.component.scss',
})
export class EquipamentosDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  equipamentos: EquipamentoPneumaticoResponse[] = [];
  equipamentosComManutencaoVencida: EquipamentoPneumaticoResponse[] = [];
  stats: DashboardStats = {
    totalEquipamentos: 0,
    equipamentosOperando: 0,
    equipamentosParados: 0,
    equipamentosManutencao: 0,
    equipamentosFalha: 0,
    manutencaoVencida: 0,
    percentualConfiabilidade: 0,
  };

  loading = true;
  error: string | null = null;

  constructor(private equipamentoService: EquipamentoPneumaticoService) {}

  ngOnInit(): void {
    this.carregarDados();

    // Atualizar dados a cada 30 segundos
    interval(30000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.carregarDados());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  carregarDados(): void {
    this.loading = true;
    this.error = null;

    // Carregar todos os equipamentos
    this.equipamentoService
      .buscarTodosEquipamentos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (equipamentos) => {
          this.equipamentos = equipamentos;
          this.calcularEstatisticas();
          this.loading = false;
        },
        error: (error) => {
          console.error('Erro ao carregar equipamentos:', error);
          this.error = 'Erro ao carregar dados dos equipamentos';
          this.loading = false;
        },
      });

    // Carregar equipamentos com manutenção vencida
    this.equipamentoService
      .buscarEquipamentosComManutencaoVencida()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (equipamentos) => {
          this.equipamentosComManutencaoVencida = equipamentos;
        },
        error: (error) => {
          console.error(
            'Erro ao carregar equipamentos com manutenção vencida:',
            error
          );
        },
      });
  }

  private calcularEstatisticas(): void {
    this.stats.totalEquipamentos = this.equipamentos.length;
    this.stats.equipamentosOperando = this.equipamentos.filter(
      (e) => e.status === 'OPERANDO'
    ).length;
    this.stats.equipamentosParados = this.equipamentos.filter(
      (e) => e.status === 'PARADO'
    ).length;
    this.stats.equipamentosManutencao = this.equipamentos.filter(
      (e) => e.status === 'MANUTENCAO'
    ).length;
    this.stats.equipamentosFalha = this.equipamentos.filter(
      (e) => e.status === 'FALHA'
    ).length;
    this.stats.manutencaoVencida = this.equipamentos.filter(
      (e) =>
        e.diasParaProximaManutencao !== undefined &&
        e.diasParaProximaManutencao < 0
    ).length;

    // Calcular percentual de confiabilidade médio
    if (this.equipamentos.length > 0) {
      const somaConfiabilidade = this.equipamentos.reduce(
        (sum, eq) => sum + eq.scoreConfiabilidade,
        0
      );
      this.stats.percentualConfiabilidade = Math.round(
        (somaConfiabilidade / this.equipamentos.length) * 100
      );
    } else {
      this.stats.percentualConfiabilidade = 0;
    }
  }

  getStatusColor(status: string): string {
    return this.equipamentoService.getStatusColor(status);
  }

  getSaudeColor(statusSaude: string): string {
    return this.equipamentoService.getSaudeColor(statusSaude);
  }

  formatarData(data?: string): string {
    return this.equipamentoService.formatarData(data);
  }

  getEquipamentosCriticos(): EquipamentoPneumaticoResponse[] {
    return this.equipamentos.filter(
      (e) => e.statusSaude === 'CRITICO' || e.status === 'FALHA'
    );
  }

  getEquipamentosAtencao(): EquipamentoPneumaticoResponse[] {
    return this.equipamentos.filter((e) => e.statusSaude === 'ATENCAO');
  }

  getProgressWidth(score: number): string {
    return `${score * 100}%`;
  }

  getProgressColor(score: number): string {
    if (score >= 0.8) return '#22c55e'; // Verde
    if (score >= 0.6) return '#84cc16'; // Verde claro
    if (score >= 0.4) return '#f59e0b'; // Amarelo
    return '#ef4444'; // Vermelho
  }
}
