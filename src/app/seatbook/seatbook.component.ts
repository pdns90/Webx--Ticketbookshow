import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { SeatSelectionServiceService } from '../../services/seat-selection-service.service';
import { Router } from '@angular/router';
import { BookingService } from '../../services/booking.service';
import { Subject, take, takeUntil } from 'rxjs';
import Swal from 'sweetalert2';

interface Seat {
  is_hold: string;
  price: string;
  id: number;
  row_label: string;
  section: 'Left' | 'Center' | 'Right';
  seat_number: number;
}
declare var window: any;

@Component({
  selector: 'app-seatbook',
  standalone: false,
  templateUrl: './seatbook.component.html',
  styleUrl: './seatbook.component.css',
})
export class SeatbookComponent {
  public componentDestroy$ = new Subject();
  public seats: any = [];
  public selectedSeats: Seat[] = [];
  public totalAmount: number = 0;
  public isLoadingSeats: boolean = false;
  public unavailableSeatIds: string[] = [];
  public holdSeats: any;
  public getHoldSeats: any;
  public heldByUserIds: number[] = [];
  public heldSeatIds: string[] = [];
  public authData:any

  constructor(
    private router: Router,
    private bookingService: BookingService,
    private seatService: SeatSelectionServiceService
  ) {}

  ngOnInit() {
    const authKey = localStorage.getItem("AUTH_API_KEY")
     
    const storedSeats = sessionStorage.getItem('selectedSeats');
    const storedAmount = sessionStorage.getItem('totalAmount');
   
 

    this.selectedSeats = storedSeats ? JSON.parse(storedSeats) : [];
    this.totalAmount = storedAmount ? parseFloat(storedAmount) : 0;
    this.fetchCheckHoldTickets();
    this.getTotalSeats();
    this.cleanHeldOrUnavailableSeats();
   }

  public getTotalSeats(): void {
    const auth_api_key = localStorage.getItem("AUTH_API_KEY");
// console.log("auth_api_key",auth_api_key);

    this.isLoadingSeats = true;

    this.bookingService
      .getTotalSeats(auth_api_key)
      .pipe(takeUntil(this.componentDestroy$))
      .subscribe({
        next: (res: any) => {
          this.seats = res.data;
          this.isLoadingSeats = false;
        },
        error: (err: any) => {
          console.error('Handled Error:', err.message);
          this.isLoadingSeats = false;
        },
      });
  }


// normalizeSeats(seats: any[]): any[] {
//   return seats.map(row => {
//     const sections = ['Left', 'Center', 'Right'];

//     // Ensure each row has Left, Center, Right (even if empty)
//     const normalizedDetails = sections.map(section => {
//       const found = row.details.find((d: any) => d.section === section);
//       return found ? found : { section, tickets: [] };
//     });

//     return {
//       ...row,
//       details: normalizedDetails
//     };
//   });
// }

// public getTotalSeats(): void {
//   const auth_api_key = localStorage.getItem("AUTH_API_KEY");
//   this.isLoadingSeats = true;

//   this.bookingService
//     .getTotalSeats(auth_api_key)
//     .pipe(takeUntil(this.componentDestroy$))
//     .subscribe({
//       next: (res: any) => {
//         // normalize before binding
//         this.seats = this.normalizeSeats(res.data);
//         this.isLoadingSeats = false;
//       },
//       error: (err: any) => {
//         console.error('Handled Error:', err.message);
//         this.isLoadingSeats = false;
//       },
//     });
// }



  public toggleSeatSelection(seat: any, rowLabel: string): void {
    const seatIdStr = seat.id.toString();

    const isUnavailable =
    seat.is_booked === 'yes' ||
    this.unavailableSeatIds.includes(seatIdStr) ||
    this.heldSeatIds.includes(seatIdStr) ||  
    seat.is_hold === 'yes';
  

    if (isUnavailable) {
      return;
    }

    const index = this.selectedSeats.findIndex((s) => s.id === seat.id);
    if (index > -1) {
      this.selectedSeats.splice(index, 1);
    } else {
      this.selectedSeats.push({
        ...seat,
        row_label: rowLabel,
      });
    }

    this.totalAmount = this.selectedSeats.reduce(
      (acc, s) => acc + parseFloat(s.price),
      0
    );

    sessionStorage.setItem('selectedSeats', JSON.stringify(this.selectedSeats));
    sessionStorage.setItem('totalAmount', this.totalAmount.toString());
    localStorage.setItem('selectedSeats', JSON.stringify(this.selectedSeats));
    localStorage.setItem('totalAmount', this.totalAmount.toString());
  }

  public isSelected(seatId: number): boolean {
    return this.selectedSeats.some((seat) => seat.id === seatId);
  }

  public goToOrderSummary() {
    this.seatService.setSeats(this.selectedSeats, this.totalAmount);
    this.router.navigate(['/ordersummary']);
  }

   

  public checkSeatAvailablilty(): void {
    if (this.selectedSeats.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Seats Selected',
        text: 'Please select at least one seat to proceed.',
      });
      return;
    }
  
    this.bookingService.checkSeatAvailability().subscribe({
      next: (res: any) => {
        const alreadyBooked: string[] = res.data.ticket_id_arr;
  
        this.unavailableSeatIds = alreadyBooked;
  
        const prevSelected = [...this.selectedSeats];
        this.selectedSeats = this.selectedSeats.filter(
          (seat) => !alreadyBooked.includes(seat.id.toString())
        );
  
        this.totalAmount = this.selectedSeats.reduce(
          (acc, seat) => acc + parseFloat(seat.price),
          0
        );
  
        sessionStorage.setItem('selectedSeats', JSON.stringify(this.selectedSeats));
        sessionStorage.setItem('totalAmount', this.totalAmount.toString());
  
        if (
          alreadyBooked.length > 0 &&
          this.selectedSeats.length < prevSelected.length
        ) {
          if (this.selectedSeats.length === 0) {
            Swal.fire({
              icon: 'error',
              title: 'All Selected Seats Unavailable',
              text: 'All your selected seats were reserved. Please select available seats to continue.',
            });
          } else {
            Swal.fire({
              icon: 'warning',
              title: 'Some Seats Were Reserved',
              text: 'Reserved seats have been removed. Please select more if needed.',
              confirmButtonText: 'Okay',
            });
          }
        } else {
          this.unavailableSeatIds = [];
  
          const ticket_ids = this.selectedSeats.map((s) => s.id).join(',');
  
          //  Call holdTicket — let it decide redirect
          this.holdTicket(ticket_ids);
        }
      },
  
      error: (err: any) => {
        console.error('Error checking seat availability:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Something went wrong while checking seat availability.',
        });
      },
    });
  }
  

  @ViewChild('paymentBar') paymentBar!: ElementRef<HTMLElement>;
  originalOffsetTop: number = 0;
  isStuck: boolean = false;

  ngAfterViewInit() {
    this.originalOffsetTop = this.paymentBar.nativeElement.offsetTop;
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    this.isStuck = scrollY > this.originalOffsetTop;
  }

  public getAllSeatsForRow(row: any): any[] {
    if (!row || !row.details) return [];
    return row.details.flatMap((detail: any) => detail.tickets);
  }

 
  
  public fetchCheckHoldTickets(): void {
    this.bookingService
      .checkHoldTicket()
      .pipe(takeUntil(this.componentDestroy$))
      .subscribe({
        next: (res: any) => {
          const stillHeldIds: number[] = res?.data?.still_held || [];
  
          this.heldSeatIds = stillHeldIds.map(id => id.toString());
  
          // this.cleanHeldOrUnavailableSeats();
        },
        error: (err: any) => {
          console.error('Handled Error', err.message);
        },
      });
  }
  
 

public holdTicket(ticket_ids: string): void {
  const payload = { ticket_ids };
  const auth_api_key = localStorage.getItem("AUTH_API_KEY");
  this.bookingService
    .holdTicket(payload,auth_api_key)
    .pipe(takeUntil(this.componentDestroy$))
    .subscribe({
      next: (res: any) => {
        // console.log('Hold Ticket Response:', res);

        const alreadyHeld: number[] = res.data?.already_hold || [];

        //  If any seats are already on hold, show alert and do not redirect
        if (alreadyHeld.length > 0) {
          this.heldSeatIds.push(...alreadyHeld.map(id => id.toString()));

          this.selectedSeats = this.selectedSeats.filter(
            seat => !alreadyHeld.includes(seat.id)
          );

          this.totalAmount = this.selectedSeats.reduce(
            (acc, seat) => acc + parseFloat(seat.price),
            0
          );

          sessionStorage.setItem('selectedSeats', JSON.stringify(this.selectedSeats));
          sessionStorage.setItem('totalAmount', this.totalAmount.toString());

          Swal.fire({
            icon: 'warning',
            title: 'Some Seats Already on Hold',
            text: `Seats ${alreadyHeld.join(', ')} were already on hold and removed from your selection.`,
          });

          return;
        }

        // ✅ Redirect only if hold was successful and no already_hold seats
        if (res.success) {
          this.goToOrderSummary();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Hold Failed',
            text: res.message || 'Unable to hold the seats. Please try again.',
          });
        }
      },
   error: (err: any) => {
  console.error('Hold Ticket Error:', err.message);

  // If response has already_hold IDs in err.error
  const alreadyHeld: number[] = err?.error?.data?.already_hold || [];

  if (alreadyHeld.length > 0) {
    // Convert to string to match with seat.id.toString()
    this.heldSeatIds.push(...alreadyHeld.map(id => id.toString()));

    // Remove those from selectedSeats
    this.selectedSeats = this.selectedSeats.filter(
      seat => !alreadyHeld.includes(seat.id)
    );

    // Recalculate total amount
    this.totalAmount = this.selectedSeats.reduce(
      (acc, seat) => acc + parseFloat(seat.price),
      0
    );

    // Update sessionStorage and localStorage
    sessionStorage.setItem('selectedSeats', JSON.stringify(this.selectedSeats));
    sessionStorage.setItem('totalAmount', this.totalAmount.toString());

    localStorage.setItem('selectedSeats', JSON.stringify(this.selectedSeats));
    localStorage.setItem('totalAmount', this.totalAmount.toString());

    // Reload seat map
    this.getTotalSeats();

    Swal.fire({
      icon: 'warning',
      // title: 'Some Seats Were Already on Hold',
      text: `Some of the selected seats by you are already selected by another user, please re-select`,
    });

    return;
  }

  // Default error message
  Swal.fire({
    icon: 'error',
    title: 'Error',
    text: 'Some seats are already on hold. Please reselect.',
  });
}

    });
}



  
private cleanHeldOrUnavailableSeats(): void {
  const previouslySelected = [...this.selectedSeats];

  const cleanedSeats = this.selectedSeats.filter(
    seat => !this.heldSeatIds.includes(seat.id.toString())
  );

  if (cleanedSeats.length !== this.selectedSeats.length) {
    this.selectedSeats = cleanedSeats;
    this.totalAmount = this.selectedSeats.reduce(
      (acc, s) => acc + parseFloat(s.price),
      0
    );

    sessionStorage.setItem('selectedSeats', JSON.stringify(this.selectedSeats));
    sessionStorage.setItem('totalAmount', this.totalAmount.toString());

    // Swal.fire({
    //   icon: 'warning',
    //   title: 'Some Seats Were Held',
    //   text: 'Some of your previously selected seats were already held and have been removed.',
    // });
  }
}




}
