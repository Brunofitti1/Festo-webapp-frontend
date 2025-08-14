import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { CadastroEquipamentoComponent } from './cadastro-equipamento.component';
import { EquipamentoPneumaticoService } from '../../services/equipamento-pneumatico.service';

describe('CadastroEquipamentoComponent', () => {
  let component: CadastroEquipamentoComponent;
  let fixture: ComponentFixture<CadastroEquipamentoComponent>;
  let mockEquipamentoService: jasmine.SpyObj<EquipamentoPneumaticoService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const equipamentoServiceSpy = jasmine.createSpyObj(
      'EquipamentoPneumaticoService',
      ['criarEquipamento', 'buscarTodosEquipamentos', 'buscarEquipamentoPorId']
    );
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [CadastroEquipamentoComponent, ReactiveFormsModule],
      providers: [
        {
          provide: EquipamentoPneumaticoService,
          useValue: equipamentoServiceSpy,
        },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CadastroEquipamentoComponent);
    component = fixture.componentInstance;
    mockEquipamentoService = TestBed.inject(
      EquipamentoPneumaticoService
    ) as jasmine.SpyObj<EquipamentoPneumaticoService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with required fields', () => {
    expect(component.equipamentoForm.get('nome')).toBeTruthy();
    expect(component.equipamentoForm.get('tipo')).toBeTruthy();
    expect(component.equipamentoForm.get('modelo')).toBeTruthy();
    expect(component.equipamentoForm.get('fabricante')).toBeTruthy();
    expect(component.equipamentoForm.get('numeroSerie')).toBeTruthy();
    expect(component.equipamentoForm.get('pressaoOperacao')).toBeTruthy();
    expect(component.equipamentoForm.get('temperaturaOperacao')).toBeTruthy();
    expect(
      component.equipamentoForm.get('intervaloManutencaoHoras')
    ).toBeTruthy();
  });

  it('should validate required fields', () => {
    const form = component.equipamentoForm;

    // Form should be invalid when empty
    expect(form.valid).toBeFalsy();

    // Required fields should be invalid
    expect(form.get('nome')?.hasError('required')).toBeTruthy();
    expect(form.get('tipo')?.hasError('required')).toBeTruthy();
    expect(form.get('modelo')?.hasError('required')).toBeTruthy();
    expect(form.get('fabricante')?.hasError('required')).toBeTruthy();
    expect(form.get('numeroSerie')?.hasError('required')).toBeTruthy();
    expect(form.get('pressaoOperacao')?.hasError('required')).toBeTruthy();
    expect(form.get('temperaturaOperacao')?.hasError('required')).toBeTruthy();
    expect(form.get('dataInstalacao')?.hasError('required')).toBeTruthy();
    expect(form.get('intervaloManutencaoHoras')?.hasError('required')).toBeTruthy();
  });

  it('should submit form when valid', () => {
    const mockEquipamento = {
      id: 1,
      nome: 'Test Equipment',
      tipo: 'CILINDRO',
      modelo: 'Test Model',
      fabricante: 'Festo',
      numeroSerie: 'SN001',
      status: 'OPERANDO',
      pressaoOperacao: 6.0,
      temperaturaOperacao: 25.0,
      ciclosRealizados: 0,
      dataInstalacao: new Date().toISOString(),
      intervaloManutencaoHoras: 720,
      observacoes: 'Test observations',
      ativo: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      diasParaProximaManutencao: 30,
      statusSaude: 'OTIMO' as const,
      scoreConfiabilidade: 95,
      alertaAtivo: false,
      ultimasLeituras: [],
      ultimasManutencoes: []
    };

    mockEquipamentoService.criarEquipamento.and.returnValue(of(mockEquipamento));

    // Fill form with valid data
    component.equipamentoForm.patchValue({
      nome: 'Test Equipment',
      tipo: 'CILINDRO',
      modelo: 'Test Model',
      fabricante: 'Festo',
      numeroSerie: 'SN001',
      pressaoOperacao: 6.0,
      temperaturaOperacao: 25.0,
      intervaloManutencaoHoras: 720,
      observacoes: 'Test observations',
    });

    component.onSubmit();

    expect(mockEquipamentoService.criarEquipamento).toHaveBeenCalled();
    expect(component.isLoading).toBeFalsy();
    
    // Use setTimeout to wait for the navigation
    setTimeout(() => {
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    }, 2100);
  });

  it('should handle submission error', () => {
    const errorResponse = { error: 'Network error' };
    mockEquipamentoService.criarEquipamento.and.returnValue(throwError(errorResponse));

    // Fill form with valid data
    component.equipamentoForm.patchValue({
      nome: 'Test Equipment',
      tipo: 'CILINDRO',
      modelo: 'Test Model',
      fabricante: 'Festo',
      numeroSerie: 'SN001',
      pressaoOperacao: 6.0,
      temperaturaOperacao: 25.0,
      intervaloManutencaoHoras: 720,
    });

    component.onSubmit();

    expect(mockEquipamentoService.criarEquipamento).toHaveBeenCalled();
    expect(component.isLoading).toBeFalsy();
    expect(component.errorMessage).toContain('Erro ao cadastrar equipamento');
  });

  it('should navigate back to home when cancel is clicked', () => {
    component.onCancel();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should validate numeric fields', () => {
    const form = component.equipamentoForm;

    // Test negative values
    form.get('pressaoOperacao')?.setValue(-1);
    expect(form.get('pressaoOperacao')?.hasError('min')).toBeTruthy();

    form.get('temperaturaOperacao')?.setValue(-273.16); // Below absolute zero
    expect(form.get('temperaturaOperacao')?.hasError('min')).toBeTruthy();

    form.get('intervaloManutencaoHoras')?.setValue(0);
    expect(form.get('intervaloManutencaoHoras')?.hasError('min')).toBeTruthy();
  });

  it('should show success message after successful submission', (done) => {
    const mockEquipamento = {
      id: 1,
      nome: 'Test Equipment',
      tipo: 'CILINDRO',
      modelo: 'Test Model',
      fabricante: 'Festo',
      numeroSerie: 'SN001',
      status: 'OPERANDO',
      pressaoOperacao: 6.0,
      temperaturaOperacao: 25.0,
      ciclosRealizados: 0,
      dataInstalacao: new Date().toISOString(),
      intervaloManutencaoHoras: 720,
      observacoes: '',
      ativo: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      diasParaProximaManutencao: 30,
      statusSaude: 'OTIMO' as const,
      scoreConfiabilidade: 95,
      alertaAtivo: false,
      ultimasLeituras: [],
      ultimasManutencoes: []
    };

    mockEquipamentoService.criarEquipamento.and.returnValue(of(mockEquipamento));

    // Fill form with valid data
    component.equipamentoForm.patchValue({
      nome: 'Test Equipment',
      tipo: 'CILINDRO',
      modelo: 'Test Model',
      fabricante: 'Festo',
      numeroSerie: 'SN001',
      pressaoOperacao: 6.0,
      temperaturaOperacao: 25.0,
      intervaloManutencaoHoras: 720,
    });

    component.onSubmit();

    expect(component.successMessage).toContain(
      'Equipamento cadastrado com sucesso'
    );
    done();
  });

  it('should validate field errors correctly', () => {
    const form = component.equipamentoForm;
    
    // Test invalid field
    form.get('nome')?.markAsTouched();
    expect(component.isFieldInvalid('nome')).toBeTruthy();
    
    // Test valid field
    form.get('nome')?.setValue('Test Equipment');
    expect(component.isFieldInvalid('nome')).toBeFalsy();
    
    // Test error messages
    form.get('nome')?.setValue('');
    form.get('nome')?.markAsTouched();
    expect(component.getFieldError('nome')).toContain('obrigatório');
  });

  it('should handle form submission with invalid data', () => {
    spyOn(component, 'markFormGroupTouched');
    
    // Submit form with invalid data
    component.onSubmit();
    
    expect(component.markFormGroupTouched).toHaveBeenCalled();
    expect(mockEquipamentoService.criarEquipamento).not.toHaveBeenCalled();
  });
});
