import { Routes } from '@angular/router';

// Auth
import { Login } from './auth/login/login';
import { authGuard } from './auth/auth-service/auth-guard';

// Pages
import { Register } from './pages/register/register';
import { Welcome } from './pages/welcome/welcome';
//import { Users } from './pages/users/users'; DEPRECATED
import { Usuarios } from './pages/usuarios/Usuarios';
import { Map } from './pages/map/map';
import { Barrios } from './pages/barrios/barrios';
//import { Zonas } from './pages/zonas/zonas';  DEPRECATED
import { Encuestadores } from './pages/encuestadores/encuestadores';
import { Campanias } from './pages/campanias/campanias';
import { Jornadas } from './pages/jornadas/jornadas';

// Details
import { UserDetail } from './pages/details/user-detail/user-detail';
//import { BarrioDetail } from './pages/details/barrio-detail/barrio-detail';  DEPRECATED
import { JornadaDetail } from './pages/details/jornada-detail/jornada-detail';
import { EncuestadorDetail } from './pages/details/encuestador-detail/encuestador-detail';

export const routes: Routes = [
    {path: '', redirectTo: 'login', pathMatch: 'full'},
    {path: 'login', component: Login},
    {path: 'register', component: Register}, 
    {path: 'welcome', component: Welcome}, // canActivate es para definir que se necesita autenticación
    //{path: 'users', component: Users, canActivate: [authGuard]}, // canActivate es para definir que se necesita autenticación
    {path: 'usuarios', component: Usuarios, canActivate: [authGuard]}, // canActivate es para definir que se necesita autenticación
    {path: 'user/:id', component: UserDetail, canActivate: [authGuard]},
    {path: 'map', component: Map, canActivate: [authGuard]},
    {path: 'barrios', component: Barrios, canActivate: [authGuard]},
    //{path: 'barrios/:id', component: BarrioDetail, canActivate: [authGuard]},
    //{path: 'zonas', component: Zonas, canActivate: [authGuard]}, DEPRECATED
    {path: 'encuestadores', component: Encuestadores, canActivate: [authGuard]},
    {path: 'encuestadores/:id', component: EncuestadorDetail, canActivate: [authGuard]},
    {path: 'campanias', component: Campanias, canActivate: [authGuard]},
    {path: 'jornadas', component: Jornadas, canActivate: [authGuard]},
    {path: 'jornada/:id', component: JornadaDetail, canActivate: [authGuard]},
];
