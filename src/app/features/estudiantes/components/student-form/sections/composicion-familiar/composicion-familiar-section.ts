import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-composicion-familiar-section',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './composicion-familiar-section.html',
  styleUrl: './composicion-familiar-section.scss'
})
export class ComposicionFamiliarSection {
  @Input() formArray!: FormArray;
  @Input() parentescoOpciones: { value: string; label: string }[] = [];
  
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
    if (control.errors['minlength']) return `Mín ${control.errors['minlength'].requiredLength}`;
    if (control.errors['maxlength']) return `Máx ${control.errors['maxlength'].requiredLength}`;
    
    return 'Inválido';
  }
}
