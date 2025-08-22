import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

//Funciona como un servicio no como componente
@Injectable({providedIn: 'root'}) //permite inyeccion global del servicio
export class AuthService {
  private loggedIn = new BehaviorSubject<boolean>(this.hasSession()); //observable para el estado de autenticación
  isLoggedIn$ = this.loggedIn.asObservable(); //observable para que otros componentes puedan suscribirse

  private hasSession(): boolean {
    return localStorage.getItem('isLoggedIn') === 'true'; //verifica si hay una sesión activa
  }

  login(){
    localStorage.setItem('isLoggedIn', 'true'); //guarda el estado de inicio de sesión en localStorage
    localStorage.setItem('pageSize', '5'); //guarda el default de cantidad de elementos por pagina
    this.loggedIn.next(true); //cambia el estado a inicio sesión
  }

  logout(){
    localStorage.removeItem('isLoggedIn'); 
    localStorage.removeItem('userRole'); 
    localStorage.removeItem('userId');
    localStorage.removeItem('pageSize');
    this.clearToken();
    this.loggedIn.next(false); 
  }

  isLoggedIn(): boolean {
    return this.loggedIn.value; //devuelve el estado actual de autenticación
  }

  //Manejo de token para JWT
  setToken(token:string): void {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  clearToken(): void {
    return localStorage.removeItem('token');
  }

  //Manejo de roles 
  setUserRole(role: string) {
    localStorage.setItem('userRole', role);
  }

  getUserRole(): string | null {
    return localStorage.getItem('userRole'); //devuelve el rol del usuario almacenado en localStorage
  }

  getHeaderHttp(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`); //configura el header HTTP con el token JWT
  }

}
