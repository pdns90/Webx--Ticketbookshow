import { Component } from '@angular/core';
import { LoginService } from '../../services/login.service';
import { Subject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  imports: [CommonModule, FormsModule],
})
export class LoginComponent {
  public componentDestroy$ = new Subject();
  public email: string = '';
  public password: string = '';

  constructor(private loginService: LoginService, private router: Router) {}

  ngOnInit() {}

  public loginUser(): void {
    this.loginService.login(this.email, this.password).subscribe({
      next: (res: any) => {
        localStorage.setItem('token', res.data.token);

        Swal.fire({
          title: 'Login Successful',
          text: 'Redirecting to dashboard...',
          icon: 'success',
          timer: 1500,
          timerProgressBar: true,
          showConfirmButton: false,
        });

        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1500);
      },

      error: (err) => {
        console.error('Login Failed', err.message);

        Swal.fire({
          title: 'Login Failed',
          text: 'Invalid email or password.',
          icon: 'error',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
      },
    });
  }
}
