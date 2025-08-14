import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';

import {
  EquipamentoPneumaticoService,
  EquipamentoPneumaticoRequest,
  EquipamentoPneumaticoResponse,
} from './equipamento-pneumatico.service';

describe('EquipamentoPneumaticoService', () => {
  let service: EquipamentoPneumaticoService;
  let httpMock: HttpTestingController;

  const mockEquipamento: EquipamentoPneumaticoResponse = {
    id: 1,
    nome: 'Cilindro Teste',
    tipo: 'CILINDRO',
    modelo: 'Test-Model',
    fabricante: 'Festo',
    numeroSerie: 'TST-001',
    status: 'OPERANDO',
    pressaoOperacao: 6.0,
    temperaturaOperacao: 25.0,
    ciclosRealizados: 1000,
    dataInstalacao: '2025-01-01T10:00:00',
    dataUltimaManutencao: '2025-07-01T10:00:00',
    proximaManutencao: '2025-09-01T10:00:00',
    intervaloManutencaoHoras: 720,
    observacoes: 'Teste',
    ativo: true,
    createdAt: '2025-01-01T10:00:00',
    updatedAt: '2025-07-01T10:00:00',
    diasParaProximaManutencao: 15,
    statusSaude: 'BOM',
    scoreConfiabilidade: 0.85,
    alertaAtivo: false,
  };

  const mockRequest: EquipamentoPneumaticoRequest = {
    nome: 'Cilindro Teste',
    tipo: 'CILINDRO',
    modelo: 'Test-Model',
    fabricante: 'Festo',
    numeroSerie: 'TST-001',
    status: 'OPERANDO',
    pressaoOperacao: 6.0,
    temperaturaOperacao: 25.0,
    ciclosRealizados: 1000,
    dataInstalacao: '2025-01-01T10:00:00',
    dataUltimaManutencao: '2025-07-01T10:00:00',
    proximaManutencao: '2025-09-01T10:00:00',
    intervaloManutencaoHoras: 720,
    observacoes: 'Teste',
    ativo: true,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EquipamentoPneumaticoService],
    });
    service = TestBed.inject(EquipamentoPneumaticoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch all equipamentos', () => {
    const mockEquipamentos = [mockEquipamento];

    service.buscarTodosEquipamentos().subscribe((equipamentos) => {
      expect(equipamentos).toEqual(mockEquipamentos);
    });

    const req = httpMock.expectOne('http://localhost:8080/api/v1/equipamentos');
    expect(req.request.method).toBe('GET');
    req.flush(mockEquipamentos);
  });

  it('should fetch equipamento by id', () => {
    const id = 1;

    service.buscarEquipamentoPorId(id).subscribe((equipamento) => {
      expect(equipamento).toEqual(mockEquipamento);
    });

    const req = httpMock.expectOne(
      `http://localhost:8080/api/v1/equipamentos/${id}`
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockEquipamento);
  });

  it('should create equipamento', () => {
    service.criarEquipamento(mockRequest).subscribe((equipamento) => {
      expect(equipamento).toEqual(mockEquipamento);
    });

    const req = httpMock.expectOne('http://localhost:8080/api/v1/equipamentos');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockRequest);
    req.flush(mockEquipamento);
  });

  it('should update equipamento', () => {
    const id = 1;

    service.atualizarEquipamento(id, mockRequest).subscribe((equipamento) => {
      expect(equipamento).toEqual(mockEquipamento);
    });

    const req = httpMock.expectOne(
      `http://localhost:8080/api/v1/equipamentos/${id}`
    );
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(mockRequest);
    req.flush(mockEquipamento);
  });

  it('should deactivate equipamento', () => {
    const id = 1;

    service.desativarEquipamento(id).subscribe((response) => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne(
      `http://localhost:8080/api/v1/equipamentos/${id}`
    );
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should fetch equipamentos with expired maintenance', () => {
    const mockEquipamentos = [mockEquipamento];

    service
      .buscarEquipamentosComManutencaoVencida()
      .subscribe((equipamentos) => {
        expect(equipamentos).toEqual(mockEquipamentos);
      });

    const req = httpMock.expectOne(
      'http://localhost:8080/api/v1/equipamentos/manutencao/vencida'
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockEquipamentos);
  });

  it('should return correct status color', () => {
    expect(service.getStatusColor('OPERANDO')).toBe('#22c55e');
    expect(service.getStatusColor('PARADO')).toBe('#f59e0b');
    expect(service.getStatusColor('MANUTENCAO')).toBe('#3b82f6');
    expect(service.getStatusColor('FALHA')).toBe('#ef4444');
    expect(service.getStatusColor('DESATIVADO')).toBe('#6b7280');
    expect(service.getStatusColor('UNKNOWN')).toBe('#6b7280');
  });

  it('should return correct health color', () => {
    expect(service.getSaudeColor('OTIMO')).toBe('#22c55e');
    expect(service.getSaudeColor('BOM')).toBe('#84cc16');
    expect(service.getSaudeColor('ATENCAO')).toBe('#f59e0b');
    expect(service.getSaudeColor('CRITICO')).toBe('#ef4444');
    expect(service.getSaudeColor('UNKNOWN')).toBe('#6b7280');
  });

  it('should format date correctly', () => {
    const testDate = '2025-01-01T10:00:00';
    const formatted = service.formatarData(testDate);
    expect(formatted).toBe('01/01/2025');
  });

  it('should return N/A for undefined date', () => {
    const formatted = service.formatarData(undefined);
    expect(formatted).toBe('N/A');
  });
});
