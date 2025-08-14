import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgendarManutencaoComponent } from './agendar-manutencao.component';

describe('AgendarManutencaoComponent', () => {
  let component: AgendarManutencaoComponent;
  let fixture: ComponentFixture<AgendarManutencaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgendarManutencaoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgendarManutencaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
