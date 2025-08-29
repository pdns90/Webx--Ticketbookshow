import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Location } from '@angular/common';
import { filter } from 'rxjs/operators';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  public currentPath: string = '';

  constructor(private router: Router) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentPath = event.urlAfterRedirects.replace(/^\/+/, '');
      });
  }

  public bookTicket() {
    if (this.currentPath === 'dashboard') {
      this.confirmLogout();
    } else {
      this.router.navigate(['/seatbook']);
    }
  }

  public confirmLogout(): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will be logged out!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#bb0404',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, logout',
    }).then((result) => {
      if (result.isConfirmed) {
        this.logOut();
      }
    });
  }

  public logOut(): void {
    localStorage.clear();
    Swal.fire({
      title: 'Logged out!',
      text: 'You have been successfully logged out.',
      icon: 'success',
      confirmButtonColor: '#bb0404',
    }).then(() => {
      this.router.navigate(['/login']);
    });
  }
}
