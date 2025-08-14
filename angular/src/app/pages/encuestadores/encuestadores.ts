import { Component } from '@angular/core';
import { Navbar } from "../../layout/navbar/navbar";
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { AuthService } from '../../auth/auth-service/auth-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

// agregar token y headers para los http requests

@Component({
  selector: 'app-encuestadores',
  imports: [Navbar, CommonModule, FormsModule, RouterLink],
  templateUrl: './encuestadores.html',
  styleUrl: './encuestadores.css'
})
export class Encuestadores {

  encuestadores: any[] = [];

  rolUser: string | null = null;

  jornadas: any[] = [];

  selectedJornadaId: number | null = null; //esto para el select de jornadas, y no ingresar repetidas

  newEncuestador: any = {
    nombre: '',
    dni: '',
    genero: '',
    ocupacion: '',
    jornadas: [],
  }

  constructor(
    private http: HttpClient,
    private auth: AuthService,

  ){}

  ngOnInit() {
    this.rolUser = this.auth.getUserRole();
    this.getEncuestadores();
  }

  getEncuestadores() {
    this.http.get<any>(`${environment.apiUrl}/encuestadores`).subscribe({
      next: (data) => {
        this.encuestadores = data;
        //console.log('Encuestadores: ', data);
        this.getJornadas();
      },
      error: (error) => {
        console.error('Error fetching encuestadores:', error);
        alert('Error al obtener los encuestadores. Por favor, inténtelo de nuevo más tarde.');
      }
    })
  }

  getJornadas() {
    this.http.get<any>(`${environment.apiUrl}/jornadas`).subscribe({
      next: (data) => {
        this.jornadas = data;
        //console.log('Jornadas: ', data);
      },
      error: (error) => {
        console.error('Error fetching jornadas:', error);
        alert('Error al obtener las jornadas. Por favor, inténtelo de nuevo más tarde.');
      }
    })
  }

  getAvailableJornadas() {
  return this.jornadas.filter(j => !this.newEncuestador.jornadas.some((ej: any) => ej.id === j.id));
}

  addJornada(){
    if (this.selectedJornadaId){
      const jornadaSeleccionada = this.jornadas.find(j => j.id === this.selectedJornadaId);

      const yaAgregada = this.newEncuestador.jornadas.some((j: any) => j.id === this.selectedJornadaId);

      if (jornadaSeleccionada && !yaAgregada){
        this.newEncuestador.jornadas.push(jornadaSeleccionada);
      }
      this.selectedJornadaId = null;
    }
  }

  removeJornada(jornadaId: number) {
    this.newEncuestador.jornadas = this.newEncuestador.jornadas.filter((j: any) => j.id !== jornadaId);
  }

  confirmDelete(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar este encuestador?')){
      //console.log('ID: ', id);
      const headers = this.auth.getHeaderHttp();
      //console.log('Headers: ', headers);
      this.http.delete(`${environment.apiUrl}/encuestadores/deleteEncuestador/${id}`, { headers }).subscribe({
        next: () => {
          alert('Encuestador eliminado correctamente.');
          this.getEncuestadores();
        },
        error: (error) => {
          console.error('Error al eliminar el encuestador:', error);
          alert('Error al eliminar el encuestador. Por favor, inténtelo de nuevo más tarde.');
        }
      })
    }
  }

  reset() {
    this.newEncuestador = {
      nombre: '',
      dni: '',
      genero: '',
      ocupacion: '',
      jornadas: [],
    }
    this.selectedJornadaId = null;
  }

  addEncuestador() {
    const headers = this.auth.getHeaderHttp();
    const body = {
      nombre: this.newEncuestador.nombre,
      dni: this.newEncuestador.dni,
      genero: this.newEncuestador.genero,
      ocupacion: this.newEncuestador.ocupacion,
      jornadas: this.newEncuestador.jornadas
    }

    this.http.post<any>(`${environment.apiUrl}/encuestadores/nuevoEncuestador`, body, { headers }).subscribe({
      next: (data) => {
        alert('Encuestador creado correctamente.');
        this.reset();
        const modalElement = document.getElementById('addEncuestadorModal');
        if (modalElement) {
          const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
          if (modal) {
            modal.hide();
          }
        }
        this.getEncuestadores();
      },
      error: (error) => {
        console.error('Error al crear el encuestador:', error);
        alert('Error al crear el encuestador. Por favor, inténtelo de nuevo más tarde.');
      }
    });
  }


}
