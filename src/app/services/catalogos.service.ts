import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CatalogoItem {
  id: string;
  codigo: number;
  nombre: string;
}

export interface PaisItem extends CatalogoItem {
  // Pais no tiene campos adicionales
}

export interface ProvinciaItem extends CatalogoItem {
  paisId: string;
}

export interface CantonItem extends CatalogoItem {
  provinciaId: string;
}

export interface PuebloNacionalidadItem extends CatalogoItem {
  // PuebloYNacionalidad no tiene campos adicionales
}

export interface SectorEconomicoItem extends CatalogoItem {
  // SectorEconomico no tiene campos adicionales
}

@Injectable({
  providedIn: 'root'
})
export class CatalogosService {
  private http = inject(HttpClient);
  private apiUrl = 'https://backendformsenecyt.onrender.com';
  //private apiUrl = 'http://localhost:3008';

  getPaises(): Observable<PaisItem[]> {
    return this.http.get<PaisItem[]>(`${this.apiUrl}/paises`);
  }

  getProvincias(paisId?: string): Observable<ProvinciaItem[]> {
    const url = paisId 
      ? `${this.apiUrl}/provincias?paisId=${paisId}` 
      : `${this.apiUrl}/provincias`;
    return this.http.get<ProvinciaItem[]>(url);
  }

  getCantones(provinciaId?: string): Observable<CantonItem[]> {
    const url = provinciaId 
      ? `${this.apiUrl}/cantones?provinciaId=${provinciaId}` 
      : `${this.apiUrl}/cantones`;
    return this.http.get<CantonItem[]>(url);
  }

  getPueblosYNacionalidades(tipo?: 'nacionalidad' | 'pueblo'): Observable<PuebloNacionalidadItem[]> {
    const url = tipo 
      ? `${this.apiUrl}/pueblos-nacionalidades?tipo=${tipo}` 
      : `${this.apiUrl}/pueblos-nacionalidades`;
    return this.http.get<PuebloNacionalidadItem[]>(url);
  }

  getSectoresEconomicos(): Observable<SectorEconomicoItem[]> {
    return this.http.get<SectorEconomicoItem[]>(`${this.apiUrl}/sectores-economicos`);
  }
}
