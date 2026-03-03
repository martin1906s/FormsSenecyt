import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ingresos-familiares-section',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ingresos-familiares-section.html',
  styleUrl: './ingresos-familiares-section.scss'
})
export class IngresosFamiliaresSection {
  @Input() formArray!: FormArray;
  @Input() parentescoOpciones: { value: string; label: string }[] = [];
  @Input() ingresoTotalHogar: string | number = '';
  
  @Output() addRow = new EventEmitter<void>();
  @Output() removeRow = new EventEmitter<number>();

  onAddRow(): void {
    this.addRow.emit();
  }

  onRemoveRow(index: number): void {
    this.removeRow.emit(index);
  }

  getRowGroup(index: number): FormGroup {
    return this.formArray.at(index) as FormGroup;
  }

  hasError(row: FormGroup, fieldName: string): boolean {
    const control = row.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getErrorMessage(row: FormGroup, fieldName: string): string {
    const control = row.get(fieldName);
    if (!control || !control.errors) return '';
    
    if (control.errors['required']) return 'Requerido';
    if (control.errors['min']) return `Mínimo ${control.errors['min'].min}`;
    
    return 'Inválido';
  }

  formatCurrency(value: any): string {
    if (!value || value === 'NA') return '$0.00';
    const num = typeof value === 'number' ? value : parseFloat(value);
    return isNaN(num) ? '$0.00' : `$${num.toFixed(2)}`;
  }
}
