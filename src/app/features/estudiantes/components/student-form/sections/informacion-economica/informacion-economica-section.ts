import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EnumsResponse } from '../../../../../../services/enums.service';

@Component({
  selector: 'app-informacion-economica-section',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './informacion-economica-section.html',
  styleUrl: './informacion-economica-section.scss'
})
export class InformacionEconomicaSection {
  @Input() formGroup!: FormGroup;
  @Input() enums: EnumsResponse | null = null;

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

  getEnumLabel(value: string): string {
    let formatted = value.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
    // Correcciones de ortografía (agregar tildes)
    formatted = formatted.replace(/\bvalidacion\b/gi, 'Validación');
    formatted = formatted.replace(/\blinea\b/gi, 'Línea');
    formatted = formatted.replace(/\bhibrida\b/gi, 'Híbrida');
    formatted = formatted.replace(/Trabaja Y Estudia/g, 'Trabaja, Estudia');
    return formatted;
  }
}
