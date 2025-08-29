import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BookingService } from '../../services/booking.service';

@Component({
  selector: 'app-thankyoupage',
  standalone: false,
  templateUrl: './thankyoupage.component.html',
  styleUrl: './thankyoupage.component.css',
})
export class ThankyoupageComponent {
  public bookingId: any;
  public selectedSeats: any[] = [];
  public totalAmount: number = 0;

  constructor(private router: Router, private bookingService: BookingService) {}

  ngOnInit(): void {
    this.bookingId = localStorage.getItem('bookingId') || 'N/A';
    this.selectedSeats = JSON.parse(
      localStorage.getItem('selectedSeats') || '[]'
    );
    this.totalAmount = this.selectedSeats.reduce(
      (sum, seat) => sum + +seat.price,
      0
    );
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
  

  public exitPage(): void {
    sessionStorage.clear();
    this.router.navigate(['/'])
  }
}
