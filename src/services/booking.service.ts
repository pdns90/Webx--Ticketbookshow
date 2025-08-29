import { Injectable } from '@angular/core';
import { environment } from '../environment/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  constructor(private http: HttpClient) {}

  // getTotalSeats(auth_api_key: any): Observable<any> {
  //   return this.http.post(`${environment.apiUrl}get-auditorium-tickets`,auth_api_key);
  // }

  getTotalSeats(auth_api_key: any): Observable<any> {
    const payload = {
      auth_api_key: auth_api_key
    };
    return this.http.post(`${environment.apiUrl}get-auditorium-tickets`, payload);
  }
  

  downloadTicket(ticketBookingId: number): Observable<Blob> {
    const payload = { ticket_booking_id: ticketBookingId };
    return this.http.post(`${environment.apiUrl}generate_pdf`, payload, {
      responseType: 'blob' as 'blob',
    });
  }

  checkSeatAvailability(): Observable<any> {
    return this.http.post(
      `${environment.apiUrl}check-ticket-availability`,''
    );
  }


   addPromoCode(promotion_code:any): Observable<any> {
    return this.http.post(`${environment.apiUrl}apply-promotion-code`,promotion_code)
  }

  checkHoldTicket(): Observable<any> {
    return this.http.post(`${environment.apiUrl}check-hold-tickets`,'')
  }

  // holdTicket(ticket_ids:any, auth_api_key:any): Observable<any> {
  //   return this.http.post(`${environment.apiUrl}hold-tickets`,ticket_ids,auth_api_key)
  // }

  authenticationApi(): Observable<any> {
    return this.http.post(`${environment.apiUrl}auth-api-key`,'')
  }


  holdTicket(payload: any, auth_api_key: any) {
    const fullPayload = {
      ...payload,                    // Includes ticket_ids
      auth_api_key: auth_api_key     // Adds auth_api_key
    };
  
    return this.http.post(`${environment.apiUrl}hold-tickets`, fullPayload, {
      headers: {
        Authorization: `Bearer ${auth_api_key}`
      }
    });
  }
  
exportTickets(): Observable<Blob> {
  return this.http.post(`${environment.apiUrl}export-ticket-bookings`,{},  {
    responseType: 'blob'  
  });
}

}
