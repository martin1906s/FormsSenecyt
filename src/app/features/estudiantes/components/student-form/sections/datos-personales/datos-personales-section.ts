import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EnumsResponse } from '../../../../../../services/enums.service';

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

  ngOnInit(): void {
    this.setupAutoUppercase();
    this.setupNormalizeNA();
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
}
