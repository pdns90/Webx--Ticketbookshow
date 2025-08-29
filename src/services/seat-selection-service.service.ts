import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SeatSelectionServiceService {
  private selectedSeats: {
    row_label: string;
    seat_number: number;
    price: string;
  }[] = [];
  private totalPrice: number = 0;

  setSeats(seats: any[], total: number) {
    this.selectedSeats = seats;
    this.totalPrice = total;
  }

  getSeats() {
    return this.selectedSeats;
  }

  getTotalPrice() {
    return this.totalPrice;
  }
}
