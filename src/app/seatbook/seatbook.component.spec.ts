import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeatbookComponent } from './seatbook.component';

describe('SeatbookComponent', () => {
  let component: SeatbookComponent;
  let fixture: ComponentFixture<SeatbookComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SeatbookComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeatbookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
