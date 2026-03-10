import { Component, Input, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EnumsResponse } from '../../../../../../services/enums.service';
import { EstudianteService } from '../../../../../../services/estudiante.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-datos-hogar-section',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './datos-hogar-section.html',
  styleUrl: './datos-hogar-section.scss'
})
export class DatosHogarSection implements OnInit {
  @Input() formGroup!: FormGroup;
  @Input() enums: EnumsResponse | null = null;
  
  private estudianteService = inject(EstudianteService);
  private cdr = inject(ChangeDetectorRef);
  
  // Opciones para tipo de propiedad de la vivienda
  tipoPropiedadViviendaOpciones: { value: string; label: string }[] = [
    { value: 'PROPIA', label: 'Propia' },
    { value: 'ARRENDADA', label: 'Arrendada' },
    { value: 'CEDIDA_TRABAJO', label: 'Cedida por trabajo' },
    { value: 'CEDIDA_FAMILIAR', label: 'Cedida por familiar' },
    { value: 'OTRO', label: 'Otro' },
    { value: 'NA', label: 'N/A' },
  ];

  // Opciones para estructura de la vivienda
  estructuraViviendaOpciones: { value: string; label: string }[] = [
    { value: 'HORMIGON', label: 'Hormigón' },
    { value: 'LADRILLO', label: 'Ladrillo' },
    { value: 'BLOQUE', label: 'Bloque' },
    { value: 'ADOBE', label: 'Adobe' },
    { value: 'MADERA', label: 'Madera' },
    { value: 'CANA', label: 'Caña' },
    { value: 'OTRO', label: 'Otro' },
    { value: 'NA', label: 'N/A' },
  ];

  // Opciones para tipo de vivienda
  tipoViviendaOpciones: { value: string; label: string }[] = [
    { value: 'SUITE_LUJO', label: 'Suite de lujo' },
    { value: 'CASA', label: 'Casa' },
    { value: 'DEPARTAMENTO', label: 'Departamento' },
    { value: 'HABITACION', label: 'Habitación' },
    { value: 'MEDIA_AGUA', label: 'Media agua' },
    { value: 'RANCHO', label: 'Rancho' },
    { value: 'NA', label: 'N/A' },
  ];

  // Opciones para servicios disponibles (selección múltiple)
  serviciosDisponiblesOpciones: { value: string; label: string }[] = [
    { value: 'ENERGIA_ELECTRICA', label: 'Energía eléctrica' },
    { value: 'AGUA_POTABLE', label: 'Agua potable' },
    { value: 'ALCANTARILLADO', label: 'Alcantarillado' },
    { value: 'TELEFONO_FIJO', label: 'Teléfono fijo' },
    { value: 'INTERNET', label: 'Internet' },
    { value: 'TV_CABLE', label: 'TV cable' },
    { value: 'PLAN_DATOS', label: 'Plan de datos' },
  ];

  // Opciones para tipo de violencia
  tipoViolenciaOpciones: { value: string; label: string }[] = [
    { value: 'FISICA', label: 'Física' },
    { value: 'PSICOLOGICA', label: 'Psicológica' },
    { value: 'SEXUAL', label: 'Sexual' },
    { value: 'SIMBOLICA', label: 'Simbólica' },
    { value: 'PATRIMONIAL_ECONOMICA', label: 'Patrimonial o económica' },
  ];
  
  // Subida de croquis vivienda
  croquisUploading: boolean = false;
  croquisError: string = '';

  ngOnInit(): void {
    this.setupTotalEgresos();
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
  
  // Lógica de servicios disponibles
  toggleServicio(value: string): void {
    const control = this.formGroup.get('serviciosDisponibles');
    if (!control) return;
    
    const current = (control.value || '').toString().trim();
    const list = current ? current.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
    const idx = list.indexOf(value);
    
    if (idx === -1) list.push(value);
    else list.splice(idx, 1);
    
    control.setValue(list.join(', '), { emitEvent: true });
  }

  isServicioSelected(value: string): boolean {
    const current = (this.formGroup.get('serviciosDisponibles')?.value || '').toString();
    const list = current.split(',').map((s: string) => s.trim());
    return list.includes(value);
  }
  
  // Lógica de tipos de violencia
  toggleTipoViolencia(value: string): void {
    const control = this.formGroup.get('tipoViolenciaFamiliar');
    if (!control) return;
    
    const current = (control.value || '').toString().trim();
    const list = current ? current.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
    const idx = list.indexOf(value);
    
    if (idx === -1) list.push(value);
    else list.splice(idx, 1);
    
    control.setValue(list.join(', '), { emitEvent: true });
  }

  isTipoViolenciaSelected(value: string): boolean {
    const current = (this.formGroup.get('tipoViolenciaFamiliar')?.value || '').toString();
    const list = current.split(',').map((s: string) => s.trim());
    return list.includes(value);
  }
  
  // Lógica de cálculo de egresos totales
  private setupTotalEgresos(): void {
    const egresoFields = [
      'egresoAlimentacion',
      'egresoEducacion',
      'egresoVivienda',
      'egresoIndumentaria',
      'egresoSalud',
      'egresoTransporte',
      'egresoServiciosBasicos',
      'egresoOtros'
    ];

    egresoFields.forEach(field => {
      this.formGroup.get(field)?.valueChanges.subscribe(() => {
        this.updateTotalEgresos();
      });
    });

    // Calcular inicial
    this.updateTotalEgresos();
  }

  private updateTotalEgresos(): void {
    const egresoFields = [
      'egresoAlimentacion',
      'egresoEducacion',
      'egresoVivienda',
      'egresoIndumentaria',
      'egresoSalud',
      'egresoTransporte',
      'egresoServiciosBasicos',
      'egresoOtros'
    ];

    let total = 0;
    egresoFields.forEach(field => {
      const val = this.formGroup.get(field)?.value;
      total += this.parseEgresoVal(val);
    });

    this.formGroup.get('egresoTotal')?.setValue(total, { emitEvent: false });
  }

  private parseEgresoVal(v: unknown): number {
    if (v == null || v === '') return 0;
    const str = String(v).trim().toUpperCase();
    if (str === 'N/A' || str === 'NA') return 0;
    const num = parseFloat(str);
    return isNaN(num) ? 0 : Math.max(0, num);
  }

  // Método para formatear moneda
  formatCurrency(value: any): string {
    if (!value || value === 'NA') return '$0.00';
    const num = typeof value === 'number' ? value : parseFloat(value);
    return isNaN(num) ? '$0.00' : `$${num.toFixed(2)}`;
  }
  
  // Lógica de subida de croquis
  onCroquisFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      this.croquisError = 'Solo se permiten imágenes (JPEG, PNG, WebP, GIF).';
      this.cdr.markForCheck();
      return;
    }
    
    this.croquisError = '';
    this.croquisUploading = true;
    this.cdr.markForCheck();
    
    this.estudianteService.uploadCroquisVivienda(file).pipe(
      finalize(() => {
        this.croquisUploading = false;
        this.cdr.markForCheck();
      }),
    ).subscribe({
      next: (res) => {
        this.formGroup.get('croquisViviendaUrl')?.setValue(res.url, { emitEvent: true });
        input.value = '';
      },
      error: (err) => {
        this.croquisError = err?.error?.message || err?.message || 'Error al subir la imagen.';
      },
    });
  }

  removeCroquis(fileInput: HTMLInputElement): void {
    const url = this.formGroup.get('croquisViviendaUrl')?.value;
    if (!url) {
      this.formGroup.get('croquisViviendaUrl')?.setValue('');
      if (fileInput) fileInput.value = '';
      this.cdr.markForCheck();
      return;
    }
    
    this.croquisError = '';
    this.estudianteService.deleteCroquisVivienda(url).subscribe({
      next: () => {
        this.formGroup.get('croquisViviendaUrl')?.setValue('');
        if (fileInput) fileInput.value = '';
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.croquisError = err?.error?.message || err?.message || 'No se pudo eliminar la imagen.';
        this.cdr.markForCheck();
      },
    });
  }
}
