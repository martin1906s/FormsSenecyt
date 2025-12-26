import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EnumsResponse {
  TipoDocumento: string[];
  Sexo: string[];
  Genero: string[];
  EstadoCivil: string[];
  Etnia: string[];
  TipoSangre: string[];
  Discapacidad: string[];
  TipoDiscapacidad: string[];
  TipoColegio: string[];
  Pais: string[];
  Provincia: string[];
  Canton: string[];
  PuebloNacionalidad: string[];
  ModalidadCarrera: string[];
  JornadaCarrera: string[];
  TipoMatricula: string[];
  NivelAcademico: string[];
  HaRepetidoAlMenosUnaMateria: string[];
  HaPerdidoLaGratuidad: string[];
  Paralelo: string[];
  RecibePensionDiferenciada: string[];
  EstudianteOcupacion: string[];
  IngresosEstudiante: string[];
  BonoDesarrollo: string[];
  HaRealizadoPracticasPreprofesionales: string[];
  EntornoInstitucionalPracticasProfesionales: string[];
  SectorEconomicoPracticaProfesional: string[];
  TipoBeca: string[];
  PrimeraRazonBeca: string[];
  SegundaRazonBeca: string[];
  TerceraRazonBeca: string[];
  CuartaRazonBeca: string[];
  QuintaRazonBeca: string[];
  SextaRazonBeca: string[];
  FinanciamientoBeca: string[];
  ParticipaEnProyectoVinculacionSociedad: string[];
  TipoAlcanceProyectoVinculacion: string[];
  NivelFormacionPadre: string[];
  NivelFormacionMadre: string[];
}

@Injectable({
  providedIn: 'root'
})
export class EnumsService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/estudiantes'; // Ajusta según tu configuración

  getEnums(): Observable<EnumsResponse> {
    return this.http.get<EnumsResponse>(`${this.apiUrl}/enums`);
  }
}
