import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-autocomplete-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './autocomplete-field.html',
  styleUrls: ['./autocomplete-field.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AutocompleteField),
      multi: true
    }
  ]
})
export class AutocompleteField implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = 'Buscar...';
  @Input() required = false;
  @Input() items: any[] = [];
  @Input() displayField = 'nombre';
  @Input() searchValue = '';
  @Input() showDropdown = false;
  @Input() errorMessage = '';
  @Input() hint = '';
  
  @Output() searchChange = new EventEmitter<string>();
  @Output() itemSelected = new EventEmitter<any>();
  @Output() fieldFocus = new EventEmitter<void>();
  @Output() fieldBlur = new EventEmitter<void>();

  value: any = null;
  disabled = false;

  onChange: any = () => {};
  onTouched: any = () => {};

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInput(event: any): void {
    const value = event.target.value;
    this.searchChange.emit(value);
  }

  onFocus(): void {
    this.fieldFocus.emit();
  }

  onBlur(): void {
    this.onTouched();
    this.fieldBlur.emit();
  }

  selectItem(item: any): void {
    this.itemSelected.emit(item);
    this.onChange(item);
  }

  getDisplayValue(item: any): string {
    return item ? item[this.displayField] : '';
  }
}
