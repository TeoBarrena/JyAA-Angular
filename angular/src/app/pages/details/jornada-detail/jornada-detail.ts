import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../../environments/environment.development';
import { Navbar } from "../../../layout/navbar/navbar";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-jornada-detail',
  imports: [Navbar, CommonModule],
  templateUrl: './jornada-detail.html',
  styleUrl: './jornada-detail.css'
})
export class JornadaDetail {

  jornadaId: number = 0;
  jornada: any = null;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
  ){}

  ngOnInit() {
    this.jornadaId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadJornadaDetails();
  }

  loadJornadaDetails() {
    this.http.get<any>(`${environment.apiUrl}/jornadas/${this.jornadaId}`).subscribe({
      next: (data) => {
        this.jornada = data;
        console.log('Jornada obtenida:', this.jornada);
      },
      error: (error) => {
        alert('Error al obtener los detalles de la jornada con ID: ' + this.jornadaId);
      }
    })
  }

}
