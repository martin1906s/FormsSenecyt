import { Component, Input, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EnumsResponse } from '../../../../../../services/enums.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-discapacidad-section',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './discapacidad-section.html',
  styleUrl: './discapacidad-section.scss'
})
export class DiscapacidadSection implements OnInit, OnDestroy {
  @Input() formGroup!: FormGroup;
  @Input() enums: EnumsResponse | null = null;
  @Input() parentescoOpciones: { value: string; label: string }[] = [];

  private cdr = inject(ChangeDetectorRef);
  private discapacidadSubscription?: Subscription;

  ngOnInit(): void {
    // Suscribirse a cambios en el campo discapacidad para habilitar/deshabilitar campos
    this.discapacidadSubscription = this.formGroup.get('discapacidad')?.valueChanges.subscribe((value: any) => {
      this.updateDiscapacidadFields(value);
      this.cdr.detectChanges();
    });

    // Aplicar estado inicial
    const discapacidadValue = this.formGroup.get('discapacidad')?.value;
    if (discapacidadValue) {
      this.updateDiscapacidadFields(discapacidadValue);
    }
  }

  ngOnDestroy(): void {
    this.discapacidadSubscription?.unsubscribe();
  }

  private updateDiscapacidadFields(discapacidadValue: any): void {
    const porcentaje = this.formGroup.get('porcentajeDiscapacidad');
    const carnet = this.formGroup.get('numCarnetConadis');
    const tipo = this.formGroup.get('tipoDiscapacidad');

    if (discapacidadValue === 'NO') {
      // Deshabilitar campos y establecer valores automáticos
      porcentaje?.disable({ emitEvent: false });
      porcentaje?.setValue('NA', { emitEvent: false });
      
      carnet?.disable({ emitEvent: false });
      carnet?.setValue('NA', { emitEvent: false });
      
      tipo?.disable({ emitEvent: false });
      tipo?.setValue('', { emitEvent: false });
    } else if (discapacidadValue === 'SI') {
      // Habilitar campos
      porcentaje?.enable({ emitEvent: false });
      carnet?.enable({ emitEvent: false });
      tipo?.enable({ emitEvent: false });
      
      // Limpiar valores automáticos si existían
      if (porcentaje?.value === 'NA') porcentaje?.setValue('', { emitEvent: false });
      if (carnet?.value === 'NA') carnet?.setValue('', { emitEvent: false });
    } else {
      // Si no hay valor seleccionado, habilitar pero sin valores automáticos
      porcentaje?.enable({ emitEvent: false });
      carnet?.enable({ emitEvent: false });
      tipo?.enable({ emitEvent: false });
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
    if (control.errors['min']) return `Valor mínimo: ${control.errors['min'].min}`;
    if (control.errors['max']) return `Valor máximo: ${control.errors['max'].max}`;
    if (control.errors['maxlength']) return `Máximo ${control.errors['maxlength'].requiredLength} caracteres`;
    
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
}
