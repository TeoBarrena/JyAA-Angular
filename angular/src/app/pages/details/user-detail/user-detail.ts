import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router'; //sirve para obtener parámetros de la ruta
import { CommonModule } from '@angular/common'; 
import { Navbar } from '../../../layout/navbar/navbar';
import { environment } from '../../../../environments/environment.development';
import { Usuarios } from '../../usuarios/Usuarios'; //Importar Users para poder usar el método deleteUser
import { FormsModule } from '@angular/forms'; //Importar FormsModule para usar ngModel en el formulario

@Component({
  selector: 'app-user-detail',
  imports: [CommonModule,Navbar, FormsModule],
  templateUrl: './user-detail.html',
  styleUrl: './user-detail.css'
})
export class UserDetail {

  userId: number = 0;
  user: any;
  organizaciones: any[] = [];
  roles = ['Admin', 'Personal de Salud' ];

  editUser: any = {
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    repeatPassword: '',
    rol: null, 
    organizacion: null
  };

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute, //Inyección de ActivatedRoute para obtener parámetros de la ruta
    private users: Usuarios, //Inyección del servicio Users para poder usar su método deleteUser
    private router: Router,
  ){}

  ngOnInit() {
    this.userId = Number(this.route.snapshot.paramMap.get('id')); //en users.ts esta como userId, pero en app.routes.ts esta como :id x eso se hace el get de 'id'
    this.http.get<any>(`${environment.apiUrl}/usuarios/${this.userId}`).subscribe({
      next: (data) => {
        console.log('DATA :', data);
        this.user = data;
        console.log('Usuario obtenido:', this.user);
        this.getOrganizaciones();
      },
      error: () => {
        alert('Error al obtener los detalles del usuario con ID: ' + this.userId);
      }
    });
  }

  confirmDelete(userId: number) {
    if (this.users.confirmDelete(userId)){
      this.router.navigate(['/users']); //Redirige a la lista de usuarios después de eliminar
    }
  } 

  onRolChange() {
    if (this.editUser.rol === 'Admin') {
      this.editUser.organizacion = null;
      //this.matricula = null; // Si el rol es Admin, se limpia la matrícula
    }
    //this.matricula = this.user.matricula; // recupera la matrícula del usuario actual
  }

  getOrganizaciones() {
    this.http.get<any[]>(`${environment.apiUrl}/organizaciones`).subscribe({
      next: (data) => {
        this.organizaciones = data;
        this.asignarValoresPorDefecto(); //lo  pongo aca porque da error si lo pongo en el ngOnInit
      },
      error: () => {
        alert('Error al obtener las organizaciones');
      }
    });
  }

  asignarValoresPorDefecto() {
    this.editUser.nombre = this.user.nombre;
    this.editUser.apellido = this.user.apellido;
    this.editUser.email = this.user.email;
    this.editUser.rol = this.user.roles?.[0] || null;

    
    this.editUser.organizacion = this.organizaciones.find(
      org => org.id === this.user.organizacion?.id
    ) || null;
    console.log('Valores por defecto asignados:', this.editUser);
  }

  updateUser() {
    console.log('Actualizando usuario:', this.editUser);
    //ACA HAY QUE MANEJAR ESTOS CASOS
    /*  
    1: Si el rol es 'Admin', la organización debe ser null.
    2: Si se cambia la contraseña la repeticion debe ser igual a la contraseña.
    3: Si no tiene rol, se le asigna el rol de la organización.
    4: Si se cambia el email, se debe verificar que no exista otro usuario con el mismo email (creo que el back da error directamente)
    5: Ingreso de matricula distinto a otra existente, mismo caso que el email.
    */ 
  }

}
