 import { Injectable } from '@angular/core';
import { environment } from '../environment/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor(private http: HttpClient) {}


   bookedTicketList(data:any): Observable<any> {
    return this.http.post(`${environment.apiUrl}booked-ticket-list`, data);
  }
  

   promotionCodeList(): Observable<any> {
    return this.http.post(`${environment.apiUrl}promotion-code-list`,'')
  }

  
  addPromotionCode(data:any): Observable<any> {
    return this.http.post(`${environment.apiUrl}promotion-code-create`,data)
  } 

  getPromotionCodeById(id: number): Observable<any> {
    return this.http.post(`${environment.apiUrl}promotion-code-edit`, { promotion_code_id: id });
  }
  

  updatePromotionCode(data:any): Observable<any> {
    return this.http.post(`${environment.apiUrl}promotion-code-update`,data)
  }

  deletePromotionCode(data:any): Observable<any> {
    return this.http.post(`${environment.apiUrl}promotion-code-update-status`,data)
  }

  CancelBookedTicket(data:any): Observable<any> {
    return this.http.post(`${environment.apiUrl}cancel-booked-ticket`,data)
  }
}
