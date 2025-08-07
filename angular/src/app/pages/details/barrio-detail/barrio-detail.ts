import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../../environments/environment.development';
import { Navbar } from "../../../layout/navbar/navbar";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-barrio-detail',
  imports: [Navbar, FormsModule, CommonModule],
  templateUrl: './barrio-detail.html',
  styleUrl: './barrio-detail.css'
})
export class BarrioDetail {

  barrioId: number = 0;
  barrio: any = null;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute, //sirve para obtener parámetros de la ruta
  ){}

  ngOnInit(){
    this.barrioId = Number(this.route.snapshot.paramMap.get('id')); //te permite obtener el id de la ruta
    this.loadBarrioDetails();
  }

  loadBarrioDetails() {
    this.http.get<any>(`${environment.apiUrl}/barrios/${this.barrioId}`).subscribe({
      next: (data) => {
        this.barrio = data;
        console.log('Barrio obtenido:', this.barrio);
      },
      error: (error) => {
        alert('Error al obtener los detalles del barrio con ID: ' + this.barrioId);
      }
    })
  }

}
