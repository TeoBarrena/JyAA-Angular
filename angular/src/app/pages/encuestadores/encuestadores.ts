import { Component } from '@angular/core';
import { Navbar } from "../../layout/navbar/navbar";
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { AuthService } from '../../auth/auth-service/auth-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { ToastService } from '../../layout/notificaciones/toast.service';


@Component({
  selector: 'app-encuestadores',
  imports: [Navbar, CommonModule, FormsModule, RouterLink],
  templateUrl: './encuestadores.html',
  styleUrl: './encuestadores.css'
})
export class Encuestadores {

  //almacenar encuestadores/jornadas
  encuestadores: any[] = [];
  jornadas: any[] = [];
  paginatedEncuestadores: any[] = [];

  //rol del usuario para mostrar u ocultar botones
  rolUser: string[] = [];

  selectedJornadaId: number | null = null; //esto para el select de jornadas, y no ingresar repetidas

  //Paginación
  currentPage: number = 1;
  selectedPageSize: number = parseInt(localStorage.getItem('pageSize') || '5', 10);
  
  filtered: any[] = [];

  //filtrado
  dniFilter: string = '';

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
    private toastService: ToastService,
  ){}

  ngOnInit() {
    this.auth.getUserRole().subscribe(roles => {
      this.rolUser = roles;
    });
    this.getEncuestadores();
  }

  getEncuestadores() {
    this.http.get<any>(`${environment.apiUrl}/encuestadores`).subscribe({
      next: (data) => {
        this.encuestadores = data;
        //console.log('Encuestadores: ', data);
        this.getJornadas();
        this.updatePaginatedEncuestadores();
      },
      error: (error) => {
        console.error('Error fetching encuestadores:', error);
        this.toastService.show('error', 'Error al obtener los encuestadores. Por favor, inténtelo de nuevo más tarde.');
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
        this.toastService.show('error', 'Error al obtener las jornadas. Por favor, inténtelo de nuevo más tarde.');
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
      console.log('ID: ', id);
      this.http.delete(`${environment.apiUrl}/encuestadores/deleteEncuestador/${id}`, { withCredentials: true }).subscribe({
        next: () => {
          this.toastService.show('success', 'Encuestador eliminado correctamente.');
          this.getEncuestadores();
        },
        error: (error) => {
          console.error('Error al eliminar el encuestador:', error);
          this.toastService.show('error', 'Error al eliminar el encuestador ' + error);
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
    const body = {
      nombre: this.newEncuestador.nombre,
      dni: this.newEncuestador.dni,
      genero: this.newEncuestador.genero,
      ocupacion: this.newEncuestador.ocupacion,
      jornadas: this.newEncuestador.jornadas
    }

    this.http.post<any>(`${environment.apiUrl}/encuestadores/nuevoEncuestador`, body, { withCredentials: true }).subscribe({
      next: (data) => {
        this.toastService.show('success', 'Encuestador añadido correctamente.');
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
        this.toastService.show('error', 'Error al añadir el encuestador ' + error);
      }
    });
  }

  getFilteredEncuestadores() {
    const filtered = this.encuestadores.filter(encuestador => 
    (
      !this.dniFilter || encuestador.dni.toString().includes(this.dniFilter)
    )
    );
    return filtered;
  }

  updatePaginatedEncuestadores() {
    this.filtered = this.getFilteredEncuestadores();
    const start = (this.currentPage - 1) * this.selectedPageSize;
    const end = start + this.selectedPageSize;
    this.paginatedEncuestadores = this.filtered.slice(start, end);
  }

  onFilterChange() {
    this.currentPage = 1;
    this.updatePaginatedEncuestadores();
  }

  changePageSize(size: number) {
    this.selectedPageSize = Number(size);
    localStorage.setItem('pageSize', size.toString());
    this.currentPage = 1;
    this.updatePaginatedEncuestadores();
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedEncuestadores();
    }
  }

  nextPage() {
    if ((this.currentPage * this.selectedPageSize) < this.filtered.length){
      this.currentPage++;
      this.updatePaginatedEncuestadores();
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.updatePaginatedEncuestadores();
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


}
