import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { EquipamentosDashboardComponent } from './components/equipamentos-dashboard/equipamentos-dashboard.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, EquipamentosDashboardComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'Festo Digital Twin - Monitoramento Pneumático';
}
