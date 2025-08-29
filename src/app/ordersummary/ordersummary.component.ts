import { Component, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environment/environment';
import { BookingService } from '../../services/booking.service';
import Swal from 'sweetalert2';

declare global {
  interface Window {
    bootstrap: any;
  }
}

@Component({
  selector: 'app-ordersummary',
  standalone: false,
  templateUrl: './ordersummary.component.html',
  styleUrl: './ordersummary.component.css',
})
export class OrdersummaryComponent implements OnDestroy {
  public totalPrice: number = 0;
  public selectedSeats: any[] = [];
  public paymentApiUrl = `${environment.apiUrl}book-auditorium-ticket`;
  public myModal: any;
  public email: string = '';
  public name: string = '';
  public phone: string = '';
  public promotion_code: string = '';
  public isLoading: boolean = false;
  public code: number = 0;
  public isPromoApplied: boolean = false;
  public timerMinutes: number = 5;
  public timerSeconds: number = 0;
  private countdownInterval: any;
  public showBookButtonForFree: boolean = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private bookingService: BookingService
  ) {}

  ngOnInit() {
    const storedSeats = sessionStorage.getItem('selectedSeats');
    const storedAmount = sessionStorage.getItem('totalAmount');

    // Redirect if no seat data
    if (!storedSeats || JSON.parse(storedSeats).length === 0 || !storedAmount) {
      this.router.navigate(['/']);
      return;
    }

    // this.selectedSeats = JSON.parse(storedSeats);
    this.selectedSeats = JSON.parse(storedSeats).sort((a: any, b: any) => {
      const rowA = a.row_label?.toUpperCase() || '';
      const rowB = b.row_label?.toUpperCase() || '';

      if (rowA < rowB) return -1;
      if (rowA > rowB) return 1;

      const numA = parseInt(a.ticket_number, 10);
      const numB = parseInt(b.ticket_number, 10);
      return numA - numB;
    });

    this.totalPrice = parseFloat(storedAmount);

    this.setupTimer();
  }

  ngOnDestroy() {
    clearInterval(this.countdownInterval);
  }

  public isFormValid(): boolean {
    return (
      this.name.trim() !== '' &&
      this.email.trim() !== '' &&
      this.phone.trim() !== '' &&
      this.isValidEmail() &&
      this.isValidPhone()
    );
  }

  public getFinalAmount(): number {
    return this.totalPrice;
  }

  public getSeatIds(): string {
    return this.selectedSeats.map((seat) => seat.id).join(',');
  }

  public getSeatPrices(): string {
    return this.selectedSeats.map((seat) => seat.price).join(',');
  }

  public onPhoneInput(event: any) {
    const value: string = event.target.value;

    if (value.startsWith('254')) {
      this.phone = value.substring(3);
    } else {
      event.target.value = '254' + this.phone;
    }
  }

  public onPhoneChange(value: string): void {
    if (value.startsWith('254')) {
      this.phone = value.substring(3);
    } else if (!value.startsWith('+254') && !value.startsWith('254')) {
      this.phone = value;
    }
  }

  public payWithMpesa() {
    this.pauseTimer();
    this.openModal1();
  }

  // public confirmPayment() {
  //   this.isLoading = true;
  //   const grandTotal = Math.max(0, this.getFinalAmount() - this.code);
  //   const payload = {
  //     email: this.email,
  //     name: this.name,
  //     mobile: this.phone,
  //     promotion_code: this.promotion_code,
  //     ticket_ids: this.getSeatIds(),
  //     total_price: grandTotal,

  //     // total_price: 1,
  //   };
  //   this.http.post(this.paymentApiUrl, payload).subscribe(
  //     (res: any) => {
  //       this.isLoading = false;
  //       const bookingId = res?.data?.data?.id;
  //       if (bookingId) {
  //         localStorage.setItem('bookingId', bookingId.toString());
  //       }
  //       // sessionStorage.removeItem('selectedSeats');
  //       // sessionStorage.removeItem('totalAmount');
  //       // alert('M-PESA Prompt sent to your phone.');
  //       this.closeModel();
  //       sessionStorage.clear();
  //       this.router.navigate(['/thank-you']);
  //     },
  //     (err) => {
  //       this.isLoading = false;
  //       // alert('Payment failed: ' + err.message);
  //       this.closeModel();
  //     this.resumeTimer();
  //     }
  //   );
  // }


  public confirmPayment() {
  this.isLoading = true;
  const grandTotal = Math.max(0, this.getFinalAmount() - this.code);
  const payload = {
    email: this.email,
    name: this.name,
    mobile: this.phone,
    promotion_code: this.promotion_code,
    ticket_ids: this.getSeatIds(),
    total_price: grandTotal,
  };

  this.http.post(this.paymentApiUrl, payload).subscribe(
    (res: any) => {
      this.isLoading = false;

      if (res?.success) {
        // ✅ Only when success = true
        const bookingId = res?.data?.data?.id;
        if (bookingId) {
          localStorage.setItem('bookingId', bookingId.toString());
        }
        this.closeModel();
        sessionStorage.clear();
        this.router.navigate(['/thank-you']);
      } else {
        // ❌ Handle error when success = false
        this.closeModel();
        this.resumeTimer();

        Swal.fire({
          icon: 'error',
          title: 'Payment Failed',
          text:'Something went wrong. Please try again.',
          confirmButtonText: 'OK'
        });
      }
    },
    (err) => {
      this.isLoading = false;
      this.closeModel();
      this.resumeTimer();

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err?.error?.message || err?.message || 'Payment request failed. Try again.',
        confirmButtonText: 'OK'
      });
    }
  );
}


  public openModal1() {
    const modalElement = document.getElementById('termsModal');
    this.myModal = new window.bootstrap.Modal(modalElement);
    this.myModal.show();
  }

 
public closeModel(isCancelled: boolean = false): void {
  if (this.myModal) {
    this.myModal.hide();
  }

  if (isCancelled) {
    this.resumeTimer();
  }

  if (isCancelled && this.getGrandTotal() === 0) {
    this.showBookButtonForFree = true;
  }
}



  public checkPromoCode(): void {
    const payload = {
      promotion_code: this.promotion_code,
    };

    this.bookingService.addPromoCode(payload).subscribe({
      next: (res: any) => {
        if (res && res.data && res.data.amount) {
          this.code = res.data.amount;
          this.isPromoApplied = true;

          Swal.fire({
            icon: 'success',
            title: 'Promo Applied',
            text: 'Promo code applied successfully!',
            timer: 2000,
            showConfirmButton: false,
          });

          if (this.getGrandTotal() === 0 && this.isFormValid()) {
            setTimeout(() => {
              this.payWithMpesa();
            }, 500);
          }
        } else {
          this.code = 0;
          Swal.fire({
            icon: 'error',
            title: 'Invalid Promo Code',
            text: 'Invalid promo code response.',
            timer: 2000,
            showConfirmButton: false,
          });
        }
      },
      error: () => {
        this.code = 0;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Invalid or expired promo code.',
          timer: 2000,
          showConfirmButton: false,
        });
      },
    });
  }

  public getGrandTotal(): number {
    return Math.max(0, this.getFinalAmount() - this.getAppliedDiscount());
  }

  public getAppliedDiscount(): number {
    return Math.min(this.code, this.getFinalAmount());
  }

  public isValidEmail(): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(this.email);
  }

  public isValidPhone(): boolean {
    const phoneDigitsOnly = this.phone.replace(/\D/g, '');
    return phoneDigitsOnly.length >= 9 && phoneDigitsOnly.length <= 10;
  }

  setupTimer() {
    const endTimeStr = sessionStorage.getItem('orderTimerEnd');

    if (!endTimeStr) {
      const newEndTime = new Date().getTime() + 5 * 60 * 1000; // 5 mins from now
      sessionStorage.setItem('orderTimerEnd', newEndTime.toString());
    }

    const endTime = parseInt(sessionStorage.getItem('orderTimerEnd') || '', 10);
    this.startTimer(endTime);
  }


startTimer(endTime: number) {
  this.countdownInterval = setInterval(() => {
    const now = new Date().getTime();
    const remaining = endTime - now;

    if (remaining <= 0) {
      clearInterval(this.countdownInterval);
      this.handleTimerExpire();
      return;
    }

    this.timerMinutes = Math.floor(remaining / (1000 * 60));
    this.timerSeconds = Math.floor((remaining % (1000 * 60)) / 1000);

    // 📝 save remaining time in localStorage
    sessionStorage.setItem('remainingTime', remaining.toString());
  }, 1000);
}


  // handleTimerExpire() {
  //   localStorage.removeItem('orderTimerEnd');
  //   sessionStorage.clear();
  //   // localStorage.clear();

  //   Swal.fire({
  //     icon: 'info',
  //     title: 'Session Expired',
  //     text: 'Your booking session has expired.',
  //     timer: 3000,
  //     showConfirmButton: false
  //   });

  //   this.router.navigate(['/']);
  // }

  handleTimerExpire() {
    sessionStorage.removeItem('orderTimerEnd');
    sessionStorage.clear();

    // Check if current route is '/ordersummary'
    if (this.router.url === '/ordersummary') {
      Swal.fire({
        icon: 'info',
        title: 'Timeout!!',
        text: 'Please select your seats again.',
        confirmButtonText: 'OK',
        // timer: 3000,
        timerProgressBar: true,
        allowOutsideClick: false,
        allowEscapeKey: false,
      });
    }

    this.router.navigate(['/']);
  }

pauseTimer() {
  clearInterval(this.countdownInterval);
  this.countdownInterval = null;
}


 resumeTimer() {
  const remainingStr = sessionStorage.getItem('remainingTime');
  if (remainingStr) {
    const remaining = parseInt(remainingStr, 10);
    const newEndTime = new Date().getTime() + remaining;
    this.startTimer(newEndTime);
    sessionStorage.setItem('orderTimerEnd', newEndTime.toString());
  }
}

}
