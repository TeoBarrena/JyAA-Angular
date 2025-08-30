import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Router } from '@angular/router';
import { ToastService } from '../../layout/notificaciones/toast.service';
import { map, catchError, tap } from 'rxjs/operators';
import { combineLatest } from 'rxjs';

//Funciona como un servicio no como componente
@Injectable({ providedIn: 'root' }) //permite inyeccion global del servicio
export class AuthService {

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastService: ToastService
  ) { }

  private loggedIn$ = new BehaviorSubject<boolean>(false);
  private userRole$ = new BehaviorSubject<string[]>([]);
  private userPermiso$ = new BehaviorSubject<string[]>([]);
  private userId$ = new BehaviorSubject<number | null>(null);

  public isLoggedIn: Observable<boolean> = this.loggedIn$.asObservable();
  public userRoles: Observable<string[]> = this.userRole$.asObservable();
  public userPermisos: Observable<string[]> = this.userPermiso$.asObservable();
  public userId: Observable<number | null> = this.userId$.asObservable();

  login(roles: string[], userId: number, permisos: string[]) {
    localStorage.setItem('pageSize', '5'); //guarda el default de cantidad de elementos por pagina
    this.loggedIn$.next(true);
    this.setUserRole(roles);
    this.setUserPermisos(permisos);
    this.setUserId(userId);


    // imprimir todos los roles
    console.log('Roles:');
    roles.forEach((rol) => console.log(rol));

    // imprimir todos los permisos
    console.log('Permisos:');
    permisos.forEach((permiso) => console.log(permiso));
    //this.permisosService.set(roles, permisos);
  }

  //Manejo de roles 
  setUserRole(roles: string[]) {
    this.userRole$.next(roles);
  }

  getUserRole() {
    return this.userRole$.asObservable();
  }

  //manejo de permisos
  setUserPermisos(permisos: string[]) {
    this.userPermiso$.next(permisos);
  }

  getPermisos() {
    return this.userPermiso$.asObservable();
  }

  setUserId(id: number | null) {
    this.userId$.next(id);
  }

  getUserId(): number | null {
    return this.userId$.value;
  }

  checkSession(): Observable<boolean> {
    return this.http.get<any>(`${environment.apiUrl}/auth/check-session`, { withCredentials: true }).pipe(

      tap(response => {
        this.login(response.roles, response.id, response.permisos);
      }),

      map(() => true),

      catchError(() => {
        console.log('No active session found');
        this.loggedIn$.next(false);
        this.userRole$.next([]);
        this.userPermiso$.next([]);
        this.userId$.next(null);
        return of(false);
      })
    );
  }

  checkPermiso(permiso: string): boolean {
    const permisos = this.userPermiso$.value;
    const roles = this.userRole$.value;

    if (!permisos.length && !roles.length) return false;

    if (permisos.includes('ADMIN') || roles.includes('Admin')) {
      return true;
    }

    return permisos.includes(permiso);
  }

  checkRol(rol: string): boolean {
    const roles = this.userRole$.value;
    return roles.includes(rol) || roles.includes('Admin');
  }

  logout() {
    this.loggedIn$.next(false);
    this.setUserRole([]);
    this.setUserPermisos([]);
    this.setUserId(null);

    //this.permisosService.clean();
    this.router.navigate(['/login']);

    this.http.post<any>(`${environment.apiUrl}/auth/logout`, {}, { withCredentials: true }).subscribe({
      next: () => {
        this.toastService.show('info-outline', 'Sesión cerrada con éxito');
      },
      error: () => {
        this.toastService.show('error-outline', 'Error al cerrar sesión');
      }
    });
  }


}
