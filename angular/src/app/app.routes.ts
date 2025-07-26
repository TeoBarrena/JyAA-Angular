import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { Register } from './pages/register/register';
import { Welcome } from './pages/welcome/welcome';
import { Users } from './pages/users/users';
import { authGuard } from './auth/auth-service/auth-guard';
import { UserDetail } from './pages/user-detail/user-detail';
import { Map } from './pages/map/map';

export const routes: Routes = [
    {path: '', redirectTo: 'login', pathMatch: 'full'},
    {path: 'login', component: Login},
    {path: 'register', component: Register}, 
    {path: 'welcome', component: Welcome}, // canActivate es para definir que se necesita autenticación
    {path: 'users', component: Users, canActivate: [authGuard]}, // canActivate es para definir que se necesita autenticación
    {path: 'user/:id', component: UserDetail, canActivate: [authGuard]},
    {path: 'map', component: Map, canActivate: [authGuard]},
];
