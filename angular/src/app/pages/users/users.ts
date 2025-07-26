import { Component } from '@angular/core';
import { Navbar } from "../../layout/navbar/navbar";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/auth-service/auth-service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment.development';
import { Injectable } from '@angular/core';

@Component({
  selector: 'app-users',
  imports: [Navbar, CommonModule, FormsModule],
  templateUrl: './users.html',
  styleUrl: './users.css'
})
@Injectable({providedIn: 'root'}) //lo hago inyectable para poder usarlo en user-details
export class Users {

  //Para almacenar los usuarios
  users: any[] = [];
  paginatedUsers: any[] = [];
  organizaciones: any[] = [];

  //Para almacenar el rol del usuario autenticado
  userRole: string | null = null;

  //Paginación
  pageSizeOptions: number[] = [2, 5, 10];
  currentPage: number = 1;
  selectedPageSize: number = 5;

  emailFilter: string = '';
  estadoFilter: string = '';
  tipoFilter: string = '';
  organizacionFilter: string = '';
  filtered: any[] = [];
  currentUserId: number = 0;
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
    private http: HttpClient, //Inyeccion de HttpClient
    private auth: AuthService,
    private router: Router
  ){}

  ngOnInit() {
    this.getOrganizaciones();
    this.getUsers();
    this.userRole = this.auth.getUserRole();
    this.currentUserId = Number(localStorage.getItem('userId'));
    this.currentUserRole = localStorage.getItem('userRole');
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
        alert('Error al obtener los usuarios');
      }
    })
  }

  getOrganizaciones() {
    this.http.get<any[]>(`${environment.apiUrl}/organizaciones`).subscribe({
      next: data => {
        this.organizaciones = data;
        console.log('Organizaciones obtenidas:', this.organizaciones);
      },
      error: () => {
        alert('Error al obtener las organizaciones');
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
    (!this.emailFilter || user.email?.toLowerCase().includes(this.emailFilter.toLowerCase())) &&
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

  guardarNuevoUsuario(){
    const body: any = { //que sea de tipo any permite agregar propiedades dinámicamente
      email: this.newUser.email,
      nombre: this.newUser.nombre,
      apellido: this.newUser.apellido,
      password: this.newUser.password,
      admin: this.newUser.admin
    };

    if (!this.newUser.admin){
      if (this.newUser.personalSalud && this.newUser.matricula > 0){
        body.matricula = this.newUser.matricula;
      }

      if (this.newUser.miembroOrg && this.newUser.organizacion){
        body.organizacion = {id: this.newUser.organizacion.id};
      }
    }

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    console.log('Token:', token);
    console.log(body);

    console.log('Rol: ' + localStorage.getItem('userRole'));

    this.http.post(`${environment.apiUrl}/usuarios/nuevoUser`, body, { headers }).subscribe({
      next: () => {
        alert('Usuario registrado exitosamente');
        this.getUsers();
      },
      error: () => {
        alert('Error al registrar usuario revise los datos ingresados ');
      }
    });
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

  cancelar():void{
    this.newUser.admin = false;
    this.newUser.personalSalud = false;
    this.newUser.miembroOrg = false;
    this.newUser.organizacion = null;
    this.newUser.matricula = 0;
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
    const token = localStorage.getItem('token'); //se necesita el token para en el back verificar que el usuario es admin 
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`); //setea el header de autorización con el token

    this.http.delete(`${environment.apiUrl}/usuarios/deleteUser/${userId}`, { headers }).subscribe({
      next: () => {
        alert('Usuario eliminado exitosamente');
        this.getUsers();
      },
      error: (mensaje) => {
        alert('Error al eliminar el usuario ' + mensaje);
      }
    });
  }

}
