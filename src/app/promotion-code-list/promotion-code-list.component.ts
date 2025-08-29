import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';




@Component({
  selector: 'app-promotion-code-list',
  standalone: false,
  templateUrl: './promotion-code-list.component.html',
  styleUrl: './promotion-code-list.component.css'
})
export class PromotionCodeListComponent {
  public promotionList: any[] = [];



  constructor(
    private http: HttpClient,
    private dashboardService: DashboardService,
    private router: Router,
   ) {}

  ngOnInit() {
    this.fetchPromotionCodeList()
    }


  public addPromotionCode(): void {
    this.router.navigate(['/add-promotion']);
  }

  public editPromotionCode(id: number) {
    this.router.navigate(['/promotion-code', id]);
  }


  public fetchPromotionCodeList(): void {
    this.dashboardService.promotionCodeList().subscribe({
      next: (res: any) => {
        this.promotionList = res.data.list.filter(
          (item: any) => item.status === 'active'
        );
      },
      error: (err) => {
        console.error('Api Error', err);
      },
    });
  }


  public deletePromotionCodeById(id: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this promotion code?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        const payload = {
          promotion_code_id: id,
          status: 'inactive',
        };

        this.dashboardService.deletePromotionCode(payload).subscribe({
          next: (res) => {
            Swal.fire(
              'Deleted!',
              'Promotion code deleted successfully.',
              'success'
            );
            this.fetchPromotionCodeList();
          },
          error: (err) => {
            Swal.fire('Error!', 'Failed to delete promotion code.', 'error');
            console.error(err);
          },
        });
      }
    });
  }
}
