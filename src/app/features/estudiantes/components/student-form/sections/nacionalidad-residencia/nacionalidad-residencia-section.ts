import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EnumsResponse, CatalogoItem, ProvinciaItem, CantonItem } from '../../../../../../services/enums.service';

@Component({
  selector: 'app-nacionalidad-residencia-section',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './nacionalidad-residencia-section.html',
  styleUrl: './nacionalidad-residencia-section.scss'
})
export class NacionalidadResidenciaSection implements OnInit {
  @Input() formGroup!: FormGroup;
  @Input() enums: EnumsResponse | null = null;
  
  @Output() colegiosCacheCleared = new EventEmitter<void>();
  
  private cdr = inject(ChangeDetectorRef);
  
  // Autocompletado de países
  filteredPaisesNacionalidad: CatalogoItem[] = [];
  filteredPaisesResidencia: CatalogoItem[] = [];
  showPaisesNacionalidad: boolean = false;
  showPaisesResidencia: boolean = false;
  paisNacionalidadSearch: string = '';
  paisResidenciaSearch: string = '';
  
  // Autocompletado de provincias
  filteredProvinciasNacimiento: ProvinciaItem[] = [];
  filteredProvinciasResidencia: ProvinciaItem[] = [];
  showProvinciasNacimiento: boolean = false;
  showProvinciasResidencia: boolean = false;
  provinciaNacimientoSearch: string = '';
  provinciaResidenciaSearch: string = '';
  
  // Autocompletado de cantones
  filteredCantonesNacimiento: CantonItem[] = [];
  filteredCantonesResidencia: CantonItem[] = [];
  showCantonesNacimiento: boolean = false;
  showCantonesResidencia: boolean = false;
  cantonNacimientoSearch: string = '';
  cantonResidenciaSearch: string = '';

  ngOnInit(): void {
    // Inicializar valores de búsqueda si ya hay valores seleccionados
    this.initializeSearchValues();
    // Inicializar cantones filtrados
    this.initializeFilteredCantones();
  }

  private initializeSearchValues(): void {
    if (!this.enums) return;
    
    // Inicializar país nacionalidad
    const paisNacId = this.formGroup.get('paisNacionalidadId')?.value;
    if (paisNacId && this.enums.Pais) {
      const pais = this.enums.Pais.find(p => p.id === paisNacId);
      if (pais) this.paisNacionalidadSearch = pais.nombre;
    }
    
    // Inicializar país residencia
    const paisResId = this.formGroup.get('paisResidenciaId')?.value;
    if (paisResId && this.enums.Pais) {
      const pais = this.enums.Pais.find(p => p.id === paisResId);
      if (pais) this.paisResidenciaSearch = pais.nombre;
    }
    
    // Inicializar provincia nacimiento
    const provNacId = this.formGroup.get('provinciaNacimientoId')?.value;
    if (provNacId && this.enums.Provincia) {
      const prov = this.enums.Provincia.find(p => p.id === provNacId);
      if (prov) this.provinciaNacimientoSearch = prov.nombre;
    }
    
    // Inicializar provincia residencia
    const provResId = this.formGroup.get('provinciaResidenciaId')?.value;
    if (provResId && this.enums.Provincia) {
      const prov = this.enums.Provincia.find(p => p.id === provResId);
      if (prov) this.provinciaResidenciaSearch = prov.nombre;
    }
    
    // Inicializar cantón nacimiento
    const cantNacId = this.formGroup.get('cantonNacimientoId')?.value;
    if (cantNacId && this.enums.Canton) {
      const cant = this.enums.Canton.find(c => c.id === cantNacId);
      if (cant) this.cantonNacimientoSearch = cant.nombre;
    }
    
    // Inicializar cantón residencia
    const cantResId = this.formGroup.get('cantonResidenciaId')?.value;
    if (cantResId && this.enums.Canton) {
      const cant = this.enums.Canton.find(c => c.id === cantResId);
      if (cant) this.cantonResidenciaSearch = cant.nombre;
    }
  }

  private initializeFilteredCantones(): void {
    if (!this.enums?.Canton) return;
    
    // Inicializar cantones de nacimiento basados en la provincia seleccionada
    const provNacId = this.formGroup.get('provinciaNacimientoId')?.value;
    if (provNacId && this.enums.Provincia) {
      const provincia = this.enums.Provincia.find(p => p.id === provNacId);
      if (provincia) {
        this.filteredCantonesNacimiento = this.enums.Canton.filter(canton => 
          this.cantonPerteneceAProvincia(canton.codigo, provincia.codigo)
        );
      }
    }
    
    // Inicializar cantones de residencia basados en la provincia seleccionada
    const provResId = this.formGroup.get('provinciaResidenciaId')?.value;
    if (provResId && this.enums.Provincia) {
      const provincia = this.enums.Provincia.find(p => p.id === provResId);
      if (provincia) {
        this.filteredCantonesResidencia = this.enums.Canton.filter(canton => 
          this.cantonPerteneceAProvincia(canton.codigo, provincia.codigo)
        );
      }
    }
  }

  hasError(fieldName: string): boolean {
    const control = this.formGroup.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getErrorMessage(fieldName: string): string {
    const control = this.formGroup.get(fieldName);
    if (!control || !control.errors) return '';
    
    if (control.errors['required']) return 'Este campo es requerido';
    
    return 'Campo inválido';
  }
  
  // Utilidades
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
  
  private cantonPerteneceAProvincia(codigoCanton: number, codigoProvincia: number): boolean {
    const cantonStr = codigoCanton.toString();
    const provinciaStr = codigoProvincia.toString();
    
    if (cantonStr.length === 4) {
      return cantonStr.substring(0, 2) === provinciaStr;
    }
    
    if (cantonStr.length === 3) {
      return cantonStr.substring(0, 1) === provinciaStr;
    }
    
    return cantonStr.startsWith(provinciaStr);
  }
  
  // Filtrado de países
  filterPaisesNacionalidad(searchTerm: string) {
    if (!this.enums?.Pais) return;
    const term = this.normalizeText(searchTerm).trim();
    if (!term) {
      this.filteredPaisesNacionalidad = [...this.enums.Pais];
    } else {
      this.filteredPaisesNacionalidad = this.enums.Pais.filter(pais => {
        return this.normalizeText(pais.nombre).includes(term) ||
               pais.codigo.toString().includes(term);
      });
    }
    this.showPaisesNacionalidad = term.length > 0;
  }

  filterPaisesResidencia(searchTerm: string) {
    if (!this.enums?.Pais) return;
    const term = this.normalizeText(searchTerm).trim();
    if (!term) {
      this.filteredPaisesResidencia = [...this.enums.Pais];
    } else {
      this.filteredPaisesResidencia = this.enums.Pais.filter(pais => {
        return this.normalizeText(pais.nombre).includes(term) ||
               pais.codigo.toString().includes(term);
      });
    }
    this.showPaisesResidencia = term.length > 0;
  }
  
  // Filtrado de provincias
  filterProvinciasNacimiento(searchTerm: string) {
    if (!this.enums?.Provincia) return;
    const term = this.normalizeText(searchTerm).trim();
    if (!term) {
      this.filteredProvinciasNacimiento = [...this.enums.Provincia];
    } else {
      this.filteredProvinciasNacimiento = this.enums.Provincia.filter(provincia => {
        return this.normalizeText(provincia.nombre).includes(term) ||
               provincia.codigo.toString().includes(term);
      });
    }
    this.showProvinciasNacimiento = term.length > 0;
  }

  filterProvinciasResidencia(searchTerm: string) {
    if (!this.enums?.Provincia) return;
    const term = this.normalizeText(searchTerm).trim();
    if (!term) {
      this.filteredProvinciasResidencia = [...this.enums.Provincia];
    } else {
      this.filteredProvinciasResidencia = this.enums.Provincia.filter(provincia => {
        return this.normalizeText(provincia.nombre).includes(term) ||
               provincia.codigo.toString().includes(term);
      });
    }
    this.showProvinciasResidencia = term.length > 0;
  }
  
  // Filtrado de cantones
  filterCantonesNacimiento(searchTerm: string) {
    if (!this.enums?.Canton) return;
    
    const provinciaId = this.formGroup.get('provinciaNacimientoId')?.value;
    let cantonesDisponibles = [...this.enums.Canton];
    
    if (provinciaId && this.enums?.Provincia) {
      const provincia = this.enums.Provincia.find(p => p.id === provinciaId);
      if (provincia) {
        cantonesDisponibles = this.enums.Canton.filter(canton => 
          this.cantonPerteneceAProvincia(canton.codigo, provincia.codigo)
        );
      }
    }
    
    const term = this.normalizeText(searchTerm).trim();
    if (!term) {
      this.filteredCantonesNacimiento = cantonesDisponibles;
    } else {
      this.filteredCantonesNacimiento = cantonesDisponibles.filter(canton => {
        return this.normalizeText(canton.nombre).includes(term) ||
               canton.codigo.toString().includes(term);
      });
    }
    this.showCantonesNacimiento = term.length > 0;
  }

  filterCantonesResidencia(searchTerm: string) {
    if (!this.enums?.Canton) return;
    
    const provinciaId = this.formGroup.get('provinciaResidenciaId')?.value;
    let cantonesDisponibles = [...this.enums.Canton];
    
    if (provinciaId && this.enums?.Provincia) {
      const provincia = this.enums.Provincia.find(p => p.id === provinciaId);
      if (provincia) {
        cantonesDisponibles = this.enums.Canton.filter(canton => 
          this.cantonPerteneceAProvincia(canton.codigo, provincia.codigo)
        );
      }
    }
    
    const term = this.normalizeText(searchTerm).trim();
    if (!term) {
      this.filteredCantonesResidencia = cantonesDisponibles;
    } else {
      this.filteredCantonesResidencia = cantonesDisponibles.filter(canton => {
        return this.normalizeText(canton.nombre).includes(term) ||
               canton.codigo.toString().includes(term);
      });
    }
    this.showCantonesResidencia = term.length > 0;
  }
  
  // Selección de países
  selectPaisNacionalidad(pais: CatalogoItem) {
    this.formGroup.get('paisNacionalidadId')?.setValue(pais.id);
    this.paisNacionalidadSearch = pais.nombre;
    this.filteredPaisesNacionalidad = [];
    this.showPaisesNacionalidad = false;
    this.cdr.detectChanges();
  }

  selectPaisResidencia(pais: CatalogoItem) {
    this.formGroup.get('paisResidenciaId')?.setValue(pais.id);
    this.paisResidenciaSearch = pais.nombre;
    this.filteredPaisesResidencia = [];
    this.showPaisesResidencia = false;
    this.cdr.detectChanges();
  }
  
  // Selección de provincias
  selectProvinciaNacimiento(provincia: ProvinciaItem) {
    this.formGroup.get('provinciaNacimientoId')?.setValue(provincia.id);
    this.provinciaNacimientoSearch = provincia.nombre;
    this.filteredProvinciasNacimiento = [];
    this.showProvinciasNacimiento = false;
    
    // Limpiar el cantón seleccionado cuando se cambia la provincia
    this.formGroup.get('cantonNacimientoId')?.setValue('');
    this.cantonNacimientoSearch = '';
    
    // Actualizar cantones disponibles para la nueva provincia
    if (this.enums?.Canton) {
      this.filteredCantonesNacimiento = this.enums.Canton.filter(canton => 
        this.cantonPerteneceAProvincia(canton.codigo, provincia.codigo)
      );
    }
    
    this.cdr.detectChanges();
  }

  selectProvinciaResidencia(provincia: ProvinciaItem) {
    this.formGroup.get('provinciaResidenciaId')?.setValue(provincia.id);
    this.provinciaResidenciaSearch = provincia.nombre;
    this.filteredProvinciasResidencia = [];
    this.showProvinciasResidencia = false;
    
    // Limpiar el cantón seleccionado cuando se cambia la provincia
    this.formGroup.get('cantonResidenciaId')?.setValue('');
    this.cantonResidenciaSearch = '';
    
    // Actualizar cantones disponibles para la nueva provincia
    if (this.enums?.Canton) {
      this.filteredCantonesResidencia = this.enums.Canton.filter(canton => 
        this.cantonPerteneceAProvincia(canton.codigo, provincia.codigo)
      );
    }
    
    // Notificar al padre para limpiar cache de colegios
    this.colegiosCacheCleared.emit();
    this.cdr.detectChanges();
  }
  
  // Selección de cantones
  selectCantonNacimiento(canton: CantonItem) {
    this.formGroup.get('cantonNacimientoId')?.setValue(canton.id);
    this.cantonNacimientoSearch = canton.nombre;
    this.filteredCantonesNacimiento = [];
    this.showCantonesNacimiento = false;
    this.cdr.detectChanges();
  }

  selectCantonResidencia(canton: CantonItem) {
    this.formGroup.get('cantonResidenciaId')?.setValue(canton.id);
    this.cantonResidenciaSearch = canton.nombre;
    this.filteredCantonesResidencia = [];
    this.showCantonesResidencia = false;
    
    // Notificar al padre para limpiar cache de colegios
    this.colegiosCacheCleared.emit();
    this.cdr.detectChanges();
  }
  
  // Eventos de input
  onPaisNacionalidadInput(event: any) {
    const value = event.target.value;
    this.paisNacionalidadSearch = value;
    this.filterPaisesNacionalidad(value);
  }

  onPaisNacionalidadFocus() {
    this.filterPaisesNacionalidad(this.paisNacionalidadSearch);
    this.showPaisesNacionalidad = true;
  }

  onPaisNacionalidadBlur() {
    setTimeout(() => {
      this.showPaisesNacionalidad = false;
      const paisId = this.formGroup.get('paisNacionalidadId')?.value;
      if (paisId && this.enums?.Pais) {
        const pais = this.enums.Pais.find(p => p.id === paisId);
        if (pais) this.paisNacionalidadSearch = pais.nombre;
      }
    }, 200);
  }

  onPaisResidenciaInput(event: any) {
    const value = event.target.value;
    this.paisResidenciaSearch = value;
    this.filterPaisesResidencia(value);
  }

  onPaisResidenciaFocus() {
    this.filterPaisesResidencia(this.paisResidenciaSearch);
    this.showPaisesResidencia = true;
  }

  onPaisResidenciaBlur() {
    setTimeout(() => {
      this.showPaisesResidencia = false;
      const paisId = this.formGroup.get('paisResidenciaId')?.value;
      if (paisId && this.enums?.Pais) {
        const pais = this.enums.Pais.find(p => p.id === paisId);
        if (pais) this.paisResidenciaSearch = pais.nombre;
      }
    }, 200);
  }

  onProvinciaNacimientoInput(event: any) {
    const value = event.target.value;
    this.provinciaNacimientoSearch = value;
    this.filterProvinciasNacimiento(value);
  }

  onProvinciaNacimientoFocus() {
    this.filterProvinciasNacimiento(this.provinciaNacimientoSearch);
    this.showProvinciasNacimiento = true;
  }

  onProvinciaNacimientoBlur() {
    setTimeout(() => {
      this.showProvinciasNacimiento = false;
      const provId = this.formGroup.get('provinciaNacimientoId')?.value;
      if (provId && this.enums?.Provincia) {
        const prov = this.enums.Provincia.find(p => p.id === provId);
        if (prov) this.provinciaNacimientoSearch = prov.nombre;
      }
    }, 200);
  }

  onCantonNacimientoInput(event: any) {
    const value = event.target.value;
    this.cantonNacimientoSearch = value;
    this.filterCantonesNacimiento(value);
  }

  onCantonNacimientoFocus() {
    this.filterCantonesNacimiento(this.cantonNacimientoSearch);
    this.showCantonesNacimiento = true;
  }

  onCantonNacimientoBlur() {
    setTimeout(() => {
      this.showCantonesNacimiento = false;
      const cantId = this.formGroup.get('cantonNacimientoId')?.value;
      if (cantId && this.enums?.Canton) {
        const cant = this.enums.Canton.find(c => c.id === cantId);
        if (cant) this.cantonNacimientoSearch = cant.nombre;
      }
    }, 200);
  }

  onProvinciaResidenciaInput(event: any) {
    const value = event.target.value;
    this.provinciaResidenciaSearch = value;
    this.filterProvinciasResidencia(value);
  }

  onProvinciaResidenciaFocus() {
    this.filterProvinciasResidencia(this.provinciaResidenciaSearch);
    this.showProvinciasResidencia = true;
  }

  onProvinciaResidenciaBlur() {
    setTimeout(() => {
      this.showProvinciasResidencia = false;
      const provId = this.formGroup.get('provinciaResidenciaId')?.value;
      if (provId && this.enums?.Provincia) {
        const prov = this.enums.Provincia.find(p => p.id === provId);
        if (prov) this.provinciaResidenciaSearch = prov.nombre;
      }
    }, 200);
  }

  onCantonResidenciaInput(event: any) {
    const value = event.target.value;
    this.cantonResidenciaSearch = value;
    this.filterCantonesResidencia(value);
  }

  onCantonResidenciaFocus() {
    this.filterCantonesResidencia(this.cantonResidenciaSearch);
    this.showCantonesResidencia = true;
  }

  onCantonResidenciaBlur() {
    setTimeout(() => {
      this.showCantonesResidencia = false;
      const cantId = this.formGroup.get('cantonResidenciaId')?.value;
      if (cantId && this.enums?.Canton) {
        const cant = this.enums.Canton.find(c => c.id === cantId);
        if (cant) this.cantonResidenciaSearch = cant.nombre;
      }
    }, 200);
  }
}
