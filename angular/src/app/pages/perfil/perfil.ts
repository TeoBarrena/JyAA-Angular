import { Component } from '@angular/core';
import { Navbar } from "../../layout/navbar/navbar";
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { AuthService } from '../../auth/auth-service/auth-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ToastService } from '../../layout/notificaciones/toast.service';
import { Router } from '@angular/router';


export interface Usuario {
    id: number;
    email: string;
    nombre: string;
    apellido: string;
    organizaciones: org[];
    roles: rol[];
    matricula: number | null;
    admin: boolean;
}
export interface rol {
    id: number;
    nombre: string;
}
export interface org {
    id: number;
    nombre: string;
}
@Component({
    standalone: true,
    selector: 'app-perfil',
    imports: [Navbar, CommonModule , FormsModule],
    templateUrl: './perfil.html',
    styleUrl: './perfil.css'
})
export class Perfil {

    constructor(
        private toastService: ToastService,
        private http: HttpClient,
        private authService: AuthService,
        private route: ActivatedRoute,
        private router: Router
    ) { }

    usuario: Usuario | null = null;

    ngOnInit() {
        this.getUsuario();
    }

    getUsuario() {
        this.http.get<Usuario>(`${environment.apiUrl}/usuarios/${localStorage.getItem('userId')}`).subscribe({
            next: data => {
                this.usuario = data;
            },
            error: () => {
                this.toastService.show('error', 'Error al obtener el usuario');
            }
        });
    }

    logout() {
        this.authService.logout();
        this.router.navigate(['/login']);
    }

    passwordActual: string | null = null;
    pass1: string | null = null;
    pass2: string | null = null;
    errMsj: string[] = [];

    cancelar() {
        this.passwordActual = null;
        this.pass1 = null;
        this.pass2 = null;
        this.errMsj = [];
    }

    cambiarContrasenia() {
        this.errMsj = [];
        if (this.passwordActual == null) {
            this.errMsj[0] = "Ingrese su contraseña actual";
            return;
        }
        if (this.pass1 == null) {
            this.errMsj[1] = "Ingrese una contraseña nueva";
            return;
        }
        if (this.pass2 == null) {
            this.errMsj[2] = "Ingrese la confirmación de la contraseña";
            return;
        }
        if (this.pass1 != this.pass2) {
            this.errMsj[1] = "Las contraseñas deben coincidir";
            this.errMsj[2] = "Las contraseñas deben coincidir";
            return;
        }

        const body = {
            id: this.usuario?.id,
            email: this.usuario?.email,
            password: this.passwordActual,
            passwordNueva: this.pass1,
        }
        this.http.patch<any>(`${environment.apiUrl}/usuarios/updateContraseña`, body).subscribe({
            next: () => {
                (document.getElementById('closeBtn') as HTMLElement)?.click(); //cerrar modal
                setTimeout(()=>{
                    this.toastService.show("success-outline", "Se actualizó la contraseña correctamente");
                },100);
            },
            error: (error) => {
                if(error.error == "Contraseña actual incorrecta"){
                    this.errMsj[0] = error.error;
                }
                else{
                    console.log(error);
                    this.toastService.show("error-outline", error.error, 8000);
                }
            }
        });
    }

}
