import { Component } from '@angular/core';
import { Navbar } from "../../layout/navbar/navbar";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { AuthService } from '../../auth/auth-service/auth-service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-campanias',
  imports: [Navbar, FormsModule, CommonModule, RouterLink],
  templateUrl: './campanias.html',
  styleUrl: './campanias.css'
})
export class Campanias {

  campanias: any[] = [];
  barrios: any[] = [];

  rolUser: string | null = null;

  nuevaCampania = {
    nombre: '',
    inicio: '',
    fin: '',
    barrioId: null
  }

  campaniaEditada: any = {
    id: null,
    nombre: '',
    inicio: '',
    fin: '',
    barrioId: null
  }

  constructor(
    private http: HttpClient,
    private auth: AuthService,
  ){}


  ngOnInit(){
    this.getCampanias();
    this.rolUser = this.auth.getUserRole();
  }


  getCampanias(){
    this.http.get<any>(`${environment.apiUrl}/campanias`).subscribe({
      next: (data) => {
        //console.log('Campañas recibidas:', data);
        this.campanias = data;
      },
      error: (error) => {
        alert(`Error al obtener las campañas: ${error}`);
      }
    })
    this.getBarrios();
  }

  getBarrios() {
    this.http.get<any>(`${environment.apiUrl}/barrios`).subscribe({
      next: (data) => {
        //console.log('Barrios recibidos:', data);
        this.barrios = data;
      },
    error: (error) => {
        console.error('Error al obtener los barrios:', error);
      }
    })
  }



  crearCampania() {
    const body = {
      nombre: this.nuevaCampania.nombre,
      inicio: this.nuevaCampania.inicio,
      fin: this.nuevaCampania.fin,
      barrio: {
        id: this.nuevaCampania.barrioId
      }
    };

    const headers = this.auth.getHeaderHttp();

      this.http.post<any>(`${environment.apiUrl}/campanias/nuevaCampania`, body, { headers }).subscribe({
        next: (data) => {
          //console.log('Campaña creada:', body);
          alert('Campaña creada correctamente');
          this.getCampanias();
          this.resetFormulario();
          this.cerrarModal('addCampaniaModal');
        },
        error: (error) => {
          console.error('Error al crear la campaña:', error);
          alert('Error al crear la campaña');
        }
      })
  }
  
  resetFormulario() {
    this.nuevaCampania = {
      nombre: '',
      inicio: '',
      fin: '',
      barrioId: null
    };
  }

  cerrarModal(modalId: string) {
  const modalElement = document.getElementById(modalId);
  if (modalElement) {
    const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
    if (modal) {
      modal.hide();
    }
  }
}
  editCampania(campania: any) {
    this.campaniaEditada = { 
      id: campania.id,
      nombre: campania.nombre,
      inicio: campania.inicio,
      fin: campania.fin? campania.fin : '',
      barrioId: campania.barrio ? campania.barrio.id : null
    }

    const modalElement = document.getElementById('editCampaniaModal');
    if (modalElement) {
      const modal = (window as any).bootstrap.Modal.getOrCreateInstance(modalElement);
      modal.show();
    }
  }

  actualizarCampania() {
    const body = {
    nombre: this.campaniaEditada.nombre,
    inicio: this.campaniaEditada.inicio,
    fin: this.campaniaEditada.fin,
    barrio: {
      id: this.campaniaEditada.barrioId
      }
    };

    const headers = this.auth.getHeaderHttp();

    this.http.put<any>(`${environment.apiUrl}/campanias/editCampania/${this.campaniaEditada.id}`, body, { headers }).subscribe({
      next: (data) => {
        //console.log('Campaña actualizada:', body);
        alert('Campaña actualizada correctamente');
        this.getCampanias();
        //console.log('Info desde el back:', data);
        const modal = (window as any).bootstrap.Modal.getInstance(document.getElementById('editCampaniaModal'));
        modal.hide();
      },
      error: (error) => {
        console.error('Error al actualizar la campaña:', error);
        alert('Error al actualizar la campaña');
      }
    });
  }

  confirmDelete(campaniaId: number) {
    const confirmed = confirm('¿Estás seguro de que deseas eliminar esta campaña?');
    if (confirmed) {
      this.deleteCampania(campaniaId);
    }
  }

  deleteCampania(campaniaId: number) {
    //console.log('Eliminando campaña con ID:', campaniaId);
    const headers = this.auth.getHeaderHttp();
    this.http.delete(`${environment.apiUrl}/campanias/deleteCampania/${campaniaId}`, { headers }).subscribe({
      next: () => {
        alert('Campaña eliminada correctamente');
        this.getCampanias();
      },
      error: (error) => {
        console.error('Error al eliminar la campaña:', error);
        alert('Error al eliminar la campaña');
      }
    })
  }


}
