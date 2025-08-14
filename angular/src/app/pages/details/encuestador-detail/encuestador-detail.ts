import { Component } from '@angular/core';
import { Navbar } from "../../../layout/navbar/navbar";
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
import { AuthService } from '../../../auth/auth-service/auth-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ToastService } from '../../../layout/notificaciones/toast.service';


@Component({
  selector: 'app-encuestador-detail',
  imports: [Navbar, CommonModule, FormsModule, RouterLink],
  templateUrl: './encuestador-detail.html',
  styleUrl: './encuestador-detail.css'
})
export class EncuestadorDetail {

  encuestador: any = {};
  encuestadorEditado: any = {};

  encuestadorId: number | null = null;
  rolUser: string | null = null;

  jornadas: any[] = [];
  selectedJornadaId: number | null = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private route: ActivatedRoute,
    private toastService: ToastService,
  ) { }

  ngOnInit() {
    this.rolUser = this.authService.getUserRole();
    this.encuestadorId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadEncuestadorDetails();
  }

  loadEncuestadorDetails() {
    this.http.get<any>(`${environment.apiUrl}/encuestadores/${this.encuestadorId}`).subscribe({
      next: (data) => {
        this.encuestador = data;
        console.log('Encuestador obtenida:', this.encuestador);
      },
      error: (error) => {
        alert('Error al obtener los detalles del encuestador con ID: ' + this.encuestadorId);
        console.error('Error al obtener los detalles del encuestador:', error);
      }
    })
  }

  confirmDelete(number: number) {
  }

  editEncuestador() {
    this.encuestadorEditado = {
      id: this.encuestadorId,
      nombre: this.encuestador.nombre,
      dni: this.encuestador.dni,
      nacimiento: this.encuestador.nacimiento,
      genero: this.encuestador.genero,
      ocupacion: this.encuestador.ocupacion,
      jornadas: this.encuestador.jornadas.map((jornada: any) => jornada)
    }
    this.http.get<any>(`${environment.apiUrl}/jornadas/jornadasDTO`).subscribe({
      next: (data) => {
        this.jornadas = data;
        console.log('Jornadas obtenidas:', this.jornadas);
      },
      error: (error) => {
        this.toastService.show('error', 'Error al obtener las jornadas');
      }
    });
    console.log('Encuestador editado:', this.encuestadorEditado);

    const modalElement = document.getElementById('editEncuestadorModal');
    if (modalElement) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  //este es el que hace el http request
  updateEncuestador() {
  const body = {
    nombre: this.encuestadorEditado.nombre,
    dni: this.encuestadorEditado.dni,
    id: this.encuestadorId,
    ocupacion: this.encuestadorEditado.ocupacion,
    genero: this.encuestadorEditado.genero,
    nacimiento: this.encuestadorEditado.nacimiento,
    jornadas: this.encuestadorEditado.jornadas 
  };

  console.log('Enviando al back para actualizar:', body);
  const headers = this.authService.getHeaderHttp();

  this.http.put<any>(`${environment.apiUrl}/encuestadores/editEncuestador/${this.encuestadorId}`, body, { headers }).subscribe({
    next: (data) => {
      this.toastService.show('success', 'Encuestador actualizado correctamente');
      this.loadEncuestadorDetails();
      
      const modal = (window as any).bootstrap.Modal.getInstance(document.getElementById('editEncuestadorModal'));
      if (modal) {
        modal.hide();
      }
    },
    error: (error) => {
      console.error('ERROR al actualizar encuestador:', error);
      this.toastService.show('error', 'Error al actualizar el encuestador: ' + error.message);
    }
  });
}

  cancel() {
    this.encuestadorEditado = {};
    const modalElement = document.getElementById('editEncuestadorModal');
    if (modalElement) {
      const modal = (window as any).bootstrap.Modal.getInstance(document.getElementById('editEncuestadorModal'));
      if (modal) {
        modal.hide();
      }
    }
  }

  addJornadaEdit(id: number | null) {
    this.encuestadorEditado.jornadas.push(this.jornadas.find(jornada => jornada.id === id));
    this.selectedJornadaId = null;
  }

  removeJornadaEdit(id: number | null) {
    this.encuestadorEditado.jornadas = this.encuestadorEditado.jornadas.filter((jornada: any) => jornada.id !== id);
    this.selectedJornadaId = null;
  }

  getAvailableJornadasEdit() {
    return this.jornadas.filter(jornada => !this.encuestadorEditado.jornadas.some((j: any) => j.id === jornada.id));
  }

}
