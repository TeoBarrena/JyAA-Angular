import { Component } from '@angular/core';
import { Navbar } from "../../layout/navbar/navbar";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/auth-service/auth-service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ToastService } from '../../layout/notificaciones/toast.service';
import { Input } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-barrios',
  imports: [Navbar, CommonModule, FormsModule],
  templateUrl: './barrios.html',
  styleUrl: './barrios.css'
})
export class Barrios {
  barrios: any[] = [];
  rolUser: string | null = null;

  selectedBarrio: any = {
    nombre: '',
    descripcion: '',
    centroGeografico: {
      latitud: 0,
      longitud: 0
    },
    zonas: []
  };

  ogSelectedBarrio: any = {
    nombre: '',
    descripcion: '',
    centroGeografico: {
      latitud: 0,
      longitud: 0
    },
    zonas: []
  };
  

  editMode: boolean = false; // NUEVO

  newBarrio = {
    nombre: '',
    descripcion: '',
    centroGeografico: {
      latitud: 0,
      longitud: 0
    },
    zonas: []
  };

  constructor(
    private toastService: ToastService, //Notificaciones
    private http: HttpClient,
    private auth: AuthService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.getBarrios();
    this.rolUser = this.auth.getUserRole();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.barrios.forEach(barrio => {
        const mapId = `${barrio.id}map`;
        const lat = barrio.centrogeografico.latitud;
        const lng = barrio.centrogeografico.longitud;

        const mapDiv = document.getElementById(mapId);
        if (mapDiv && !mapDiv.hasChildNodes()) {
          const map = L.map(mapId).setView([lat, lng], 16);

          L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(map);

          // No agregamos ningún marcador
        }
      });
    }, 0);
  }
  openDetalle(barrio: any) {
    this.selectedBarrio = { ...barrio }; 
    this.ogSelectedBarrio = { ...barrio }; 
    this.editMode = false; 
    const modalEl = document.getElementById('modalDetalle');
    if (modalEl) {
      const modal = new (window as any).bootstrap.Modal(modalEl);
      modal.show();
    }
  }

  enableEdit() {
    this.editMode = true;
  }

  cancelEdit() {
    this.editMode = false;
    this.selectedBarrio = { ...this.ogSelectedBarrio };
    //this.openDetalle(this.selectedBarrio);
  }

  saveEdit() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.put<any>(
      `${environment.apiUrl}/barrios/${this.selectedBarrio.id}`,
      this.selectedBarrio,
      { headers }
    ).subscribe({
      next: () => {
        //alert('Barrio actualizado correctamente');        
        this.toastService.show('success-outline', 'Barrio actualizado correctamente');
        this.editMode = false;
        this.ngOnInit();
      },
      error: (error) => {
        console.error('Error al actualizar el barrio:', error);
        //alert('Error al actualizar el barrio');
        this.toastService.show('error-outline', 'Error al actualizar el barrio');
      }
    });
  }

  getBarrios() {
  this.http.get<any>(`${environment.apiUrl}/barrios`).subscribe({
    next: (data) => {
      //console.log('Barrios recibidos:', data);
      this.barrios = data;
      setTimeout(() => {
        this.renderMaps();
      }, 10);
    },
    error: (error) => {
      //console.error('Error al obtener los barrios:', error);
      this.toastService.show('error','Error al obtener los barrios');
    }
  })
}

renderMaps() {
  this.barrios.forEach(barrio => {
    const mapId = `${barrio.id}map`;
    const lat = barrio.centroGeografico.latitud;
    const lng = barrio.centroGeografico.longitud;

    const mapDiv = document.getElementById(mapId);
    if (mapDiv && !mapDiv.hasChildNodes()) {
      const map = L.map(mapId, {
        attributionControl: false,
    minZoom: 11,
    maxZoom: 14,
    zoom:14,
        zoomControl: false,  // Oculta los botones + y -
      }).setView([lat, lng], 16);

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    }
  });
}



  cancelar() {
    this.newBarrio = {
      nombre: '',
      descripcion: '',
      centroGeografico: {
        latitud: 0,
        longitud: 0
      },
      zonas: []
    };
  }

  //agregar lógica para header
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

    this.http.delete<any>(`${environment.apiUrl}/barrios/deleteBarrio/${id}`, { headers }).subscribe({
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
        const modal = (window as any).Modal.getInstance(modalEl);
        modal.hide();
      },
      error: (error) => {
        console.error('Error al actualizar el barrio:', error);
        alert('Error al actualizar el barrio');
      }
    });
  }

}
