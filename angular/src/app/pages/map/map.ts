import { Component, OnInit } from '@angular/core';
import { Navbar } from "../../layout/navbar/navbar";
import * as L from "leaflet";
import { AuthService } from '../../auth/auth-service/auth-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-map',
  imports: [Navbar, CommonModule],
  templateUrl: './map.html',
  styleUrl: './map.css'
})
export class Map {

  constructor(
    public auth: AuthService,
  ){ }

  ngOnInit() {
    if(this.auth.checkPermiso('VER_MAPAS')){
      const map = L.map('map',{
        attributionControl: false,
        minZoom: 6}).setView([-34.90396573415548, -57.91703767689582], 16); // Coordenadas de La Plata
  
  
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
  
      L.marker([-34.90343611091135, -57.91709850181662]).addTo(map)
          .bindPopup('Centro de Salud Universitario')
          .openPopup();
    }
  }
}