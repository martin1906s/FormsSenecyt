import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// interfaces omitted for brevity - same as before
export interface CatalogoItem { id: string; codigo: number; nombre: string; }
export interface ProvinciaItem extends CatalogoItem { paisId: string; }
export interface CantonItem extends CatalogoItem { provinciaId: string; }
export interface EnumsResponse {
  TipoDocumento: string[]; Sexo: string[]; Genero: string[]; EstadoCivil: string[];
  Etnia: string[]; TipoSangre: string[]; Discapacidad: string[]; TipoDiscapacidad: string[];
  TipoColegio: string[]; Pais: CatalogoItem[]; Provincia: ProvinciaItem[]; Canton: CantonItem[];
  PuebloNacionalidad: CatalogoItem[]; ModalidadCarrera: string[]; JornadaCarrera: string[];
  TipoMatricula: string[]; NivelAcademico: string[]; HaRepetidoAlMenosUnaMateria: string[];
  HaPerdidoLaGratuidad: string[]; Paralelo: string[]; RecibePensionDiferenciada: string[];
  EstudianteOcupacion: string[]; IngresosEstudiante: string[]; BonoDesarrollo: string[];
  HaRealizadoPracticasPreprofesionales: string[]; EntornoInstitucionalPracticasProfesionales: string[];
  SectorEconomicoPracticaProfesional: string[]; TipoBeca: string[]; PrimeraRazonBeca: string[];
  SegundaRazonBeca: string[]; TerceraRazonBeca: string[]; CuartaRazonBeca: string[];
  QuintaRazonBeca: string[]; SextaRazonBeca: string[]; FinanciamientoBeca: string[];
  ParticipaEnProyectoVinculacionSociedad: string[]; TipoAlcanceProyectoVinculacion: string[];
  NivelFormacionPadre: string[]; NivelFormacionMadre: string[]; DisenoCurricular: string[];
}

@Injectable({
  providedIn: 'root'
})
export class EnumsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/estudiantes`;
  private catalogosUrl = environment.apiUrl;

  getEnums(): Observable<EnumsResponse> {
    return this.http.get<EnumsResponse>(`${this.apiUrl}/enums`);
  }

  getColegios(provincia?: string, canton?: string): Observable<any[]> {
    let params: any = {};
    if (provincia) params.provincia = provincia;
    if (canton) params.canton = canton;
    
    return this.http.get<any[]>(`${this.catalogosUrl}/colegios`, { params });
  }
}
