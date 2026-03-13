import { Component, Input, Output, EventEmitter, forwardRef, inject, ChangeDetectorRef } from '@angular/core';
import { ControlValueAccessor, FormGroup, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EnumsResponse } from '../../../../../../services/enums.service';
import { EstudianteService } from '../../../../../../services/estudiante.service';

@Component({
  selector: 'app-identificacion-section',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './identificacion-section.html',
  styleUrl: './identificacion-section.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => IdentificacionSection),
      multi: true
    }
  ]
})
export class IdentificacionSection implements ControlValueAccessor {
  @Input() formGroup!: FormGroup;
  @Input() enums: EnumsResponse | null = null;
  
  @Output() estudianteEncontrado = new EventEmitter<any>();
  @Output() estudianteYaRegistrado = new EventEmitter<void>();
  
  private estudianteService = inject(EstudianteService);
  private cdr = inject(ChangeDetectorRef);
  
  isSearchingByCedula = false;
  cedulaSearchMessage = '';

  onChange: any = () => {};
  onTouched: any = () => {};

  writeValue(value: any): void {}
  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }

  hasError(fieldName: string): boolean {
    const control = this.formGroup.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getErrorMessage(fieldName: string): string {
    const control = this.formGroup.get(fieldName);
    if (!control || !control.errors) return '';
    
    if (control.errors['required']) return 'Este campo es requerido';
    if (control.errors['minlength']) return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
    if (control.errors['maxlength']) return `Máximo ${control.errors['maxlength'].requiredLength} caracteres`;
    if (control.errors['pattern']) return 'Formato inválido';
    
    return 'Campo inválido';
  }

  getEnumLabel(value: string): string {
    if (!value) return '';
    let formatted = value
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
    // Correcciones de ortografía (agregar tildes)
    formatted = formatted.replace(/\bvalidacion\b/gi, 'Validación');
    formatted = formatted.replace(/\blinea\b/gi, 'Línea');
    formatted = formatted.replace(/\bhibrida\b/gi, 'Híbrida');
    formatted = formatted.replace(/\bcedula\b/gi, 'Cédula');
    return formatted;
  }

  onCedulaBlur(): void {
    this.onTouched();
    this.buscarPorCedula();
  }
  
  /**
   * Busca un estudiante por su número de identificación
   * Si existe, emite el evento para que el componente padre cargue los datos
   */
  buscarPorCedula(): void {
    const tipo = this.formGroup.get('tipoDocumentoId')?.value;
    const num = this.formGroup.get('numeroIdentificacion')?.value;
    
    if (!tipo || !num || num.length < 5) {
      return;
    }
    
    this.isSearchingByCedula = true;
    this.cedulaSearchMessage = 'Buscando...';
    this.cdr.detectChanges();
    
    this.estudianteService.getEstudianteByCedula(tipo, num).subscribe({
      next: (estudiante: any) => {
        this.isSearchingByCedula = false;
        if (estudiante != null) {
          // Verificar si el estudiante ya está completamente registrado
          // Lista de campos principales que indican registro completo
          const camposRequeridos = [
            'primerApellido', 'primerNombre', 'sexoId', 'fechaNacimiento',
            'nacionalidadId', 'paisNacimientoId', 'provinciaNacimientoId',
            'cantonNacimientoId', 'parroquiaNacimientoId', 'direccionResidencia',
            'telefonoCelular', 'correoElectronico', 'carreraId'
          ];
          
          const estaCompleto = camposRequeridos.every(campo => {
            const valor = estudiante[campo];
            return valor !== null && valor !== undefined && valor !== '';
          });
          
          if (estaCompleto) {
            // Estudiante ya está completamente registrado
            this.estudianteYaRegistrado.emit();
            this.cedulaSearchMessage = '';
          } else {
            // Estudiante existe pero no está completo, cargar datos
            this.estudianteEncontrado.emit(estudiante);
            this.cedulaSearchMessage = 'Datos cargados. Puede editar y guardar.';
          }
        } else {
          this.cedulaSearchMessage = 'No hay registro. Complete todos los campos del formulario.';
        }
        this.cdr.detectChanges();
        setTimeout(() => {
          this.cedulaSearchMessage = '';
          this.cdr.detectChanges();
        }, 4000);
      },
      error: (err: any) => {
        this.isSearchingByCedula = false;
        this.cedulaSearchMessage = err?.error?.message || err?.message || 'Error al buscar.';
        setTimeout(() => {
          this.cedulaSearchMessage = '';
          this.cdr.detectChanges();
        }, 3000);
        this.cdr.detectChanges();
      },
    });
  }
}
