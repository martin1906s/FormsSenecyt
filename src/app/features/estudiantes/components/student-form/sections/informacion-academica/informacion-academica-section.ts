import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { EnumsResponse } from '../../../../../../services/enums.service';
import { EnumsService } from '../../../../../../services/enums.service';
import { EstudianteService } from '../../../../../../services/estudiante.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-informacion-academica-section',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './informacion-academica-section.html',
  styleUrl: './informacion-academica-section.scss'
})
export class InformacionAcademicaSection implements OnInit {
  @Input() formGroup!: FormGroup;
  @Input() enums: EnumsResponse | null = null;
  @Input() carrerasOpciones: string[] = [];
  @Input() provinciaResidenciaId: string = '';
  @Input() cantonResidenciaId: string = '';
  
  private enumsService = inject(EnumsService);
  private estudianteService = inject(EstudianteService);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  
  // Autocompletado de colegios
  colegioSearch: string = '';
  filteredColegios: any[] = [];
  showColegios: boolean = false;
  allColegios: any[] = [];
  isColegioNuevo: boolean = false; // Rastrear si el colegio es nuevo o viene de la BD
  
  // Subida de título de bachiller
  tituloBachillerUploading: boolean = false;
  tituloBachillerError: string = '';

  ngOnInit(): void {
    this.initializeColegioSearch();
  }
  
  private initializeColegioSearch(): void {
    const nombreColegio = this.formGroup.get('nombreColegioProcedencia')?.value;
    if (nombreColegio) {
      this.colegioSearch = nombreColegio;
      // Verificar si el colegio existe en la lista cuando se carga el formulario
      this.checkIfColegioIsNuevo(nombreColegio);
    }
  }
  
  private checkIfColegioIsNuevo(nombreColegio: string): void {
    if (this.allColegios.length === 0) {
      // Si aún no se han cargado los colegios, cargarlos primero
      this.loadColegiosFromAPI();
      // Después de cargar, verificar
      setTimeout(() => {
        this.verifyColegioNuevo(nombreColegio);
      }, 500);
    } else {
      this.verifyColegioNuevo(nombreColegio);
    }
  }
  
  private verifyColegioNuevo(nombreColegio: string): void {
    if (!nombreColegio || nombreColegio.trim().length === 0) {
      this.isColegioNuevo = false;
      this.cdr.detectChanges();
      return;
    }
    
    // Filtrar colegios con el nombre dado usando la misma lógica de búsqueda
    const term = this.normalizeText(nombreColegio).trim();
    const resultados = this.allColegios.filter(colegio => {
      const nombreNormalizado = this.normalizeText(colegio.nombre);
      if (nombreNormalizado.includes(term)) {
        return true;
      }
      const palabras = term.split(/\s+/).filter(p => p.length > 0);
      return palabras.some(palabra => nombreNormalizado.includes(palabra));
    });
    
    // Es nuevo solo si NO hay resultados Y hay suficiente texto (más de 2 caracteres)
    this.isColegioNuevo = resultados.length === 0 && term.length > 2;
    this.cdr.detectChanges();
  }
  
  clearColegiosCache(): void {
    this.allColegios = [];
    this.filteredColegios = [];
    this.colegioSearch = '';
    this.formGroup.get('nombreColegioProcedencia')?.setValue('');
  }

  hasError(fieldName: string): boolean {
    const control = this.formGroup.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getErrorMessage(fieldName: string): string {
    const control = this.formGroup.get(fieldName);
    if (!control || !control.errors) return '';
    
    if (control.errors['required']) return 'Este campo es requerido';
    if (control.errors['min']) return `Valor mínimo: ${control.errors['min'].min}`;
    if (control.errors['max']) return `Valor máximo: ${control.errors['max'].max}`;
    
    return 'Campo inválido';
  }

  getEnumLabel(value: string): string {
    let formatted = value.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
    // Correcciones de ortografía (agregar tildes)
    formatted = formatted.replace(/\bvalidacion\b/gi, 'Validación');
    formatted = formatted.replace(/\blinea\b/gi, 'Línea');
    formatted = formatted.replace(/\bhibrida\b/gi, 'Híbrida');
    return formatted;
  }
  
  getTipoColegioLabel(): string {
    const value = this.formGroup.get('tipoColegioId')?.value;
    if (!value) return '';
    return this.getEnumLabel(value);
  }
  
  // Lógica de autocompletado de colegios
  loadColegiosFromAPI() {
    if (!this.enums) {
      console.warn('Enums no están disponibles aún');
      return;
    }
    
    let provinciaNombre = '';
    let cantonNombre = '';

    if (this.provinciaResidenciaId && this.enums.Provincia) {
      const provincia = this.enums.Provincia.find(p => p.id === this.provinciaResidenciaId);
      if (provincia) {
        provinciaNombre = provincia.nombre;
      }
    }

    if (this.cantonResidenciaId && this.enums.Canton) {
      const canton = this.enums.Canton.find(c => c.id === this.cantonResidenciaId);
      if (canton) {
        cantonNombre = canton.nombre;
      }
    }

    // Si no hay provincia, cargar todos los colegios (o mostrar mensaje)
    console.log('Cargando colegios para:', { provinciaNombre, cantonNombre });

    this.enumsService.getColegios(provinciaNombre || undefined, cantonNombre || undefined).subscribe({
      next: (colegios) => {
        console.log('Colegios cargados:', colegios?.length || 0);
        this.allColegios = colegios || [];
        
        // Si hay texto de búsqueda, filtrar después de cargar
        if (this.colegioSearch) {
          this.filterColegiosLocally(this.colegioSearch);
          this.showColegios = this.colegioSearch.length > 0;
          this.isColegioNuevo = this.filteredColegios.length === 0 && this.colegioSearch.trim().length > 2;
        } else {
          // Si no hay búsqueda, mostrar todos
          this.filteredColegios = this.allColegios;
        }
        
        // Verificar si el colegio actual es nuevo después de cargar la lista
        if (this.colegioSearch) {
          this.verifyColegioNuevo(this.colegioSearch);
        }
        
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar colegios:', err);
        this.allColegios = [];
        this.filteredColegios = [];
        // Mostrar mensaje de error al usuario si es necesario
      }
    });
  }

  filterColegiosLocally(searchTerm: string, showAll: boolean = false) {
    if (!searchTerm || searchTerm.trim().length === 0 || showAll) {
      this.filteredColegios = this.allColegios;
      this.showColegios = showAll || !!(searchTerm && searchTerm.trim().length > 0);
      // Si se muestran todos, no es un colegio nuevo
      if (showAll) {
        this.isColegioNuevo = false;
      }
      return;
    }

    const term = this.normalizeText(searchTerm).trim();
    // Búsqueda más flexible: busca en cualquier parte del nombre y por palabras individuales
    this.filteredColegios = this.allColegios.filter(colegio => {
      const nombreNormalizado = this.normalizeText(colegio.nombre);
      // Buscar el término completo
      if (nombreNormalizado.includes(term)) {
        return true;
      }
      // Buscar palabras individuales
      const palabras = term.split(/\s+/).filter(p => p.length > 0);
      return palabras.some(palabra => nombreNormalizado.includes(palabra));
    });
    this.showColegios = true;
    
    // Actualizar isColegioNuevo basado en si hay resultados
    // Solo es nuevo si NO hay resultados Y hay suficiente texto (más de 2 caracteres)
    this.isColegioNuevo = this.filteredColegios.length === 0 && term.length > 2;
  }

  filterColegios(searchTerm: string, showAll: boolean = false) {
    if (this.allColegios.length === 0) {
      this.loadColegiosFromAPI();
    } else {
      this.filterColegiosLocally(searchTerm, showAll);
    }
  }

  selectColegio(colegio: any) {
    const nombreMayusculas = colegio.nombre.toUpperCase();
    this.formGroup.get('nombreColegioProcedencia')?.setValue(nombreMayusculas);
    this.colegioSearch = nombreMayusculas;
    
    // Marcar que NO es un colegio nuevo (viene de la BD)
    this.isColegioNuevo = false;
    
    // NO autocompletar el tipo de colegio - el estudiante debe seleccionarlo manualmente
    // if (colegio.sostenimiento) {
    //   this.formGroup.get('tipoColegioId')?.setValue(colegio.sostenimiento);
    // }
    
    this.filteredColegios = [];
    this.showColegios = false;
    this.cdr.detectChanges();
  }

  onColegioInput(event: any) {
    const value = event.target.value.toUpperCase();
    this.colegioSearch = value;
    this.formGroup.get('nombreColegioProcedencia')?.setValue(value, { emitEvent: false });
    
    // Si no hay colegios cargados, cargarlos primero
    if (this.allColegios.length === 0) {
      this.loadColegiosFromAPI();
      // No filtrar todavía, esperar a que se carguen (el filtrado se hará en loadColegiosFromAPI)
      this.showColegios = false;
      return;
    }
    
    // Si ya hay colegios cargados, filtrar inmediatamente
    this.filterColegios(value);
    this.showColegios = value.length > 0;
    
    // Actualizar isColegioNuevo basado en resultados filtrados
    this.isColegioNuevo = this.filteredColegios.length === 0 && value.trim().length > 2;
    
    // Ya no limpiar el tipo de colegio - el estudiante debe seleccionarlo manualmente
    // if (this.isColegioNuevo) {
    //   this.formGroup.get('tipoColegioId')?.setValue('');
    // } else if (this.filteredColegios.length > 0) {
    //   this.isColegioNuevo = false;
    // }
    
    this.cdr.detectChanges();
  }

  onColegioFocus() {
    // Cargar colegios si no están cargados
    if (this.allColegios.length === 0) {
      this.loadColegiosFromAPI();
    } else {
      // Si ya están cargados, mostrar todos cuando se hace focus
      this.filterColegios('', true);
    }
  }

  onColegioBlur() {
    setTimeout(() => {
      this.filteredColegios = [];
      this.showColegios = false;
    }, 200);
  }
  
  private normalizeText(text: string): string {
    if (!text) return '';
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
  
  // Lógica de subida de título de bachiller
  onTituloBachillerFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      this.tituloBachillerError = 'Formato no permitido. Use imagen (JPEG, PNG, WebP, GIF) o PDF.';
      this.cdr.markForCheck();
      return;
    }
    
    this.tituloBachillerError = '';
    this.tituloBachillerUploading = true;
    this.cdr.markForCheck();
    
    this.estudianteService.uploadTituloBachiller(file).pipe(
      finalize(() => {
        this.tituloBachillerUploading = false;
        this.cdr.markForCheck();
      }),
    ).subscribe({
      next: (res) => {
        this.formGroup.get('tituloBachiller')?.setValue(res.url, { emitEvent: true });
        input.value = '';
      },
      error: (err) => {
        this.tituloBachillerError = err?.error?.message || err?.message || 'Error al subir el archivo.';
      },
    });
  }

  removeTituloBachiller(fileInput: HTMLInputElement): void {
    const url = this.formGroup.get('tituloBachiller')?.value;
    if (!url) {
      this.formGroup.get('tituloBachiller')?.setValue('');
      if (fileInput) fileInput.value = '';
      this.cdr.markForCheck();
      return;
    }
    
    this.tituloBachillerError = '';
    this.estudianteService.deleteTituloBachiller(url).subscribe({
      next: () => {
        this.formGroup.get('tituloBachiller')?.setValue('');
        if (fileInput) fileInput.value = '';
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.tituloBachillerError = err?.error?.message || err?.message || 'No se pudo eliminar el archivo del servidor.';
        this.cdr.markForCheck();
      },
    });
  }

  agregarColegioNuevo() {
    const nombreMayusculas = this.colegioSearch.toUpperCase().trim();
    if (nombreMayusculas.length > 0) {
      this.formGroup.get('nombreColegioProcedencia')?.setValue(nombreMayusculas);
      // Marcar como colegio nuevo
      this.isColegioNuevo = true;
      // Ya no limpiar el tipo de colegio - el estudiante debe seleccionarlo manualmente
      // this.formGroup.get('tipoColegioId')?.setValue('');
      this.filteredColegios = [];
      this.showColegios = false;
      this.cdr.detectChanges();
    }
  }
}
