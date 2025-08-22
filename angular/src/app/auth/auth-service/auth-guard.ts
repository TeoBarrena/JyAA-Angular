import { CanActivateFn } from '@angular/router';
import { AuthService } from './auth-service';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastService } from '../../layout/notificaciones/toast.service';
import { switchMap , catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';

//Al no ser una clase y ser una funcion, la manera de inyectar es con inject() y no con el constructor(){}
export const authGuard: CanActivateFn = (route, state) => {
  const toastService = inject(ToastService);
  const router = inject(Router);
  const authService = inject(AuthService);

  // Usa 'switchMap' para encadenar observables. Primero, espera a que checkSession complete.
  return authService.checkSession().pipe(
    // Una vez que checkSession ha completado y potencialmente ha actualizado isLoggedIn,
    // usamos 'switchMap' para cambiar al observable de isLoggedIn.
    switchMap(() => authService.isLoggedIn),
    // Ahora que estamos dentro del observable de isLoggedIn, 'map' nos permite
    // transformar el valor emitido (true/false) en el resultado del guard.
    map(isLoggedIn => {
      if (isLoggedIn) {
        return true;
      } else {
        toastService.show('error', 'Debes tener una sesión activa para acceder a esa página.');
        router.navigate(['/login']);
        return false;
      }
    }),
    // 'catchError' maneja cualquier error de la llamada inicial a checkSession.
    catchError(() => {
      toastService.show('error', 'Error al verificar la sesión. Por favor, inicia sesión nuevamente.');
      router.navigate(['/login']);
      return of(false);
    })
  );
};