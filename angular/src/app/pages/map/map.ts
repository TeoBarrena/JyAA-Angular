import { Component, OnInit } from '@angular/core';
import { Navbar } from "../../layout/navbar/navbar";
import * as L from "leaflet";

@Component({
  selector: 'app-map',
  imports: [Navbar],
  templateUrl: './map.html',
  styleUrl: './map.css'
})
export class Map {

  ngOnInit() {
    const map = L.map('map').setView([-34.905, -57.9239], 16); // Coordenadas de La Plata


    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    L.marker([-34.905, -57.9239]).addTo(map)
        .bindPopup('Asi podemos agregar puntos personalizables.')
        .openPopup();
  }
}