import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Router } from '@angular/router';
import { ToastService } from '../../layout/notificaciones/toast.service';
import { map, catchError, tap } from 'rxjs/operators';

//Funciona como un servicio no como componente
@Injectable({providedIn: 'root'}) //permite inyeccion global del servicio
export class AuthService {

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastService: ToastService
  ){}

  private loggedIn$ = new BehaviorSubject<boolean>(false);
  private userRole$ = new BehaviorSubject<string[]>([]);
  private userId$ = new BehaviorSubject<number | null>(null);

  public isLoggedIn: Observable<boolean> = this.loggedIn$.asObservable();
  public userRoles: Observable<string[]> = this.userRole$.asObservable();
  public userId: Observable<number | null> = this.userId$.asObservable();

  login(roles: string[], userId: number){
    localStorage.setItem('pageSize', '5'); //guarda el default de cantidad de elementos por pagina
    this.loggedIn$.next(true);
    this.setUserRole(roles);
    this.setUserId(userId);
  } 

  setUserId(id: number | null){
    this.userId$.next(id);
  }

  getUserId(): number | null {
    return this.userId$.value;
  }

  checkSession(): Observable<boolean> {
  return this.http.get<any>(`${environment.apiUrl}/auth/check-session`, { withCredentials: true }).pipe(

    tap(response => {
      this.login(response.roles, response.id);
    }),

    map(() => true),

    catchError(() => {
      console.log('No active session found');
      this.loggedIn$.next(false);
      this.userRole$.next([]); 
      this.userId$.next(null);   
      return of(false);
    })
  );
}

  logout() {
    this.loggedIn$.next(false);
    this.setUserRole([]);
    this.setUserId(null);
    this.router.navigate(['/login']);
    
    this.http.post<any>(`${environment.apiUrl}/auth/logout`, {}, { withCredentials:true }).subscribe({
      next: () => {
        this.toastService.show('success', 'Sesión cerrada con éxito');
      },
      error: () => {
        this.toastService.show('error', 'Error al cerrar sesión');
      }
    });
  }

  //Manejo de roles 
  setUserRole(roles: string[]) {
    this.userRole$.next(roles);
  }  

  getUserRole() {
    return this.userRole$.asObservable();
  } 

}
