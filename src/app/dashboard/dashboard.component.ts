import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DashboardService } from '../../services/dashboard.service';
import { Router } from '@angular/router';
import { BookingService } from '../../services/booking.service';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import Swal from 'sweetalert2';
declare var window: any; // bootstrap modal ko handle karne ke liye

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  searchSubject = new Subject<string>();
  public selectedFilter: string = 'ALL';
  public filterValue: string = '';
  public promotionList: any[] = [];
  public isLoading: boolean = false;
  public bookedTicketList: any[] = [];
  public currentPage: number = 1;
  public itemsPerPage: number = 15;
  public totalItems: number = 0;
  public showActionColumn: boolean = false;
   cancelReason: string = '';
  cancelTicketId: number | null = null;
  public totalBooked:any;
  public totalAvailable:any

  constructor(
    private http: HttpClient,
    private dashboardService: DashboardService,
    private router: Router,
    private bookingService: BookingService
  ) {}

  ngOnInit() {
    this.applyFilter();
    this.fetchPromotionCodeList();
    this.searchSubject.pipe(debounceTime(400)).subscribe((value) => {
      this.filterValue = value;
      this.currentPage = 1;  
      this.applyFilter();
    });
  }

 

public applyFilter() {
  this.isLoading = true;
  const payload: any = {
    page: this.currentPage,
    limit: this.itemsPerPage,
  };

  if (this.selectedFilter) {
    payload.status = this.selectedFilter;
  }

  if (this.filterValue && this.filterValue.trim() !== '') {
    payload.search = this.filterValue.trim();
  }

  this.dashboardService.bookedTicketList(payload).subscribe({
    next: (res: any) => {
      this.bookedTicketList = res.data.list || [];
      this.totalBooked =  res.data.total_booked_seats;
      this.totalAvailable = res.data.total_available_seats
      this.totalItems = res.data.pagination?.total || 0;

       this.showActionColumn = this.bookedTicketList.some(
        (p: any) => p.booked_status === 'SUCCESS'
      );

      this.isLoading = false;
    },
    error: (err) => {
      console.error('API Error:', err);
      this.isLoading = false;
    },
  });
}


  public fetchPromotionCodeList(): void {
    this.dashboardService.promotionCodeList().subscribe({
      next: (res: any) => {
        this.promotionList = res.data.list.filter((item: any) => item.status === 'active');
      },
      error: (err) => {
        console.error('Api Error', err);
      },
    });
  }

  public addPromotionCode(): void {
    this.router.navigate(['/add-promotion']);
  }

  public downloadTicket(ticketId: number): void {
    this.bookingService.downloadTicket(ticketId).subscribe((response: Blob) => {
      const blob = new Blob([response], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.download = `Ticket${ticketId}.pdf`;
      a.href = url;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchSubject.next(input.value);
  }

  changePage(page: number): void {
    if (page < 1 || page > this.getTotalPages()) return;
    this.currentPage = page;
    this.applyFilter();
  }

  getTotalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  getPages(): number[] {
    const total = this.getTotalPages();
    return Array.from({ length: total }, (_, i) => i + 1);
  }

public CancelBookedTicket(ticketId: number): void {
  this.cancelTicketId = ticketId;
  this.cancelReason = '';

  const modalEl = document.getElementById('cancelTicketModal');
  if (modalEl) {
    const modal = new (window as any).bootstrap.Modal(modalEl);
    modal.show();
  }
}



  // jab user OK press karega
public confirmCancelTicket(): void {
  if (!this.cancelTicketId || !this.cancelReason.trim()) {
    Swal.fire({
      icon: 'warning',
      title: 'Reason Required',
      text: 'Please enter a reason before cancelling',
      confirmButtonText: 'OK'
    });
    return;
  }

  const payload = {
    ticket_booking_id: this.cancelTicketId,
    remark: this.cancelReason.trim(),
  };

  this.dashboardService.CancelBookedTicket(payload).subscribe({
    next: (res) => {
      if (res?.success) {
        Swal.fire({
          icon: 'success',
          title: 'Cancelled',
          text: res.message, // "Cancelled successfully."
          confirmButtonText: 'OK'
        }).then(() => {
          this.applyFilter(); // refresh list
          this.closeModal();  // close modal after confirmation
        });
      }
    },
    error: (err) => {
      console.error('Cancel API Error:', err);
      Swal.fire({
        icon: 'error',
        title: 'Failed',
        text: 'Failed to cancel ticket. Please try again.',
        confirmButtonText: 'OK'
      });
    },
  });
}


private closeModal() {
  const modalEl = document.getElementById('cancelTicketModal');
  const modal = (window as any).bootstrap.Modal.getInstance(modalEl);
  if (modal) modal.hide();
}


public exportTickets(): void {
  

  this.bookingService.exportTickets().subscribe({
    next: (response: Blob) => {
      const blob = new Blob([response], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.download = `Tickets_${new Date().toISOString().slice(0,10)}.xlsx`; 
      a.href = url;
      a.click();
      window.URL.revokeObjectURL(url);
    },
    error: (err) => {
      console.error('Export API Error:', err);
      Swal.fire({
        icon: 'error',
        title: 'Failed',
        text: 'Ticket export failed. Please try again.',
      });
    },
  });
}

}
