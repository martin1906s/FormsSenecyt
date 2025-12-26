import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EstudianteService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/estudiantes'; // Ajusta según tu configuración

  createEstudiante(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, data);
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
}

