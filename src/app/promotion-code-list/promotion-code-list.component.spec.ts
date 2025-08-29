import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromotionCodeListComponent } from './promotion-code-list.component';

describe('PromotionCodeListComponent', () => {
  let component: PromotionCodeListComponent;
  let fixture: ComponentFixture<PromotionCodeListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PromotionCodeListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PromotionCodeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
