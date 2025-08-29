import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DashboardService } from '../../services/dashboard.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-promotion-code',
  standalone: false,
  templateUrl: './promotion-code.component.html',
  styleUrl: './promotion-code.component.css'
})
export class PromotionCodeComponent {
  form!: FormGroup;
  public loading: boolean = false;
  public isEditMode: boolean = false;
  public promotionId: number | null = null;

  constructor(private fb: FormBuilder, private dashboardService:DashboardService, private router: Router, private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      title: ['', Validators.required],
      code: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(0)]],
      max_apply: [null, [Validators.required, Validators.min(1)]],
    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.promotionId = +id;
        this.fetchPromotionCode(this.promotionId);
      }
    });
  }

  

  public  fetchPromotionCode(id: number): void {
    this.loading = true;
    this.dashboardService.getPromotionCodeById(id).subscribe({
      next: (res: any) => {
        const data = res.data.list; 
        this.form.patchValue({
          title: data.title,
          code: data.code,
          amount: +data.amount,  
          max_apply: data.max_apply
        });
      },
      error: (err) => {
        alert('Failed to load promotion code.');
        console.error(err);
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
  
  

  public onSubmit(): void {
    if (this.form.invalid) return;
  
    const payload: any = {
      title: this.form.value.title,
      code: this.form.value.code,
      amount: this.form.value.amount,
      max_apply: this.form.value.max_apply
    };
  
     if (this.isEditMode) {
      payload.promotion_code_id = this.promotionId;
    }
  
    this.loading = true;
  
    const request$ = this.isEditMode
      ? this.dashboardService.updatePromotionCode(payload)
      : this.dashboardService.addPromotionCode(payload);
  
    request$.subscribe({
      next: (res: any) => {
        // alert(this.isEditMode ? 'Promotion code updated!' : 'Promotion code created!');
        this.router.navigate(['/promotion-code-list']);
      },
      error: (err: any) => {
        alert('Something went wrong.');
        console.error(err);
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  

  
}
