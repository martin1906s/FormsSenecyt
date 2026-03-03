# Guía de Integración de Componentes Modulares

Esta guía explica cómo integrar los nuevos componentes modulares en el formulario principal.

## Paso 1: Importar los Componentes

En `student-form.ts`, importa todos los componentes de secciones:

```typescript
import { IdentificacionSection } from './sections/identificacion/identificacion-section';
import { DatosPersonalesSection } from './sections/datos-personales/datos-personales-section';
import { ComposicionFamiliarSection } from './sections/composicion-familiar/composicion-familiar-section';
import { IngresosFamiliaresSection } from './sections/ingresos-familiares/ingresos-familiares-section';
import { AutocompleteField } from './shared/autocomplete-field/autocomplete-field';

@Component({
  selector: 'app-student-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    // Componentes de secciones
    IdentificacionSection,
    DatosPersonalesSection,
    ComposicionFamiliarSection,
    IngresosFamiliaresSection,
    // Componentes compartidos
    AutocompleteField
  ],
  templateUrl: './student-form.html',
  styleUrl: './student-form.scss',
})
export class StudentForm implements OnInit {
  // ... código existente
}
```

## Paso 2: Crear FormGroups Separados

Organiza el formulario en grupos lógicos:

```typescript
export class StudentForm implements OnInit {
  // FormGroups por sección
  identificacionGroup!: FormGroup;
  datosPersonalesGroup!: FormGroup;
  // ... otros grupos

  // FormArrays
  composicionFamiliarArray!: FormArray;
  ingresosFamiliaresArray!: FormArray;

  ngOnInit(): void {
    this.createFormGroups();
    this.loadEnums();
  }

  private createFormGroups(): void {
    // Grupo de identificación
    this.identificacionGroup = this.fb.group({
      tipoDocumentoId: ['', Validators.required],
      numeroIdentificacion: ['', [Validators.required, Validators.minLength(9)]],
      fechaNacimiento: ['', Validators.required]
    });

    // Grupo de datos personales
    this.datosPersonalesGroup = this.fb.group({
      primerApellido: ['', [Validators.required, Validators.maxLength(60)]],
      segundoApellido: ['NA', Validators.maxLength(60)],
      primerNombre: ['', [Validators.required, Validators.maxLength(60)]],
      segundoNombre: ['NA', Validators.maxLength(60)],
      sexoId: ['', Validators.required],
      generoId: ['', Validators.required],
      estadocivilId: ['', Validators.required],
      etniaId: ['', Validators.required],
      pueblonacionalidadId: [''],
      tipoSangre: ['', Validators.required]
    });

    // Arrays
    this.composicionFamiliarArray = this.fb.array([]);
    this.ingresosFamiliaresArray = this.fb.array([]);

    // Combinar en el formulario principal
    this.studentForm = this.fb.group({
      identificacion: this.identificacionGroup,
      datosPersonales: this.datosPersonalesGroup,
      composicionFamiliar: this.composicionFamiliarArray,
      ingresosFamiliares: this.ingresosFamiliaresArray,
      // ... otros campos
    });
  }
}
```

## Paso 3: Actualizar el HTML

Reemplaza las secciones grandes con los componentes:

```html
<form [formGroup]="studentForm" (ngSubmit)="onSubmit()">
  <!-- Paso 0: Identificación -->
  @if (currentStep === 0) {
    <app-identificacion-section
      [formGroup]="identificacionGroup"
      [enums]="enums"
      [isSearchingByCedula]="isSearchingByCedula"
      [cedulaSearchMessage]="cedulaSearchMessage">
    </app-identificacion-section>
  }

  <!-- Paso 1: Datos Personales -->
  @if (currentStep === 1) {
    <app-datos-personales-section
      [formGroup]="datosPersonalesGroup"
      [enums]="enums">
    </app-datos-personales-section>
  }

  <!-- Composición Familiar (en el paso correspondiente) -->
  <app-composicion-familiar-section
    [formArray]="composicionFamiliarArray"
    [parentescoOpciones]="parentescoOpciones"
    (addRow)="addComposicionFamiliar()"
    (removeRow)="removeComposicionFamiliar($event)">
  </app-composicion-familiar-section>

  <!-- Ingresos Familiares (en el paso correspondiente) -->
  <app-ingresos-familiares-section
    [formArray]="ingresosFamiliaresArray"
    [parentescoOpciones]="parentescoOpciones"
    [ingresoTotalHogar]="studentForm.get('ingresoTotalHogar')?.value"
    (addRow)="addIngresoFamiliar()"
    (removeRow)="removeIngresoFamiliar($event)">
  </app-ingresos-familiares-section>

  <!-- Botones de navegación -->
  <div class="form-actions">
    <button type="button" (click)="previousStep()" [disabled]="currentStep === 0">
      Anterior
    </button>
    <button type="button" (click)="nextStep()" *ngIf="currentStep < totalSteps - 1">
      Siguiente
    </button>
    <button type="submit" *ngIf="currentStep === totalSteps - 1">
      Guardar
    </button>
  </div>
</form>
```

## Paso 4: Usar el Componente de Autocompletado

Para campos con autocompletado (países, provincias, etc.):

```html
<app-autocomplete-field
  label="País de Nacionalidad"
  [required]="true"
  [items]="filteredPaisesNacionalidad"
  [searchValue]="paisNacionalidadSearch"
  [showDropdown]="showPaisesNacionalidad"
  [errorMessage]="getErrorMessage('paisNacionalidadId')"
  placeholder="Buscar país..."
  (searchChange)="onPaisNacionalidadInput($event)"
  (itemSelected)="selectPaisNacionalidad($event)"
  (fieldFocus)="onPaisNacionalidadFocus()"
  (fieldBlur)="onPaisNacionalidadBlur()">
</app-autocomplete-field>
```

## Paso 5: Mantener la Lógica de Negocio

Los métodos de lógica de negocio permanecen en el componente principal:

```typescript
export class StudentForm implements OnInit {
  // Métodos existentes
  addComposicionFamiliar(): void {
    this.composicionFamiliarArray.push(this.createComposicionFamiliarGroup());
  }

  removeComposicionFamiliar(index: number): void {
    if (this.composicionFamiliarArray.length > 0) {
      this.composicionFamiliarArray.removeAt(index);
    }
  }

  addIngresoFamiliar(): void {
    const arr = this.ingresosFamiliaresArray;
    arr.push(this.createIngresoFamiliarGroup());
    const row = arr.at(arr.length - 1) as FormGroup;
    
    // Suscribirse a cambios para calcular totales
    row.get('ingresoMensual')?.valueChanges.subscribe(() => {
      this.updateIngresoTotalRow(row);
    });
    row.get('ingresosExtras')?.valueChanges.subscribe(() => {
      this.updateIngresoTotalRow(row);
    });
  }

  removeIngresoFamiliar(index: number): void {
    if (this.ingresosFamiliaresArray.length > 0) {
      this.ingresosFamiliaresArray.removeAt(index);
      this.updateIngresoTotalHogar();
    }
  }

  private updateIngresoTotalRow(row: FormGroup): void {
    const ing = this.parseIngresoVal(row.get('ingresoMensual')?.value);
    const ext = this.parseIngresoVal(row.get('ingresosExtras')?.value);
    const total = ing + ext;
    row.get('total')?.setValue(total === 0 ? '' : total, { emitEvent: false });
    this.updateIngresoTotalHogar();
  }

  private updateIngresoTotalHogar(): void {
    const arr = this.ingresosFamiliaresArray;
    let sum = 0;
    
    for (let i = 0; i < arr.length; i++) {
      const row = arr.at(i) as FormGroup;
      const totalValue = row.get('total')?.value;
      sum += this.parseIngresoVal(totalValue);
    }
    
    this.studentForm.get('ingresoTotalHogar')?.setValue(sum === 0 ? '' : sum, { emitEvent: false });
  }
}
```

## Ventajas de esta Arquitectura

1. **Separación de Responsabilidades**: Cada componente maneja su propia UI
2. **Reutilización**: Los componentes pueden usarse en otros formularios
3. **Mantenibilidad**: Cambios en una sección no afectan otras
4. **Testing**: Más fácil escribir pruebas unitarias
5. **Legibilidad**: El código es más limpio y organizado
6. **Performance**: Posibilidad de lazy loading

## Migración Gradual

Puedes migrar sección por sección:

1. ✅ Identificación (completado)
2. ✅ Datos Personales (completado)
3. ✅ Composición Familiar (completado)
4. ✅ Ingresos Familiares (completado)
5. ⏳ Discapacidad (pendiente)
6. ⏳ Nacionalidad y Residencia (pendiente)
7. ⏳ Información Académica (pendiente)
8. ⏳ Otras secciones...

## Notas Importantes

- Los componentes son **standalone**, no necesitan módulos
- Usan **ReactiveFormsModule** para formularios reactivos
- Los estilos están **encapsulados** en cada componente
- La validación se maneja en el componente principal
- Los eventos se emiten al componente padre para mantener la lógica centralizada
