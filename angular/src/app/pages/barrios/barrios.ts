import { Component } from '@angular/core';
import { Navbar } from "../../layout/navbar/navbar";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/auth-service/auth-service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-barrios',
  imports: [Navbar, CommonModule, FormsModule],
  templateUrl: './barrios.html',
  styleUrl: './barrios.css'
})
export class Barrios {

  barrios: any[] = [];
  newBarrio = {
    nombre: '',
    descripcion: '',
    centroGeografico: {
      latitud: 0,
      longitud: 0
    }
  };
  rolUser: string | null = null;

  selectedBarrio: any = null; //para manejar la edición de barrios

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private router: Router,
  ){}

  ngOnInit() {
    this.getBarrios();
    this.rolUser = this.auth.getUserRole();
  }

  getBarrios() {
    this.http.get<any>(`${environment.apiUrl}/barrios`).subscribe({
      next: (data) => {
        console.log('Barrios recibidos:', data);
        this.barrios = data;
      },
    error: (error) => {
        console.error('Error al obtener los barrios:', error);
      }
    })
  }

  cancelar() {
    this.newBarrio = {
      nombre: '',
      descripcion: '',
      centroGeografico: {
        latitud: 0,
        longitud: 0
      }
    };
  }

  addBarrio() {
    console.log('Nuevo barrio:', this.newBarrio);
    this.http.post<any>(`${environment.apiUrl}/barrios`, this.newBarrio).subscribe({
      next: (data) => {
        alert('Barrio agregado correctamente');
        this.ngOnInit();
    },
    error: (error) => {
        console.error('Error al agregar el barrio:', error);
        alert('Error al agregar el barrio');
    }
  })
  }

  confirmDelete(id: number): boolean {
    const confirmed = confirm('¿Estás seguro de que desea eliminar este barrio?');
    if (confirmed) {
      this.deleteBarrio(id);
      return true;
    }
    return false;
  }

  deleteBarrio(id: number) {

    const token = localStorage.getItem('token'); //agrtego esta lógica para manejar que solanmente los admin puedan eliminar barrios
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`); //dps en el back el BarrioResource recibe y desglosa la http request y se fija que tenga el rol de Admin el que ejecuta la peticion 

    this.http.delete<any>(`${environment.apiUrl}/barrios/deleteBarrio/${id}`, {headers}).subscribe({
      next: () => {
        alert('Barrio eliminado correctamente');
        this.ngOnInit();
      },
      error: (error) => {
        console.log('Barrio: ' + id);
        console.error('Error al eliminar el barrio:', error);
        alert('Error al eliminar el barrio');
      }
    })
  }

  editBarrio(barrio: any) {
    this.selectedBarrio = {
      id: barrio.id,
      nombre: barrio.nombre,
      descripcion: barrio.descripcion,
      centroGeografico: {
        latitud: barrio.centroGeografico.latitud,
        longitud: barrio.centroGeografico.longitud
      }
    };

    const modal = new (window as any).bootstrap.Modal(document.getElementById('editBarrioModal'));
    modal.show();
  }

  viewBarrio(barrioId: number) {
    this.router.navigate(['/barrios/', barrioId]);
  }
  
  guardarCambiosBarrio() {
  const token = localStorage.getItem('token');
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

  console.log('Guardando cambios para el barrio:', this.selectedBarrio);

  this.http.put<any>(`${environment.apiUrl}/barrios/updateBarrio/${this.selectedBarrio.id}`, this.selectedBarrio, { headers }).subscribe({
    next: () => {
      alert('Barrio actualizado correctamente');
      this.selectedBarrio = null;
      this.ngOnInit();

      // Cerrar el modal manualmente
      const modalEl = document.getElementById('editBarrioModal');
      const modal = (window as any).bootstrap.Modal.getInstance(modalEl);
      modal.hide();
    },
    error: (error) => {
      console.error('Error al actualizar el barrio:', error);
      alert('Error al actualizar el barrio');
    }
  });
  }

}
