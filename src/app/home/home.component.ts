import { Component } from '@angular/core';
import { BookingService } from '../../services/booking.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  public componentDestroy$ = new Subject();
  public authData:any;


  constructor(private bookingService:BookingService){}

  ngOnInit(){
    this.checkAUth();
  }



  public checkAUth(): void {
    this.bookingService.authenticationApi()
    .pipe(takeUntil(this.componentDestroy$))
    .subscribe({
      next: (res:any) =>{
          this.authData = res.data.auth_api_key
          localStorage.setItem("AUTH_API_KEY",this.authData)
           
      },
      error: (err) =>{
        console.error("Error Handled",err);
        
      }
    })
  }
}
