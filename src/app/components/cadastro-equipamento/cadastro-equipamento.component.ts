import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EquipamentoPneumaticoService } from '../../services/equipamento-pneumatico.service';

@Component({
  selector: 'app-cadastro-equipamento',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cadastro-equipamento.component.html',
  styleUrl: './cadastro-equipamento.component.scss',
})
export class CadastroEquipamentoComponent implements OnInit {
  equipamentoForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  tiposEquipamento = [
    { value: 'CILINDRO', label: 'Cilindro Pneumático' },
    { value: 'VALVULA', label: 'Válvula' },
    { value: 'COMPRESSOR', label: 'Compressor' },
    { value: 'SENSOR', label: 'Sensor' },
    { value: 'FILTRO', label: 'Filtro' },
    { value: 'REGULADOR', label: 'Regulador de Pressão' },
    { value: 'TUBO', label: 'Tubulação' },
  ];

  statusEquipamento = [
    { value: 'OPERANDO', label: 'Operando' },
    { value: 'PARADO', label: 'Parado' },
    { value: 'MANUTENCAO', label: 'Em Manutenção' },
    { value: 'FALHA', label: 'Em Falha' },
  ];

  constructor(
    private formBuilder: FormBuilder,
    private equipamentoService: EquipamentoPneumaticoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.equipamentoForm = this.formBuilder.group({
      nome: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
        ],
      ],
      tipo: ['', Validators.required],
      modelo: ['', [Validators.required, Validators.maxLength(50)]],
      fabricante: ['', [Validators.required, Validators.maxLength(50)]],
      numeroSerie: ['', [Validators.required, Validators.maxLength(50)]],
      status: ['OPERANDO', Validators.required],
      pressaoOperacao: [
        0,
        [Validators.required, Validators.min(0), Validators.max(20)],
      ],
      temperaturaOperacao: [
        20,
        [Validators.required, Validators.min(-50), Validators.max(200)],
      ],
      ciclosRealizados: [0, [Validators.min(0)]],
      dataInstalacao: [
        new Date().toISOString().split('T')[0],
        Validators.required,
      ],
      dataUltimaManutencao: [''],
      proximaManutencao: [''],
      intervaloManutencaoHoras: [
        720,
        [Validators.required, Validators.min(1), Validators.max(8760)],
      ],
      observacoes: ['', Validators.maxLength(500)],
    });
  }

  onSubmit(): void {
    if (this.equipamentoForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const formData = this.equipamentoForm.value;

      this.equipamentoService.criarEquipamento(formData).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.successMessage = 'Equipamento cadastrado com sucesso!';

          // Limpar o formulário após sucesso
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 2000);
        },
        error: (error: any) => {
          this.isLoading = false;
          console.error('Erro ao cadastrar equipamento:', error);
          this.errorMessage = 'Erro ao cadastrar equipamento. Tente novamente.';
        },
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.router.navigate(['/']);
  }

  markFormGroupTouched(): void {
    Object.keys(this.equipamentoForm.controls).forEach((key) => {
      const control = this.equipamentoForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.equipamentoForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.equipamentoForm.get(fieldName);

    if (field?.errors) {
      if (field.errors['required']) {
        return 'Este campo é obrigatório';
      }
      if (field.errors['minlength']) {
        return `Mínimo de ${field.errors['minlength'].requiredLength} caracteres`;
      }
      if (field.errors['maxlength']) {
        return `Máximo de ${field.errors['maxlength'].requiredLength} caracteres`;
      }
      if (field.errors['min']) {
        return `Valor mínimo: ${field.errors['min'].min}`;
      }
      if (field.errors['max']) {
        return `Valor máximo: ${field.errors['max'].max}`;
      }
    }

    return '';
  }
}
