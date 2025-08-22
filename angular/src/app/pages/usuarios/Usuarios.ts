import { Component } from '@angular/core';
import { Navbar } from "../../layout/navbar/navbar";
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/auth-service/auth-service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment.development';
import { Injectable } from '@angular/core';

import { ToastService } from '../../layout/notificaciones/toast.service';

@Component({
  selector: 'app-usuarios',
  imports: [Navbar, CommonModule, FormsModule],
  templateUrl: './Usuarios.html',
  styleUrl: './Usuarios.css'
})
@Injectable({ providedIn: 'root' }) //lo hago inyectable para poder usarlo en user-details
export class Usuarios {

  //Para almacenar los usuarios
  users: any[] = [];
  paginatedUsers: any[] = [];
  organizaciones: any[] = [];

  //Para almacenar el rol del usuario autenticado
  userRole: string[] = [];

  //Paginación
  //pageSizeOptions: number[] = [2, 5, 10];
  currentPage: number = 1;
  selectedPageSize: number = parseInt(localStorage.getItem('pageSize') || '5', 10);

  emailFilter: string = '';
  estadoFilter: string = '';
  tipoFilter: string = '';
  organizacionFilter: string = '';
  filtered: any[] = [];
  currentUserId: number | null = null;
  currentUserRole: string | null = null;

  newUser: any = {
    email: '',
    nombre: '',
    apellido: '',
    password: '',
    personalSalud: false,
    organizacion: null,
    matricula: 0,
    miembroOrg: false,
    admin: false
  };

  constructor(
    private toastService: ToastService, //Notificaciones
    private http: HttpClient, //Inyeccion de HttpClient
    private auth: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.getOrganizaciones();
    this.getUsers();
    this.currentUserId = this.auth.getUserId();
    this.auth.getUserRole().subscribe(roles => {
      this.userRole = roles;
    })
  }

  getUsers() {
    this.http.get<any[]>(`${environment.apiUrl}/usuarios`).subscribe({
      next: data => {
        this.users = data.map(user => {
          // Si user.organizacion es un número, buscá el objeto por ID, esto porque me estaba dando error en como me daba los usuarios
          //algunos usuarios venian con organizacion: 1 y otros con organizacion: {id: 1, nombre: 'Org1'}
          if (user.organizacion && typeof user.organizacion === 'number') {
            const org = this.organizaciones.find(o => o.id === user.organizacion);
            if (org) {
              user.organizacion = org;
            }
          }
          return user;
        });
        this.updatePaginatedUsers();
      },
      error: () => {
        //alert('Error al obtener los usuarios');
        this.toastService.show('error', 'Error al obtener los usuarios');
      }
    })
  }

  getOrganizaciones() {
    this.http.get<any[]>(`${environment.apiUrl}/organizaciones`).subscribe({
      next: data => {
        this.organizaciones = data;
      },
      error: () => {
        //alert('Error al obtener las organizaciones');
        this.toastService.show('error', 'Error al obtener las organizaciones');
      }
    });
  }

  updatePaginatedUsers() {
    this.filtered = this.getFilteredUsers();
    const start = (this.currentPage - 1) * this.selectedPageSize;
    const end = start + this.selectedPageSize;
    this.paginatedUsers = this.filtered.slice(start, end); //agarra los usuarios para la página actual
  }

  changePageSize(size: number) {
    this.selectedPageSize = Number(size);
    localStorage.setItem('pageSize', size.toString())
    this.currentPage = 1; //Resetear a la primera página
    this.updatePaginatedUsers();
  }

  nextPage() {
    if ((this.currentPage * this.selectedPageSize) < this.filtered.length) {
      this.currentPage++;
      this.updatePaginatedUsers();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedUsers();
    }
  }

  getFilteredUsers() {
    const filtered = this.users.filter(user =>
      (
        !this.emailFilter ||
        user.email?.toLowerCase().includes(this.emailFilter.toLowerCase()) ||
        user.nombre?.toLowerCase().includes(this.emailFilter.toLowerCase()) ||
        user.apellido?.toLowerCase().includes(this.emailFilter.toLowerCase())
      )
      &&
      (!this.estadoFilter || user.estado === this.estadoFilter) &&
      (!this.tipoFilter || this.userMatchesTipo(user, this.tipoFilter)) &&
      (!this.organizacionFilter || user.organizacion?.nombre === this.organizacionFilter)
    );
    return filtered;
  }

  userMatchesTipo(user: any, tipo: string): boolean {
    if (tipo === 'Personal de Salud') {
      return !!user.matricula;
    } else if (tipo === 'Miembro de Organización Civil') {
      return !!user.organizacion;
    } else if (tipo === 'Admin') {
      return !user.matricula && !user.organizacion;
    }
    return true; // Si no se especifica tipo
  }

  onFilterChange() {
    this.currentPage = 1;
    this.updatePaginatedUsers();
  }

  guardarNuevoUsuario() {
    const body: any = { //que sea de tipo any permite agregar propiedades dinámicamente
      email: this.newUser.email,
      nombre: this.newUser.nombre,
      apellido: this.newUser.apellido,
      password: this.newUser.password,
      admin: this.newUser.admin
    };

    if (!this.newUser.admin) {
      if (this.newUser.personalSalud && this.newUser.matricula > 0) {
        body.matricula = this.newUser.matricula;
      }

      if (this.newUser.miembroOrg && this.newUser.organizacion) {
        body.organizacion = { id: this.newUser.organizacion.id };
      }
    }


    this.http.post(`${environment.apiUrl}/usuarios/nuevoUser`, body, { withCredentials: true }).subscribe({
      next: () => {
        //alert('Usuario registrado exitosamente');
        this.toastService.show('success', 'Usuario registrado exitosamente');
        this.getUsers();
        this.resetForm(); // limpiar el formulario
        const closeModalBtn = document.getElementById('closeModalBtn'); //(para que active el data-bs-dismiss)
        if (closeModalBtn) closeModalBtn.click();
      },
      error: (errorResponse) => {
        //alert('Error al registrar usuario revise los datos ingresados ');
        
        const backendMessage = typeof errorResponse.error === 'string' ? errorResponse.error : 'Error al registrar usuario';
        this.toastService.show('error', backendMessage, 8000);
      }
    });
  }

  resetForm(): void {
    this.newUser = {
      email: '',
      nombre: '',
      apellido: '',
      password: '',
      personalSalud: false,
      organizacion: null,
      matricula: 0,
      miembroOrg: false,
      admin: false
    };
  }

  onAdminChange(): void {
    if (this.newUser.admin) {
      this.newUser.personalSalud = false;
      this.newUser.miembroOrg = false;
      this.newUser.organizacion = null;
      this.newUser.matricula = 0;
    }
  }

  onPersonalSaludChange(): void {
    if (this.newUser.personalSalud) {
      this.newUser.admin = false;
    }
  }

  onMiembroOrgChange(): void {
    if (this.newUser.miembroOrg) {
      this.newUser.admin = false;
    } else {
      this.newUser.organizacion = null;
    }
  }

  viewUser(userId: number) {
    this.router.navigate(['/user/', userId]); //le pasa por parametro el id del usuario a la ruta
  }

  confirmDelete(userId: number): boolean {
    const confirmed = confirm('¿Estás seguro de que desea eliminar este usuario?');
    if (confirmed) {
      this.deleteUser(userId);
      return true;
    }
    return false;
  }

  public deleteUser(userId: number): void {

    this.http.delete(`${environment.apiUrl}/usuarios/deleteUser/${userId}`, { withCredentials: true }).subscribe({
      next: () => {
        //alert('Usuario eliminado exitosamente');
        this.toastService.show('success', 'Usuario eliminado exitosamente');
        this.getUsers();
      },
      error: (mensaje) => {
        //alert('Error al eliminar el usuario ' + mensaje);

        this.toastService.show('error', 'Error al eliminar el usuario ' + mensaje);
      }
    });
  }
  getTotalPages(): number {
    return Math.ceil(this.filtered.length / this.selectedPageSize);
  }

  getPageNumbersToShow(): number[] {
    const totalPages = this.getTotalPages();
    const pages: number[] = [];

    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(totalPages, this.currentPage + 2);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }


  public cambiarEstado(userId: number, estado: string): void {

    this.http.patch(`${environment.apiUrl}/usuarios/${userId}/${estado}`, null, { withCredentials: true }).subscribe({
      next: () => {
        this.toastService.show('success-outline', 'Estado del usuario modificado', 2000);
        this.getUsers();
      },
      error: (errorResponse) => {
        const backendMessage = typeof errorResponse.error === 'string' ? errorResponse.error : 'Error al cambiar el estado del usuario';
        this.toastService.show('error', backendMessage, 8000);
      }
    });
  }
  get formularioValido(): boolean {
    const u = this.newUser;

    // Validación de campos básicos
    const camposObligatorios = u.nombre?.trim() && u.apellido?.trim() && u.email?.trim() && u.password?.trim();

    // Validaciones condicionales
    const requiereMatricula = u.personalSalud ? !!u.matricula : true;
    const requiereOrganizacion = u.miembroOrg ? !!u.organizacion : true;

    // Al menos uno de los roles debe estar seleccionado
    const alMenosUnRol = u.admin || u.personalSalud || u.miembroOrg;

    return !!(camposObligatorios && requiereMatricula && requiereOrganizacion && alMenosUnRol);
  }


  goToPage(page: number): void {
    this.currentPage = page;
    this.updatePaginatedUsers();
  }

}
