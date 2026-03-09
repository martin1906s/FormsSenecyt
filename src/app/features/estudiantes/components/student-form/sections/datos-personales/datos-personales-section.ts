import { Component, Input, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EnumsResponse } from '../../../../../../services/enums.service';
import { EstudianteService } from '../../../../../../services/estudiante.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-datos-personales-section',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './datos-personales-section.html',
  styleUrl: './datos-personales-section.scss'
})
export class DatosPersonalesSection implements OnInit {
  @Input() formGroup!: FormGroup;
  @Input() enums: EnumsResponse | null = null;

  private estudianteService = inject(EstudianteService);
  private cdr = inject(ChangeDetectorRef);

  // Subida de archivos
  copiaCedulaUploading: boolean = false;
  copiaCedulaError: string = '';
  copiaPapeletaUploading: boolean = false;
  copiaPapeletaError: string = '';

  ngOnInit(): void {
    this.setupAutoUppercase();
    this.setupNormalizeNA();
    
    // Limpiar errores y validar valores iniciales
    this.copiaCedulaError = '';
    this.copiaPapeletaError = '';
    
    // Si los valores son 'NA' o vacíos, limpiarlos
    const copiaCedulaValue = this.formGroup.get('copiaCedula')?.value;
    if (!copiaCedulaValue || copiaCedulaValue === 'NA' || (typeof copiaCedulaValue === 'string' && copiaCedulaValue.trim() === '')) {
      this.formGroup.get('copiaCedula')?.setValue('', { emitEvent: false });
    }
    
    const copiaPapeletaValue = this.formGroup.get('copiaPapeleta')?.value;
    if (!copiaPapeletaValue || copiaPapeletaValue === 'NA' || (typeof copiaPapeletaValue === 'string' && copiaPapeletaValue.trim() === '')) {
      this.formGroup.get('copiaPapeleta')?.setValue('', { emitEvent: false });
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
    if (control.errors['minlength']) return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
    if (control.errors['maxlength']) return `Máximo ${control.errors['maxlength'].requiredLength} caracteres`;
    
    return 'Campo inválido';
  }

  getEnumLabel(value: string): string {
    if (!value) return '';
    return value
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  }

  isEtniaIndigena(): boolean {
    return this.formGroup.get('etniaId')?.value === 'INDIGENA';
  }
  
  /**
   * Configura conversión automática a mayúsculas en campos de texto
   */
  private setupAutoUppercase(): void {
    const uppercaseFields = ['primerApellido', 'segundoApellido', 'primerNombre', 'segundoNombre'];
    
    uppercaseFields.forEach(fieldName => {
      const control = this.formGroup.get(fieldName);
      control?.valueChanges.subscribe((value: string) => {
        if (value && value !== 'NA') {
          const upperValue = value.toUpperCase();
          if (value !== upperValue) {
            control!.setValue(upperValue, { emitEvent: false });
          }
        }
      });
    });
  }
  
  /**
   * Configura normalización de campos que aceptan "N/A"
   * Convierte variaciones como "n/a", "N/a", "na", "NA" a "N/A"
   */
  private setupNormalizeNA(): void {
    const naFields = [
      'primerApellido',
      'segundoApellido',
      'primerNombre',
      'segundoNombre',
      'alergias',
      'medicamentos',
      'referenciaPersonalNombre',
      'referenciaPersonalParentesco',
      'referenciaPersonalTelefono'
    ];
    
    naFields.forEach(fieldName => {
      const control = this.formGroup.get(fieldName);
      control?.valueChanges.subscribe((value: string) => {
        if (value) {
          const trimmed = value.trim().toUpperCase();
          if (trimmed === 'NA' || trimmed === 'N/A') {
            if (value !== 'N/A') {
              control!.setValue('N/A', { emitEvent: false });
            }
          }
        }
      });
    });
  }

  // Métodos para subida de copia de cédula
  onCopiaCedulaFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    
    // Solo permitir PDF
    if (file.type !== 'application/pdf') {
      this.copiaCedulaError = 'Solo se permiten archivos PDF.';
      this.cdr.detectChanges();
      return;
    }
    
    this.copiaCedulaError = '';
    this.copiaCedulaUploading = true;
    this.cdr.detectChanges();
    
    this.estudianteService.uploadCopiaCedula(file).pipe(
      finalize(() => {
        this.copiaCedulaUploading = false;
        this.cdr.detectChanges();
      }),
    ).subscribe({
      next: (res) => {
        this.formGroup.get('copiaCedula')?.setValue(res.url, { emitEvent: true });
        input.value = '';
      },
      error: (err) => {
        this.copiaCedulaError = err?.error?.message || err?.message || 'Error al subir el archivo.';
      },
    });
  }

  removeCopiaCedula(fileInput: HTMLInputElement): void {
    const url = this.formGroup.get('copiaCedula')?.value;
    
    // Validar que hay una URL válida antes de intentar eliminar
    if (!url || url === '' || url === 'NA' || !url.startsWith('http')) {
      this.formGroup.get('copiaCedula')?.setValue('');
      if (fileInput) fileInput.value = '';
      this.copiaCedulaError = ''; // Limpiar cualquier error previo
      this.cdr.detectChanges();
      return;
    }
    
    this.copiaCedulaError = '';
    this.estudianteService.deleteCopiaCedula(url).subscribe({
      next: () => {
        this.formGroup.get('copiaCedula')?.setValue('');
        if (fileInput) fileInput.value = '';
        this.copiaCedulaError = ''; // Asegurar que no quede error
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.copiaCedulaError = err?.error?.message || err?.message || 'No se pudo eliminar el archivo.';
        this.cdr.detectChanges();
      },
    });
  }

  // Métodos para subida de copia de papeleta
  onCopiaPapeletaFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    
    // Solo permitir PDF
    if (file.type !== 'application/pdf') {
      this.copiaPapeletaError = 'Solo se permiten archivos PDF.';
      this.cdr.detectChanges();
      return;
    }
    
    this.copiaPapeletaError = '';
    this.copiaPapeletaUploading = true;
    this.cdr.detectChanges();
    
    this.estudianteService.uploadCopiaPapeleta(file).pipe(
      finalize(() => {
        this.copiaPapeletaUploading = false;
        this.cdr.detectChanges();
      }),
    ).subscribe({
      next: (res) => {
        this.formGroup.get('copiaPapeleta')?.setValue(res.url, { emitEvent: true });
        input.value = '';
      },
      error: (err) => {
        this.copiaPapeletaError = err?.error?.message || err?.message || 'Error al subir el archivo.';
      },
    });
  }

  removeCopiaPapeleta(fileInput: HTMLInputElement): void {
    const url = this.formGroup.get('copiaPapeleta')?.value;
    
    // Validar que hay una URL válida antes de intentar eliminar
    if (!url || url === '' || url === 'NA' || !url.startsWith('http')) {
      this.formGroup.get('copiaPapeleta')?.setValue('');
      if (fileInput) fileInput.value = '';
      this.copiaPapeletaError = ''; // Limpiar cualquier error previo
      this.cdr.detectChanges();
      return;
    }
    
    this.copiaPapeletaError = '';
    this.estudianteService.deleteCopiaPapeleta(url).subscribe({
      next: () => {
        this.formGroup.get('copiaPapeleta')?.setValue('');
        if (fileInput) fileInput.value = '';
        this.copiaPapeletaError = ''; // Asegurar que no quede error
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.copiaPapeletaError = err?.error?.message || err?.message || 'No se pudo eliminar el archivo.';
        this.cdr.detectChanges();
      },
    });
  }
}
