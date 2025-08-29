import { Injectable } from '@angular/core';
import { environment } from '../environment/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  constructor(private http: HttpClient) {}


   login(email: string, password: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}login`, { email, password });
  }
  

  
  
}
