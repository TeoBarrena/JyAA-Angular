import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth-service/auth-service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true, 
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  constructor(public auth: AuthService,
              private router: Router
  ){} //permite que el html use auth para verificar el estado de autenticación

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']); 
  }

  showLoginButton(): boolean {
    return (
      !this.auth.isLoggedIn() &&
      this.router.url !== '/login'
    );
  }
}
