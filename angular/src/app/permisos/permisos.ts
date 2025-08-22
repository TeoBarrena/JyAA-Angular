import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PermisosService {
  // PERMISOS SON EN MAYÚSCULAS Y SEPARADOS POR _ // ROLES CAPITALIZED Y SEPARADOS POR ESPACIOS

  private permisos: string[] = [];
  private roles: string[] = [];

  constructor() {
    const permisosStr = localStorage.getItem('permisos');
    const rolesStr = localStorage.getItem('roles');

    this.permisos = permisosStr ? JSON.parse(permisosStr) : [];
    this.roles = rolesStr ? JSON.parse(rolesStr) : [];
  }

  public tienePermiso(permiso: string): boolean {
    if (!this.permisos.length && !this.roles.length) return false;

    if (this.permisos.includes('ADMIN') || this.roles.includes('Admin')) {
      return true;
    }

    return this.permisos.includes(permiso); // deprecatedMapeo ignorado por ahora
  }

  // private deprecatedMapeo(permiso: string): boolean { ... }
}

