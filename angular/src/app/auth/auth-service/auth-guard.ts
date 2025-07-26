import { CanActivateFn } from '@angular/router';
import { AuthService } from './auth-service';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

//Al no ser una clase y ser una funcion, la manera de inyectar es con inject() y no con el constructor(){}
export const authGuard: CanActivateFn = (route, state) => {

  const router = inject(Router);
  const authService = inject(AuthService);

  if (authService.isLoggedIn()){
    return true;
  } else{
    alert('Debes tener una sesión inicada para acceder a esta página');
    router.navigate(['/login']);
    return false;
  }
};
