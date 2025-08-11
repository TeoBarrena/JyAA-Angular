import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { Register } from './pages/register/register';
import { Welcome } from './pages/welcome/welcome';
//import { Users } from './pages/users/users'; DEPRECATED
import { Usuarios } from './pages/usuarios/Usuarios';
import { authGuard } from './auth/auth-service/auth-guard';
import { UserDetail } from './pages/user-detail/user-detail';
import { Map } from './pages/map/map';
import { Barrios } from './pages/barrios/barrios';
import { Zonas } from './pages/zonas/zonas';
import { Encuestadores } from './pages/encuestadores/encuestadores';
import { Campanias } from './pages/campanias/campanias';
import { Jornadas } from './pages/jornadas/jornadas';

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
    {path: 'zonas', component: Zonas, canActivate: [authGuard]},
    {path: 'encuestadores', component: Encuestadores, canActivate: [authGuard]},
    {path: 'campanias', component: Campanias, canActivate: [authGuard]},
    {path: 'jornadas', component: Jornadas, canActivate: [authGuard]},
];
