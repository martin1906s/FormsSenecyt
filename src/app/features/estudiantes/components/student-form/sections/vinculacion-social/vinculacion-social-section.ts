import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EnumsResponse } from '../../../../../../services/enums.service';

@Component({
  selector: 'app-vinculacion-social-section',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './vinculacion-social-section.html',
  styleUrl: './vinculacion-social-section.scss'
})
export class VinculacionSocialSection {
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
    return value.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  }
}
