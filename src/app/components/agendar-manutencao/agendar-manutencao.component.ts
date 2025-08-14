import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  EquipamentoPneumaticoService,
  EquipamentoPneumaticoResponse,
} from '../../services/equipamento-pneumatico.service';

interface TipoManutencao {
  value: string;
  label: string;
  descricao: string;
}

interface Prioridade {
  value: string;
  label: string;
  cor: string;
}

@Component({
  selector: 'app-agendar-manutencao',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './agendar-manutencao.component.html',
  styleUrl: './agendar-manutencao.component.scss',
})
export class AgendarManutencaoComponent implements OnInit {
  manutencaoForm!: FormGroup;
  equipamentos: EquipamentoPneumaticoResponse[] = [];
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  tiposManutencao: TipoManutencao[] = [
    {
      value: 'PREVENTIVA',
      label: 'Manutenção Preventiva',
      descricao: 'Manutenção programada para prevenção',
    },
    {
      value: 'PREDITIVA',
      label: 'Manutenção Preditiva',
      descricao: 'Baseada em condições do equipamento',
    },
    {
      value: 'CORRETIVA',
      label: 'Manutenção Corretiva',
      descricao: 'Reparo de falhas identificadas',
    },
    {
      value: 'EMERGENCIAL',
      label: 'Manutenção Emergencial',
      descricao: 'Reparo urgente de falhas críticas',
    },
  ];

  prioridades: Prioridade[] = [
    { value: 'BAIXA', label: 'Baixa', cor: '#22c55e' },
    { value: 'MEDIA', label: 'Média', cor: '#f59e0b' },
    { value: 'ALTA', label: 'Alta', cor: '#ef4444' },
    { value: 'CRITICA', label: 'Crítica', cor: '#dc2626' },
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private equipamentoService: EquipamentoPneumaticoService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.carregarEquipamentos();
  }

  private initializeForm(): void {
    this.manutencaoForm = this.fb.group({
      equipamentoId: ['', [Validators.required]],
      tipo: ['', [Validators.required]],
      prioridade: ['MEDIA', [Validators.required]],
      dataAgendamento: ['', [Validators.required]],
      horaAgendamento: ['', [Validators.required]],
      duracaoEstimada: [
        '',
        [Validators.required, Validators.min(1), Validators.max(24)],
      ],
      responsavel: ['', [Validators.required, Validators.minLength(3)]],
      descricao: ['', [Validators.required, Validators.minLength(10)]],
      observacoes: [''],
      notificarAntecedencia: [24, [Validators.min(1), Validators.max(168)]], // horas
    });
  }

  private carregarEquipamentos(): void {
    this.isLoading = true;
    this.equipamentoService.buscarTodosEquipamentos().subscribe({
      next: (equipamentos: EquipamentoPneumaticoResponse[]) => {
        this.equipamentos = equipamentos.filter((eq) => eq.ativo);
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Erro ao carregar equipamentos:', error);
        this.errorMessage = 'Erro ao carregar lista de equipamentos';
        this.isLoading = false;
      },
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.manutencaoForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.manutencaoForm.get(fieldName);
    if (!field || !field.errors) return '';

    const errors = field.errors;

    if (errors['required'])
      return `${this.getFieldLabel(fieldName)} é obrigatório`;
    if (errors['minlength'])
      return `${this.getFieldLabel(fieldName)} deve ter pelo menos ${
        errors['minlength'].requiredLength
      } caracteres`;
    if (errors['min'])
      return `${this.getFieldLabel(fieldName)} deve ser maior que ${
        errors['min'].min
      }`;
    if (errors['max'])
      return `${this.getFieldLabel(fieldName)} deve ser menor que ${
        errors['max'].max
      }`;

    return 'Campo inválido';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: Record<string, string> = {
      equipamentoId: 'Equipamento',
      tipo: 'Tipo de Manutenção',
      prioridade: 'Prioridade',
      dataAgendamento: 'Data de Agendamento',
      horaAgendamento: 'Hora de Agendamento',
      duracaoEstimada: 'Duração Estimada',
      responsavel: 'Responsável',
      descricao: 'Descrição',
      notificarAntecedencia: 'Notificar com Antecedência',
    };
    return labels[fieldName] || fieldName;
  }

  getEquipamentoNome(equipamentoId: string): string {
    const equipamento = this.equipamentos.find(
      (eq) => eq.id.toString() === equipamentoId
    );
    return equipamento ? `${equipamento.nome} (${equipamento.modelo})` : '';
  }

  getTipoDescricao(tipoValue: string): string {
    const tipo = this.tiposManutencao.find((t) => t.value === tipoValue);
    return tipo ? tipo.descricao : '';
  }

  getTipoLabel(tipoValue: string): string {
    const tipo = this.tiposManutencao.find((t) => t.value === tipoValue);
    return tipo ? tipo.label : '';
  }

  getPrioridadeCor(prioridadeValue: string): string {
    const prioridade = this.prioridades.find(
      (p) => p.value === prioridadeValue
    );
    return prioridade ? prioridade.cor : '#6b7280';
  }

  getPrioridadeLabel(prioridadeValue: string): string {
    const prioridade = this.prioridades.find(
      (p) => p.value === prioridadeValue
    );
    return prioridade ? prioridade.label : '';
  }

  getDataMinima(): string {
    return new Date().toISOString().split('T')[0];
  }

  onSubmit(): void {
    if (this.manutencaoForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const formData = this.manutencaoForm.value;

      // Simular agendamento de manutenção (aqui você implementaria a chamada para o backend)
      console.log('Dados da manutenção:', formData);

      setTimeout(() => {
        this.isLoading = false;
        this.successMessage = 'Manutenção agendada com sucesso!';

        // Redirecionar após sucesso
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 2000);
      }, 1000);
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.router.navigate(['/']);
  }

  markFormGroupTouched(): void {
    Object.keys(this.manutencaoForm.controls).forEach((key) => {
      const control = this.manutencaoForm.get(key);
      control?.markAsTouched();
    });
  }

  // Validação personalizada para data não pode ser no passado
  private dataFuturaValidator() {
    return (control: any) => {
      if (!control.value) return null;

      const dataAgendamento = new Date(control.value);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      return dataAgendamento >= hoje ? null : { dataPassado: true };
    };
  }
}
