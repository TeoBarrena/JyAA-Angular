import { Component } from '@angular/core';
import { Navbar } from "../../layout/navbar/navbar";
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/auth-service/auth-service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ToastService } from '../../layout/notificaciones/toast.service';
import { Input } from '@angular/core';
import * as L from 'leaflet';
import { Observable, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-barrios',
  imports: [Navbar, CommonModule, FormsModule],
  templateUrl: './barrios.html',
  styleUrl: './barrios.css'
})
export class Barrios {
  barrios: any[] = [];
  rolUser: string[] = [];

  selectedBarrio: any = {
    nombre: '',
    descripcion: '',
    centroGeografico: {
      latitud: 0,
      longitud: 0
    },
    zonas: []
  };

  ogSelectedBarrio: number = 1;


  editMode: boolean = false;
  modalMap: L.Map | null = null;

  modalMapNewBarrio: L.Map | null = null;
  modalMarkers: (L.Marker | L.Polygon)[] = [];

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
    this.auth.getUserRole().subscribe(roles => {
      this.rolUser = roles;
    });
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

  openDetalle(indice: number) {
    this.selectedBarrio = JSON.parse(JSON.stringify(this.barrios[indice]));
    this.ogSelectedBarrio = indice;
    this.editMode = false;

    const modalEl = document.getElementById('modalDetalle');
    if (modalEl) {
      const modal = new (window as any).bootstrap.Modal(modalEl);
      modal.show();

      setTimeout(() => {
        this.createModalMap();
      }, 20);
    }
  }

  enableEdit() {
    this.editMode = true;
  }

  cancelEdit() {
    this.editMode = false;
    this.selectedBarrio = JSON.parse(JSON.stringify(this.barrios[this.ogSelectedBarrio]));
    setTimeout(() => {
      this.createModalMap();
    }, 20);
  }

  saveEdit() {

    this.http.put<any>(
      `${environment.apiUrl}/barrios/${this.selectedBarrio.id}`,
      this.selectedBarrio,
      { withCredentials: true }
    )
      .pipe(
        tap(() => {
          //this.toastService.show('success-outline', 'Barrio actualizado correctamente');
          //this.editMode = false;
        }),
        switchMap(() => this.getBarrios()) 
      )
      .subscribe({
        next: () => {
          this.toastService.show('success-outline', 'Barrio actualizado correctamente');
          this.editMode = false;
          setTimeout(() => {
            this.createModalMap();
          }, 20);
          this.ngOnInit();
        },
        error: (error) => {
          console.error('Error al actualizar el barrio:', error);
          this.toastService.show('error-outline', 'Error al actualizar el barrio');
        }
      });
    /*
      this.http.put<any>(
        `${environment.apiUrl}/barrios/${this.selectedBarrio.id}`,
        this.selectedBarrio,
        { headers }
      ).subscribe({
        next: () => {
          this.toastService.show('success-outline', 'Barrio actualizado correctamente');
          this.editMode = false;
          this.ngOnInit();
          setTimeout(() => {
            this.createModalMap();
          }, 20);
        },
        error: (error) => {
          console.error('Error al actualizar el barrio:', error);
          this.toastService.show('error-outline', 'Error al actualizar el barrio');
        }
      });
      */
  }

  getBarrios(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/barrios`).pipe(
      tap((data) => {
        this.barrios = data;
      })
    );
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
          zoom: 14,
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


  addBarrio() {
    this.http.post<any>(`${environment.apiUrl}/barrios`, this.newBarrio).subscribe({
      next: (data) => {
        //alert('Barrio agregado correctamente');
        (document.getElementById('cancelarNuevoBarrio') as HTMLElement)?.click();
        this.toastService.show("success", "Barrio agregado correctamente");
        this.ngOnInit();
      },
      error: (error) => {
        console.error('Error al agregar el barrio:', error);
        //alert('Error al agregar el barrio');

        this.toastService.show("error", "Error al agregar el barrio");
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

    
    this.http.delete<any>(`${environment.apiUrl}/barrios/deleteBarrio/${id}`, { withCredentials:true }).subscribe({
      next: () => {
        //alert('Barrio eliminado correctamente');
        this.toastService.show("success", "Barrio eliminado correctamente");

        const modalEl = document.getElementById('modalDetalle');
        if (modalEl) {
          const modalInstance = (window as any).bootstrap.Modal.getInstance(modalEl);
          modalInstance?.hide();
        }
        this.ngOnInit();
      },
      error: (error) => {
        console.log('Barrio: ' + id);
        console.error('Error al eliminar el barrio:', error);
        //alert('Error al eliminar el barrio');

        this.toastService.show("error", "Error al eliminar el barrio");
      }
    })
  }


  //----------------------------------- ZONAS ---------------------------------------------

  confirmDeleteZona(id: number): boolean {
    const confirmed = confirm('¿Estás seguro de que desea eliminar esta zona?');
    if (confirmed) {
      this.deleteZona(id);
      return true;
    }
    return false;
  }

  deleteZona(id: number) {
    const token = localStorage.getItem('token'); // Controlar que solo admins puedan eliminar
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.delete<any>(`${environment.apiUrl}/zonas/${id}`, { headers }).subscribe({
      next: () => {
        this.toastService.show("success-outline", "Zona eliminada correctamente");
        this.selectedBarrio.zonas = this.selectedBarrio.zonas.filter((z: { id: number; }) => z.id !== id);
        setTimeout(() => {
          this.createModalMap();
        }, 20);
        this.ngOnInit();
      },
      error: (error) => {
        console.error('Error al eliminar la zona:', error);
        this.toastService.show("error", "Error al eliminar la zona");
      }
    })
  }

  nuevaZona = {
    nombre: '',
    centroGeografico: { latitud: 0, longitud: 0 },
    area: { puntos: [] as any[] }
  };

  modalMapNuevaZona: L.Map | null = null;
  modalMarkersNuevaZona: L.Marker[] = [];
  polygonNuevaZona: L.Polygon | null = null;

  abrirModalAgregarZona() {
    this.nuevaZona = {
      nombre: '',
      centroGeografico: { latitud: 0, longitud: 0 },
      area: { puntos: [] }
    };

    setTimeout(() => {
      this.modalMapNuevaZona = L.map('modalMapNuevaZona', { attributionControl: false })
        .setView(
          [this.selectedBarrio?.centroGeografico?.latitud,
          this.selectedBarrio?.centroGeografico?.longitud],
          14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      }).addTo(this.modalMapNuevaZona);

      // Dibujar zonas existentes del barrio
      if (this.selectedBarrio?.zonas?.length) {
        this.selectedBarrio.zonas.forEach((zona: any) => {
          if (zona.area?.puntos?.length >= 3) {
            const latlngs = zona.area.puntos.map((p: any) => [p.latitud, p.longitud]);
            L.polygon(latlngs, {
              color: '#666',
              weight: 2,
              fillColor: '#999',
              fillOpacity: 0.2,
              dashArray: '4',
            }).addTo(this.modalMapNuevaZona!)
              .bindPopup(`<b>${zona.nombre}</b>`);
          }
        });
      }

      // Click para agregar puntos de la nueva zona
      this.modalMapNuevaZona.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        this.nuevaZona.area.puntos.push({ latitud: lat, longitud: lng });
        this.redibujarPoligonoNuevaZona();
      });

    }, 100);
  }

  redibujarPoligonoNuevaZona() {
    // Eliminar polígono previo
    if (this.polygonNuevaZona) {
      this.modalMapNuevaZona!.removeLayer(this.polygonNuevaZona);
    }

    // Eliminar marcadores previos
    this.modalMarkersNuevaZona.forEach(marker => this.modalMapNuevaZona!.removeLayer(marker));
    this.modalMarkersNuevaZona = [];

    // Dibujar polígono si hay mínimo 3 puntos
    if (this.nuevaZona.area.puntos.length >= 3) {
      const latlngs = this.nuevaZona.area.puntos.map(p => [p.latitud, p.longitud]);
      this.polygonNuevaZona = L.polygon(latlngs, {
        color: '#ff0000',
        fillColor: '#ff6666',
        fillOpacity: 0.4
      }).addTo(this.modalMapNuevaZona!);
    }

    // Actualizar estado del botón de aceptar
    this.actualizarEstadoBotonAceptarZona();
  }

  // Eliminar un punto por índice (usado desde el botón ×)
  eliminarPuntoZona(index: number) {
    this.nuevaZona.area.puntos.splice(index, 1);
    this.redibujarPoligonoNuevaZona();
  }

  guardarNuevaZona() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const body = {
      ...this.nuevaZona,
      barrio: { id: this.selectedBarrio.id }
    };
    this.http.post<any>(`${environment.apiUrl}/zonas/nuevaZona`, body, { headers })
      .pipe(
        switchMap(() => this.getBarrios()) // wait for barrios to refresh
      )
      .subscribe({
        next: () => {
          this.selectedBarrio.zonas = JSON.parse(
            JSON.stringify(this.barrios[this.ogSelectedBarrio].zonas)
          );
          (document.getElementById('cancelarAgregarZonaBtn') as HTMLElement)?.click();
          this.toastService.show("success-outline", "Zona creada correctamente");
          setTimeout(() => {
            this.createModalMap();
          }, 20);
          this.ngOnInit();
        },
        error: (err) => {
          console.error(err);
          this.toastService.show("error", "Error al crear la zona");
        }
      });

    /*
        this.http.post<any>(`${environment.apiUrl}/zonas/nuevaZona`, body, { headers }).subscribe({
          next: () => {
            this.ngOnInit();
            setTimeout(() => {
              this.selectedBarrio.zonas = JSON.parse(JSON.stringify(this.barrios[this.ogSelectedBarrio].zonas));
              (document.getElementById('cancelarAgregarZonaBtn') as HTMLElement)?.click();
              this.toastService.show("success-outline", "Zona creada correctamente");
              setTimeout(() => {
                this.createModalMap();
              }, 200);
            }, 200);
    
          },
          error: (err) => {
            console.error(err);
            this.toastService.show("error", "Error al crear la zona");
          }
        }); */
  }

  cancelarNuevaZona() {
    this.nuevaZona = { nombre: '', centroGeografico: { latitud: 0, longitud: 0 }, area: { puntos: [] } };
    if (this.modalMapNuevaZona) {
      this.modalMapNuevaZona.off();
      this.modalMapNuevaZona.remove();
      this.modalMapNuevaZona = null;
    }
    this.editarZona = false;
  }

  // Controlar que el botón de aceptar esté habilitado solo si se cumplen condiciones
  actualizarEstadoBotonAceptarZona() {
    const btn = document.getElementById('btnAceptarZona') as HTMLButtonElement;
    const { nombre, centroGeografico, area } = this.nuevaZona;
    const habilitado =
      nombre.trim() !== '' &&
      centroGeografico.latitud !== 0 &&
      centroGeografico.longitud !== 0 &&
      area.puntos.length >= 3;

    if (btn) btn.disabled = !habilitado;
  }

  eliminarPunto(index: number) {
    this.nuevaZona.area.puntos.splice(index, 1);
    this.redibujarPoligonoNuevaZona();
  }

  editarZona: boolean = false;

  guardarZonaExistente() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const body = {
      ...this.nuevaZona,
      id: this.editarZonaId,
      barrio: { id: this.selectedBarrio.id }
    };
    this.http.put<any>(`${environment.apiUrl}/zonas/${this.editarZonaId}`, body, { headers })
      .pipe(
        switchMap(() => this.getBarrios())
      )
      .subscribe({
        next: () => {
          this.selectedBarrio.zonas = JSON.parse(
            JSON.stringify(this.barrios[this.ogSelectedBarrio].zonas)
          );
          (document.getElementById('cancelarAgregarZonaBtn') as HTMLElement)?.click();
          this.toastService.show("success-outline", "Zona actualizada correctamente");
          setTimeout(() => {
            this.createModalMap();
          }, 20);
          this.ngOnInit();
        },
        error: (err) => {
          console.error(err);
          this.toastService.show("error", "Error al actualizar la zona");
        }
      });

    /* 
        this.http.put<any>(`${environment.apiUrl}/zonas/${this.editarZonaId}`, body, { headers }).subscribe({
          next: () => {
            this.ngOnInit();
            setTimeout(() => {
              this.selectedBarrio.zonas = JSON.parse(JSON.stringify(this.barrios[this.ogSelectedBarrio].zonas));
              (document.getElementById('cancelarAgregarZonaBtn') as HTMLElement)?.click();
              this.toastService.show("success-outline", "Zona actualizada correctamente");
              setTimeout(() => {
                this.createModalMap();
              }, 500);
            }, 500);
    
          },
          error: (err) => {
            console.error(err);
            this.toastService.show("error", "Error al crear la zona");
          }
        }); */
  }

  editarZonaId: number | null = null;

  editarZonaExistente(i: number) {
    this.editarZona = true;
    this.nuevaZona = JSON.parse(JSON.stringify(this.selectedBarrio.zonas[i]));
    this.editarZonaId = this.selectedBarrio.zonas[i].id;

    setTimeout(() => {
      this.modalMapNuevaZona = L.map('modalMapNuevaZona', { attributionControl: false })
        .setView(
          [this.nuevaZona?.centroGeografico?.latitud,
          this.nuevaZona?.centroGeografico?.longitud],
          14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      }).addTo(this.modalMapNuevaZona);

      const otrasZonas = [
        ...this.selectedBarrio.zonas.slice(0, i),
        ...this.selectedBarrio.zonas.slice(i + 1)
      ];
      if (otrasZonas.length) {
        otrasZonas.forEach((zona: any) => {
          if (zona.area?.puntos?.length >= 3) {
            const latlngs = zona.area.puntos.map((p: any) => [p.latitud, p.longitud]);
            L.polygon(latlngs, {
              color: '#666',
              weight: 2,
              fillColor: '#999',
              fillOpacity: 0.2,
              dashArray: '4',
            }).addTo(this.modalMapNuevaZona!)
              .bindPopup(`<b>${zona.nombre}</b>`);
          }
        });
      }

      this.redibujarPoligonoNuevaZona();
      this.modalMapNuevaZona.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        this.nuevaZona.area.puntos.push({ latitud: lat, longitud: lng });
        this.redibujarPoligonoNuevaZona();
      });

    }, 20);
  }
}
