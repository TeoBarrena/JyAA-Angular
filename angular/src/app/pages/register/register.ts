import { Component, Injectable } from '@angular/core';
import { Navbar } from "../../layout/navbar/navbar";
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment.development';

@Component({
  selector: 'app-register',
  imports: [Navbar, FormsModule, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  nombre: string = '';
  apellido: string = '';
  email: string = '';
  password: string = '';
  matricula: number = 0;
  miembroOrg: boolean = false;
  personalSalud: boolean = false;
  organizacionesSociales: any[] = [];
  organizacion: any = null;

  constructor(
    private http: HttpClient,
    private router: Router
  ){}

  ngOnInit() {
    this.getOrganizaciones();
  }

  register(){
    const body =  {
      nombre: this.nombre,
      apellido: this.apellido,
      email: this.email,
      password: this.password,
      ...(this.personalSalud && this.matricula > 0 && { matricula: this.matricula }), //esto 
      ...(this.miembroOrg && this.organizacion && { organizacion: this.organizacion })
    }

    console.log('Datos del nuevo usuario:', body);
    
    this.http.post(`${environment.apiUrl}/usuarios`, body).subscribe({
      next: (response) => {
        alert('Registro exitoso espere que el administrador lo habilite');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        alert('Error al registrar usuario revise los datos ingresados ' + error.message);
      }
    })
  }

  getOrganizaciones() {
  this.http.get<any[]>(`${environment.apiUrl}/organizaciones`).subscribe({
    next: data => {
      this.organizacionesSociales = data;
    },
    error: () => {
      alert('Error al obtener organizaciones');
    }
    });
  }

}
