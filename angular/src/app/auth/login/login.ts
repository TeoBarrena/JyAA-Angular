  import { Component, Injectable } from '@angular/core';
  import { Navbar } from "../../layout/navbar/navbar";
  import { FormsModule } from '@angular/forms';
  import { HttpClient } from '@angular/common/http';
  import { CommonModule } from '@angular/common';
  import { AuthService } from '../auth-service/auth-service';
  import { Router } from '@angular/router'; //sirve para redireccionar a otra ruta
  import { RouterLink } from '@angular/router'; //este sirve para redireccionar en html
  import { environment } from '../../../environments/environment.development';
import { Subscription } from 'rxjs';

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
    private authSubscription!: Subscription;

    constructor(
      private http: HttpClient, 
      private AuthService: AuthService,
      private router: Router
    ) {} //aca se inyectan los servicios
    
    ngOnInit() {
      // Verificar si el usuario ya está autenticado
      this.authSubscription = this.AuthService.isLoggedIn.subscribe(isLoggedIn => {
        if (isLoggedIn) {
          console.log("Usuario ya autenticado, redirigiendo a welcome");
          this.router.navigate(['welcome']);
        }
      });
    }

    ngOnDestroy() {
      if (this.authSubscription) {
        this.authSubscription.unsubscribe();
      }
    }

    login(){
      const body = {
        email: this.email,
        password: this.password
      }

      console.log("Api URL: " + environment.apiUrl);

      //subscribe es para manejar segun la respuesta del servidor
      this.http.post<any>(`${environment.apiUrl}/auth/login`, body, { withCredentials:true }).subscribe({
        next: (response) => {
          this.AuthService.login(response.roles, response.id); //registra el inicio de sesión en el servicio de autenticación y setea los roles del usuario

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
