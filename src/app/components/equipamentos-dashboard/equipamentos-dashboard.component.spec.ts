import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

import { EquipamentosDashboardComponent } from './equipamentos-dashboard.component';
import {
  EquipamentoPneumaticoService,
  EquipamentoPneumaticoResponse,
} from '../../services/equipamento-pneumatico.service';

describe('EquipamentosDashboardComponent', () => {
  let component: EquipamentosDashboardComponent;
  let fixture: ComponentFixture<EquipamentosDashboardComponent>;
  let equipamentoService: jasmine.SpyObj<EquipamentoPneumaticoService>;

  const mockEquipamentos: EquipamentoPneumaticoResponse[] = [
    {
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
    },
  ];

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('EquipamentoPneumaticoService', [
      'buscarTodosEquipamentos',
      'buscarEquipamentosComManutencaoVencida',
      'getStatusColor',
      'getSaudeColor',
      'formatarData',
    ]);

    await TestBed.configureTestingModule({
      imports: [EquipamentosDashboardComponent, HttpClientTestingModule],
      providers: [{ provide: EquipamentoPneumaticoService, useValue: spy }],
    }).compileComponents();

    fixture = TestBed.createComponent(EquipamentosDashboardComponent);
    component = fixture.componentInstance;
    equipamentoService = TestBed.inject(
      EquipamentoPneumaticoService
    ) as jasmine.SpyObj<EquipamentoPneumaticoService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load equipamentos on init', () => {
    equipamentoService.buscarTodosEquipamentos.and.returnValue(
      of(mockEquipamentos)
    );
    equipamentoService.buscarEquipamentosComManutencaoVencida.and.returnValue(
      of([])
    );

    component.ngOnInit();

    expect(equipamentoService.buscarTodosEquipamentos).toHaveBeenCalled();
    expect(component.equipamentos).toEqual(mockEquipamentos);
    expect(component.loading).toBeFalse();
  });

  it('should handle error when loading equipamentos', () => {
    equipamentoService.buscarTodosEquipamentos.and.returnValue(
      throwError(() => new Error('Test error'))
    );
    equipamentoService.buscarEquipamentosComManutencaoVencida.and.returnValue(
      of([])
    );

    component.ngOnInit();

    expect(component.error).toBe('Erro ao carregar dados dos equipamentos');
    expect(component.loading).toBeFalse();
  });

  it('should calculate statistics correctly', () => {
    component.equipamentos = mockEquipamentos;
    component['calcularEstatisticas']();

    expect(component.stats.totalEquipamentos).toBe(1);
    expect(component.stats.equipamentosOperando).toBe(1);
    expect(component.stats.percentualConfiabilidade).toBe(85);
  });

  it('should filter critical equipamentos', () => {
    const criticalEquipamento = {
      ...mockEquipamentos[0],
      statusSaude: 'CRITICO' as const,
    };
    component.equipamentos = [criticalEquipamento];

    const critical = component.getEquipamentosCriticos();

    expect(critical.length).toBe(1);
    expect(critical[0].statusSaude).toBe('CRITICO');
  });

  it('should filter attention equipamentos', () => {
    const attentionEquipamento = {
      ...mockEquipamentos[0],
      statusSaude: 'ATENCAO' as const,
    };
    component.equipamentos = [attentionEquipamento];

    const attention = component.getEquipamentosAtencao();

    expect(attention.length).toBe(1);
    expect(attention[0].statusSaude).toBe('ATENCAO');
  });

  it('should get progress width', () => {
    const width = component.getProgressWidth(0.75);
    expect(width).toBe('75%');
  });

  it('should get progress color based on score', () => {
    expect(component.getProgressColor(0.9)).toBe('#22c55e'); // Verde
    expect(component.getProgressColor(0.7)).toBe('#84cc16'); // Verde claro
    expect(component.getProgressColor(0.5)).toBe('#f59e0b'); // Amarelo
    expect(component.getProgressColor(0.3)).toBe('#ef4444'); // Vermelho
  });

  it('should reload data when carregarDados is called', () => {
    equipamentoService.buscarTodosEquipamentos.and.returnValue(
      of(mockEquipamentos)
    );
    equipamentoService.buscarEquipamentosComManutencaoVencida.and.returnValue(
      of([])
    );

    component.carregarDados();

    expect(equipamentoService.buscarTodosEquipamentos).toHaveBeenCalled();
    expect(
      equipamentoService.buscarEquipamentosComManutencaoVencida
    ).toHaveBeenCalled();
  });

  it('should clean up subscriptions on destroy', () => {
    spyOn(component['destroy$'], 'next');
    spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(component['destroy$'].next).toHaveBeenCalled();
    expect(component['destroy$'].complete).toHaveBeenCalled();
  });
});
