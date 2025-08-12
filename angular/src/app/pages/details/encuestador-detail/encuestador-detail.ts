import { Component } from '@angular/core';
import { Navbar } from "../../../layout/navbar/navbar";
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
import { AuthService } from '../../../auth/auth-service/auth-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-encuestador-detail',
  imports: [Navbar, CommonModule, FormsModule, RouterLink],
  templateUrl: './encuestador-detail.html',
  styleUrl: './encuestador-detail.css'
})
export class EncuestadorDetail {

  encuestador: any = {};
  encuestadorId: number | null = null;
  rolUser: string | null = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private route: ActivatedRoute,
  ){}

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

}
