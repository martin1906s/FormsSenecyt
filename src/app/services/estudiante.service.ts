import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EstudianteService {
  private http = inject(HttpClient);
   private apiUrl = 'https://backendformsenecyt.onrender.com/estudiantes';
  //private apiUrl = 'http://localhost:3000/estudiantes';

  createEstudiante(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, data);
  }

  /** Guarda el paso actual (upsert por tipoDocumento + numeroIdentificacion). */
  guardarPaso(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/guardar-paso`, data);
  }

  getEstudiantes(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }

  getEstudianteByCedula(tipoDocumento: string, numeroIdentificacion: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/buscar`, {
      params: { tipoDocumento, numeroIdentificacion }
    });
  }

  updateEstudiante(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  /** Sube la foto del título de bachiller al bucket "titulo". Devuelve la URL pública. */
  uploadTituloBachiller(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('archivo', file, file.name);
    return this.http.post<{ url: string }>(`${this.apiUrl}/upload-titulo-bachiller`, formData);
  }

  /** Elimina del bucket el archivo del título de bachiller dada su URL. */
  deleteTituloBachiller(url: string): Observable<{ ok: boolean }> {
    return this.http.post<{ ok: boolean }>(`${this.apiUrl}/delete-titulo-bachiller`, { url });
  }

  /** Sube imagen del croquis de vivienda al bucket "maps". */
  uploadCroquisVivienda(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('archivo', file, file.name);
    return this.http.post<{ url: string }>(`${this.apiUrl}/upload-croquis-vivienda`, formData);
  }

  /** Elimina del bucket maps el croquis dada su URL. */
  deleteCroquisVivienda(url: string): Observable<{ ok: boolean }> {
    return this.http.post<{ ok: boolean }>(`${this.apiUrl}/delete-croquis-vivienda`, { url });
  }
}

