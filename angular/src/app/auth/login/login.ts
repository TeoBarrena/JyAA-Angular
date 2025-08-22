import { Component, Injectable } from '@angular/core';
import { Navbar } from "../../layout/navbar/navbar";
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth-service/auth-service';
import { Router } from '@angular/router'; //sirve para redireccionar a otra ruta
import { RouterLink } from '@angular/router'; //este sirve para redireccionar en html
import { environment } from '../../../environments/environment.development';

@Component({
  selector: 'app-login',
  imports: [Navbar, FormsModule, CommonModule, RouterLink], //routerLink se usa en HTML, router para los componentes
  templateUrl: './login.html',
  styleUrl: './login.css',
  standalone: true
})
@Injectable({providedIn: 'root'})
export class Login {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(
    private http: HttpClient, 
    private AuthService: AuthService,
    private router: Router
  ) {} //aca se inyectan los servicios
  
  ngOnInit() {
    // Verificar si el usuario ya está autenticado
    if (this.AuthService.isLoggedIn()) {
      console.log('Usuario ya autenticado');
      this.router.navigate(['welcome']); // Redirigir a la página de bienvenida si ya está autenticado
    }
  }

  login(){
    const body = {
      email: this.email,
      password: this.password
    }

    console.log("Api URL: " + environment.apiUrl);

    //subscribe es para manejar segun la respuesta del servidor
    this.http.post<any>(`${environment.apiUrl}/auth/login`, body).subscribe({
      next: (response) => {
        localStorage.setItem('token', response.token);
        console.log('Token recibido:', response.token);
        this.AuthService.login(); //registra el inicio de sesión en el servicio de autenticación
        if (response.admin === true) {
          this.AuthService.setUserRole('Admin');
        }else{
          this.AuthService.setUserRole(response.roles);
        }

        localStorage.setItem('userId', response.id);

        console.log(this.AuthService.getUserRole())

        this.router.navigate(['welcome']);

        this.email = '';
        this.password = '';
        
      },
      error: (error) => {
        this.errorMessage = 'Datos incorrectos';
      }
    })

  }
  
}
