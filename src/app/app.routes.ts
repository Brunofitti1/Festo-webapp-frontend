import { Routes } from '@angular/router';
import { CadastroEquipamentoComponent } from './components/cadastro-equipamento/cadastro-equipamento.component';
import { AgendarManutencaoComponent } from './components/agendar-manutencao/agendar-manutencao.component';
import { EquipamentosDashboardComponent } from './components/equipamentos-dashboard/equipamentos-dashboard.component';

export const routes: Routes = [
  {
    path: '',
    component: EquipamentosDashboardComponent,
    title: 'Dashboard - Festo Digital Twin',
  },
  {
    path: 'cadastro-equipamento',
    component: CadastroEquipamentoComponent,
    title: 'Cadastrar Equipamento - Festo Digital Twin',
  },
  {
    path: 'agendar-manutencao',
    component: AgendarManutencaoComponent,
    title: 'Agendar Manutenção - Festo Digital Twin',
  },
];
