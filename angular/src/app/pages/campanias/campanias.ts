import { Component } from '@angular/core';
import { Navbar } from "../../layout/navbar/navbar";
import { HttpClient } from '@angular/common/http';
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

  rolUser: string[] = [];

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

   // Filtros
  nombreFilter: string = '';
  barrioFilter: number | null = null;
  fechaDesdeFilter: string = '';
  fechaHastaFilter: string = '';

   // Paginación
  currentPage: number = 1;
  selectedPageSize: number = 5;
  filtered: any[] = [];
  paginatedCampanias: any[] = [];

  constructor(
    private http: HttpClient,
    private auth: AuthService,
  ){}


  ngOnInit(){
    this.getCampanias();
    this.auth.getUserRole().subscribe(roles => {
      this.rolUser = roles;
    });
  }


  getCampanias(){
    this.http.get<any>(`${environment.apiUrl}/campanias`).subscribe({
      next: (data) => {
        //console.log('Campañas recibidas:', data);
        this.campanias = data;
        this.updatePaginatedCampanias();
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

      this.http.post<any>(`${environment.apiUrl}/campanias/nuevaCampania`, body, { withCredentials:true }).subscribe({
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

    this.http.put<any>(`${environment.apiUrl}/campanias/editCampania/${this.campaniaEditada.id}`, body, { withCredentials:true }).subscribe({
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
    console.log('Eliminando campaña con ID:', campaniaId);
    
    this.http.delete(`${environment.apiUrl}/campanias/deleteCampania/${campaniaId}`, { withCredentials:true }).subscribe({
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

  getFilteredCampanias() {
    return this.campanias.filter(campania => {
      const fecha = new Date(campania.inicio);

      // filtro por nombre
      if (this.nombreFilter && !campania.nombre.toLowerCase().includes(this.nombreFilter.toLowerCase())) {
        return false;
      }

      // filtro por barrio
      if (this.barrioFilter && campania.barrio.id !== Number(this.barrioFilter)) {
        return false;
      }

      // rango de fechas (igual que en jornadas.ts)
      if (!this.fechaDesdeFilter && !this.fechaHastaFilter) {
        return true;
      }

      if (this.fechaDesdeFilter && !this.fechaHastaFilter) {
        return fecha >= new Date(this.fechaDesdeFilter);
      }

      if (!this.fechaDesdeFilter && this.fechaHastaFilter) {
        return fecha <= new Date(this.fechaHastaFilter);
      }

      return (
        fecha >= new Date(this.fechaDesdeFilter) &&
        fecha <= new Date(this.fechaHastaFilter)
      );
    });
  }

  updatePaginatedCampanias() {
    this.filtered = this.getFilteredCampanias();
    const start = (this.currentPage - 1) * this.selectedPageSize;
    const end = start + this.selectedPageSize;
    this.paginatedCampanias = this.filtered.slice(start, end);
  }

  onFilterChange() {
    this.currentPage = 1;
    this.updatePaginatedCampanias();
  }

  changePageSize(size: number) {
    this.selectedPageSize = Number(size);
    this.currentPage = 1;
    this.updatePaginatedCampanias();
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedCampanias();
    }
  }

  nextPage() {
    if ((this.currentPage * this.selectedPageSize) < this.filtered.length) {
      this.currentPage++;
      this.updatePaginatedCampanias();
    }
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

  goToPage(page: number) {
    this.currentPage = page;
    this.updatePaginatedCampanias();
  }
  
}
