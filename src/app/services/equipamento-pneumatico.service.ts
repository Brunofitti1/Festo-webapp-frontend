import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

/**
 * Interfaces para tipagem dos dados
 */
export interface EquipamentoPneumaticoRequest {
  nome: string;
  tipo: 'CILINDRO' | 'VALVULA' | 'COMPRESSOR' | 'SENSOR';
  modelo?: string;
  fabricante?: string;
  numeroSerie?: string;
  status: 'OPERANDO' | 'PARADO' | 'MANUTENCAO' | 'FALHA' | 'DESATIVADO';
  pressaoOperacao?: number;
  temperaturaOperacao?: number;
  ciclosRealizados?: number;
  dataInstalacao?: string;
  dataUltimaManutencao?: string;
  proximaManutencao?: string;
  intervaloManutencaoHoras?: number;
  observacoes?: string;
  ativo?: boolean;
}

export interface EquipamentoPneumaticoResponse {
  id: number;
  nome: string;
  tipo: string;
  modelo?: string;
  fabricante?: string;
  numeroSerie?: string;
  status: string;
  pressaoOperacao?: number;
  temperaturaOperacao?: number;
  ciclosRealizados?: number;
  dataInstalacao?: string;
  dataUltimaManutencao?: string;
  proximaManutencao?: string;
  intervaloManutencaoHoras?: number;
  observacoes?: string;
  ativo: boolean;
  createdAt: string;
  updatedAt?: string;
  diasParaProximaManutencao?: number;
  statusSaude: 'OTIMO' | 'BOM' | 'ATENCAO' | 'CRITICO';
  scoreConfiabilidade: number;
  alertaAtivo?: boolean;
  ultimasLeituras?: any[];
  ultimasManutencoes?: any[];
}

/**
 * Serviço para operações de equipamentos pneumáticos
 */
@Injectable({
  providedIn: 'root',
})
export class EquipamentoPneumaticoService {
  private readonly baseUrl = `${
    environment.apiUrl || 'http://localhost:8080'
  }/api/v1/equipamentos`;

  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  constructor(private http: HttpClient) {}

  /**
   * Buscar todos os equipamentos ativos
   */
  buscarTodosEquipamentos(): Observable<EquipamentoPneumaticoResponse[]> {
    return this.http.get<EquipamentoPneumaticoResponse[]>(this.baseUrl);
  }

  /**
   * Buscar equipamento por ID
   */
  buscarEquipamentoPorId(
    id: number
  ): Observable<EquipamentoPneumaticoResponse> {
    return this.http.get<EquipamentoPneumaticoResponse>(
      `${this.baseUrl}/${id}`
    );
  }

  /**
   * Criar novo equipamento
   */
  criarEquipamento(
    equipamento: EquipamentoPneumaticoRequest
  ): Observable<EquipamentoPneumaticoResponse> {
    return this.http.post<EquipamentoPneumaticoResponse>(
      this.baseUrl,
      equipamento,
      this.httpOptions
    );
  }

  /**
   * Atualizar equipamento existente
   */
  atualizarEquipamento(
    id: number,
    equipamento: EquipamentoPneumaticoRequest
  ): Observable<EquipamentoPneumaticoResponse> {
    return this.http.put<EquipamentoPneumaticoResponse>(
      `${this.baseUrl}/${id}`,
      equipamento,
      this.httpOptions
    );
  }

  /**
   * Desativar equipamento
   */
  desativarEquipamento(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * Buscar equipamentos com manutenção vencida
   */
  buscarEquipamentosComManutencaoVencida(): Observable<
    EquipamentoPneumaticoResponse[]
  > {
    return this.http.get<EquipamentoPneumaticoResponse[]>(
      `${this.baseUrl}/manutencao/vencida`
    );
  }

  /**
   * Utilitários para interface
   */
  getStatusColor(status: string): string {
    const colorMap: Record<string, string> = {
      OPERANDO: '#22c55e', // Verde
      PARADO: '#f59e0b', // Amarelo
      MANUTENCAO: '#3b82f6', // Azul
      FALHA: '#ef4444', // Vermelho
      DESATIVADO: '#6b7280', // Cinza
    };
    return colorMap[status] || '#6b7280';
  }

  getSaudeColor(statusSaude: string): string {
    const colorMap: Record<string, string> = {
      OTIMO: '#22c55e', // Verde
      BOM: '#84cc16', // Verde claro
      ATENCAO: '#f59e0b', // Amarelo
      CRITICO: '#ef4444', // Vermelho
    };
    return colorMap[statusSaude] || '#6b7280';
  }

  formatarData(data?: string): string {
    if (!data) return 'N/A';
    return new Date(data).toLocaleDateString('pt-BR');
  }
}
