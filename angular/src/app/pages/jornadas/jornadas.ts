import { Component } from '@angular/core';
import { Navbar } from "../../layout/navbar/navbar";
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../auth/auth-service/auth-service';
import { environment } from '../../../environments/environment.development';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

//lógica de encuestadores seleccionados
interface Encuestador{
  id: number;
  nombre: string;
}

//lógica de zonas seleccionadas para el barrio que se elige
interface Zona{
  id: number;
  nombre: string;
}

interface JornadaEditada {
  id: number | null;
  fecha: string;
  zonas: Zona[];
  encuestadores: Encuestador[];
}

@Component({
  selector: 'app-jornadas',
  imports: [Navbar, CommonModule, FormsModule, RouterLink],
  templateUrl: './jornadas.html',
  styleUrl: './jornadas.css'
})
export class Jornadas {

  jornadas: any[] = [];
  rolUser: string | null = null;
  campanias: any[] = [];
  zonas: any[] = [];
  barrios: any[] = [];
  encuestadores: Encuestador[] = [];

  //filtrado
  fechaDesdeFilter = '';
  fechaHastaFilter = '';

  //Paginación
  currentPage: number = 1;
  selectedPageSize: number = parseInt(localStorage.getItem('pageSize') || '5', 10);

  filtered: any[] = [];
  paginatedJornadas: any[] = [];

  zonasBarrio: Zona[] = [];

  selectedEncuestadorId: number | null = null; // Para el select
  selectedZonaId: number | null = null; // Para el select de zonas

  selectedZonaIdEdit: number | null = null; // Para el select de zonas en edición


  nuevaJornada = {
    fecha: '',
    campania: null as any | null,
    zonas: [] as any[],
    encuestadores: [] as Encuestador[],
    barrioId: null as number | null, //este sirve para obtener las zonas asociadas al barrio elegido, al back no se manda este campo
  }

  jornadaEditada: JornadaEditada = {
  id: null,
  fecha: '',
  zonas: [],
  encuestadores: [],
  };

  constructor(
    private http: HttpClient,
    private auth: AuthService,
  ){}

  ngOnInit() {
    this.rolUser = this.auth.getUserRole();
    this.getJornadas();
    this.getCampanias();
    this.getBarrios();
    this.getEncuestadores();
  }

  getJornadas() {
    this.http.get<any>(`${environment.apiUrl}/jornadas`).subscribe({
      next: (data) => {
        console.log('Jornadas recibidas:', data);
        this.jornadas = data;
        this.updatePaginatedJornadas();  
      },
      error: (error) => {
        console.error('Error al obtener las jornadas:', error);
        alert('Error al obtener las jornadas');
      }
   })
 }

 getCampanias() {
    this.http.get<any>(`${environment.apiUrl}/campanias`).subscribe({
      next: (data) => {
        console.log('Campañas recibidas:', data);
        this.campanias = data;
      },
      error: (error) => {
        console.error('Error al obtener las campañas:', error);
        alert('Error al obtener las campañas');
      }
    })
 }

 getEncuestadores() {
    this.http.get<any>(`${environment.apiUrl}/encuestadores`).subscribe({
      next: (data) => {
        console.log('Encuestadores recibidos:', data);
        this.encuestadores = data;
      },
      error: (error) => {
        console.error('Error al obtener los encuestadores:', error);
        alert('Error al obtener los encuestadores');
      }
    })
 }

  getAvailableEncuestadores() {
    // Devuelve solo encuestadores que no estén ya en nuevaJornada.encuestadores
    return this.encuestadores.filter(e =>
      !this.nuevaJornada.encuestadores.some(sel => sel.id === e.id)
    );
  }

  addEncuestador() {
    if (this.selectedEncuestadorId) {
      const enc = this.encuestadores.find(e => e.id === this.selectedEncuestadorId);
      if (enc) {
        this.nuevaJornada.encuestadores.push(enc);
      }
      this.selectedEncuestadorId = null; // Resetear select
    }
  }

  removeEncuestador(encuestadorId: number) {
    this.nuevaJornada.encuestadores = this.nuevaJornada.encuestadores.filter(e => e.id !== encuestadorId);
  }

 getBarrios() {
    this.http.get<any>(`${environment.apiUrl}/barrios`).subscribe({
      next: (data) => {
        console.log('Barrios recibidos:', data);
        this.barrios = data;
      },
      error: (error) => {
        console.error('Error al obtener los barrios:', error);
        alert('Error al obtener los barrios');
      } 
    })
 }

 onCampaniaChange() {
  if (this.nuevaJornada.campania?.barrio) {
    // Guardamos el ID del barrio (opcional si querés mantenerlo)
    this.nuevaJornada.barrioId = this.nuevaJornada.campania.barrio.id;

    // Buscar las zonas del barrio seleccionado
    this.zonasBarrio = this.barrios.find(
      b => b.id === this.nuevaJornada.barrioId
    )?.zonas || [];

    // Filtrar zonas seleccionadas que ya no estén disponibles
    this.nuevaJornada.zonas = this.nuevaJornada.zonas.filter(
      z => this.zonasBarrio.some(zb => zb.id === z.id)
    );
  } else {
    // Si no hay campaña seleccionada, limpiar todo
    this.nuevaJornada.barrioId = null;
    this.zonasBarrio = [];
    this.nuevaJornada.zonas = [];
  }
}

 onBarrioChange() {
  if (this.nuevaJornada.barrioId) {
    this.zonasBarrio = this.barrios.find(b => b.id === this.nuevaJornada.barrioId)?.zonas || [];

    this.nuevaJornada.zonas = this.nuevaJornada.zonas.filter(z =>this.zonasBarrio.some(zb => zb.id === z.id));
  }
  else {
    this.zonasBarrio = [];
    this.nuevaJornada.zonas = [];
  }
 }

 getAvailableZonas() {
  return this.zonasBarrio.filter(z =>
    !this.nuevaJornada.zonas.some(sel => sel.id === z.id)
  );
}

 addZona() {
  if (this.selectedZonaId) {
    const zona = this.zonasBarrio.find(z => z.id === this.selectedZonaId);
    if (zona && !this.nuevaJornada.zonas.some(z => z.id === zona.id)) {
      this.nuevaJornada.zonas.push(zona);
    }
    this.selectedZonaId = null; // Resetear select
  }
}
 removeZona(zonaId: number){
  this.nuevaJornada.zonas = this.nuevaJornada.zonas.filter(z => z.id !== zonaId);
 }

 crearJornada() {
  const headers = this.auth.getHeaderHttp();
  const body = {
    fecha: this.nuevaJornada.fecha,
    campaña: this.nuevaJornada.campania,
    zonas: this.nuevaJornada.zonas,
    encuestadores: this.nuevaJornada.encuestadores,
  }
  console.log('Cuerpo de la solicitud:', body);
  this.http.post(`${environment.apiUrl}/jornadas/nuevaJornada`, body, { headers }).subscribe({
    next: (data) => {
      alert('Jornada creada correctamente');
      this.getJornadas();
      this.reset();
      const modalElement = document.getElementById('addJornadaModal');
      if (modalElement) {
        const modal = (window as any).bootstrap.Modal.getInstance(modalElement)
                  || new (window as any).bootstrap.Modal(modalElement);
        modal.hide();
      }
    },
    error: (error) => {
      console.error('Error al crear la jornada:', error);
      alert('Error al crear la jornada');
    }
  })
 }

 //se encarga de hacer una copia y abrir el modal
  editJornada(jornada: any) {
    this.jornadaEditada = {
      id: jornada.id,
      fecha: jornada.fecha,
      zonas: [...(jornada.zonas || [])],             // copia nueva del array
      encuestadores: [...(jornada.encuestadores || [])], 
    }
    console.log('Jornada original:', jornada);
    console.log('Jornada a editar:', this.jornadaEditada);
    
    const modalElement = document.getElementById('editJornadaModal');
    if (modalElement) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  actualizarJornada() {
    const body = {
      fecha: this.jornadaEditada.fecha,
      zonas: this.jornadaEditada.zonas,
      encuestadores: this.jornadaEditada.encuestadores,
    }
    const headers = this.auth.getHeaderHttp();
    this.http.put(`${environment.apiUrl}/jornadas/editJornada/${this.jornadaEditada.id}`, body, { headers }).subscribe({
      next: () => {
        alert('Jornada actualizada correctamente');
        this.getJornadas();
        const modal = (window as any).bootstrap.Modal.getInstance(document.getElementById('editJornadaModal'));
        modal.hide();
      },
      error: (error) => {
        console.error('Error al actualizar la jornada:', error);
        alert('Error al actualizar la jornada');
      }
    });
  }

  confirmDelete(jornadaId: number) {
    if (confirm('¿Estás seguro de que deseas eliminar esta jornada?')) {
      this.deleteJornada(jornadaId);
    }
  }

  deleteJornada(jornadaId: number) {
    const headers = this.auth.getHeaderHttp();
    this.http.delete(`${environment.apiUrl}/jornadas/deleteJornada/${jornadaId}`, { headers }).subscribe({
      next: () => {
        alert('Jornada eliminada correctamente');
        this.getJornadas();
      },
      error: (error) => {
        alert('Error al eliminar la jornada con ID: ' + jornadaId);
      }
    })
  }

  reset() {
    this.nuevaJornada = {
      fecha: '',
      campania: null,
      zonas: [],
      encuestadores: [],
      barrioId: null, 
    }
    this.selectedEncuestadorId = null;
    this.selectedZonaId = null;
  }

getAvailableZonasEdit() {
  const barrio = this.getBarrioDeZonasEdit();
  if (!barrio) {
    return [];
  }
  return barrio.zonas.filter((z: Zona) =>
    !this.jornadaEditada.zonas.some(sel => sel.id === z.id)
  );
}

addZonaEdit(zonaId: number | null) {
  if (zonaId) {
    const barrio = this.getBarrioDeZonasEdit();
    if (!barrio) {
      console.error('No se encontró barrio para la jornadaEditada');
      return;
    }
    const zona = barrio.zonas.find((z: Zona) => z.id === zonaId);
    if (zona && !this.jornadaEditada.zonas.some(z => z.id === zona.id)) {
      this.jornadaEditada.zonas.push(zona);
      console.log('Zona agregada:', zona);
    }
    this.selectedZonaIdEdit = null;
  }
}

removeZonaEdit(zonaId: number) {
  this.jornadaEditada.zonas = this.jornadaEditada.zonas.filter(z => z.id !== zonaId);
}

getAvailableEncuestadoresEdit() {
  return this.encuestadores.filter(e => !this.jornadaEditada.encuestadores.some(sel => sel.id === e.id));
}

addEncuestadorEdit() {
  if (this.selectedEncuestadorId) {
    const enc = this.encuestadores.find(e => e.id === this.selectedEncuestadorId);
    if (enc && !this.jornadaEditada.encuestadores.some(e => e.id === enc.id)) {
      this.jornadaEditada.encuestadores.push(enc);
    }
    this.selectedEncuestadorId = null;
  }
}

removeEncuestadorEdit(encuestadorId: number) {
  this.jornadaEditada.encuestadores = this.jornadaEditada.encuestadores.filter(e => e.id !== encuestadorId);
}

getBarrioDeZonasEdit(): any | null {
  if (!this.jornadaEditada.zonas || this.jornadaEditada.zonas.length === 0) {
    return null; // No hay zonas, no hay barrio asociado
  }

  // Ids de las zonas que tiene la jornada editada
  const zonaIds = this.jornadaEditada.zonas.map(z => z.id);

  // Buscar barrio que tenga alguna zona cuyo id esté en zonaIds
  for (const barrio of this.barrios) {
    if (barrio.zonas && barrio.zonas.some((z: any) => zonaIds.includes(z.id))) {
      return barrio;
    }
  }

  return null; // Si no encuentra ningún barrio con esas zonas
}

  updatePaginatedJornadas() {
    this.filtered = this.getFilteredJornadas();
    const start = (this.currentPage - 1) * this.selectedPageSize;
    const end = start + this.selectedPageSize;
    this.paginatedJornadas = this.filtered.slice(start, end);
  }

  getFilteredJornadas() {
    return this.jornadas.filter(jornada =>{
      const fecha = new Date(jornada.fecha);

      if (!this.fechaDesdeFilter && !this.fechaHastaFilter){
        return true;
      }

      if (this.fechaDesdeFilter && !this.fechaHastaFilter){
        return fecha >= new Date(this.fechaDesdeFilter);
      }

      if (!this.fechaDesdeFilter && this.fechaHastaFilter){
        return fecha <= new Date(this.fechaHastaFilter);
      }

      return (
        fecha >= new Date(this.fechaDesdeFilter) &&
        fecha <= new Date(this.fechaHastaFilter)
      );

    });
  }

  onFilterChange() {
    this.currentPage = 1;
    this.updatePaginatedJornadas();
  }

  changePageSize(size: number) {
    this.selectedPageSize = Number(size);
    localStorage.setItem('pageSize', size.toString());
    this.currentPage = 1;
    this.updatePaginatedJornadas();
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedJornadas();
    }
  }

  nextPage() {
    if ((this.currentPage * this.selectedPageSize) < this.filtered.length){
      this.currentPage++;
      this.updatePaginatedJornadas();
    }
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

  getTotalPages(): number {
    return Math.ceil(this.filtered.length / this.selectedPageSize);
  }  

  goToPage(page: number): void {
    this.currentPage = page;
    this.updatePaginatedJornadas();
  }
  
}
