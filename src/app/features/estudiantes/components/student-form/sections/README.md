# Componentes de Secciones del Formulario

Esta carpeta contiene componentes modulares y reutilizables para cada sección del formulario de estudiantes.

## Estructura

```
sections/
├── identificacion/              # Sección de identificación básica
├── datos-personales/            # Datos personales del estudiante
├── discapacidad/                # Información sobre discapacidad
├── nacionalidad-residencia/     # Datos de nacionalidad y residencia
├── informacion-academica/       # Información académica
├── composicion-familiar/        # Tabla de composición familiar
└── ingresos-familiares/         # Tabla de ingresos familiares
```

## Componentes Implementados

### 1. IdentificacionSection ✅
Componente para capturar datos básicos de identificación.

**Inputs:**
- `formGroup: FormGroup` - Grupo de formulario con los campos de identificación
- `enums: EnumsResponse | null` - Enumeraciones para los selectores
- `isSearchingByCedula: boolean` - Indica si se está buscando por cédula
- `cedulaSearchMessage: string` - Mensaje de búsqueda

**Uso:**
```html
<app-identificacion-section
  [formGroup]="identificacionGroup"
  [enums]="enums"
  [isSearchingByCedula]="isSearchingByCedula"
  [cedulaSearchMessage]="cedulaSearchMessage">
</app-identificacion-section>
```

### 2. DatosPersonalesSection ✅
Componente para capturar datos personales del estudiante.

**Inputs:**
- `formGroup: FormGroup` - Grupo de formulario con los campos de datos personales
- `enums: EnumsResponse | null` - Enumeraciones para los selectores

**Uso:**
```html
<app-datos-personales-section
  [formGroup]="datosPersonalesGroup"
  [enums]="enums">
</app-datos-personales-section>
```

### 3. DiscapacidadSection ✅
Componente para información sobre discapacidad y salud.

**Inputs:**
- `formGroup: FormGroup` - Grupo de formulario con los campos de discapacidad
- `enums: EnumsResponse | null` - Enumeraciones para los selectores

**Uso:**
```html
<app-discapacidad-section
  [formGroup]="discapacidadGroup"
  [enums]="enums">
</app-discapacidad-section>
```

### 4. NacionalidadResidenciaSection ✅
Componente para datos de nacionalidad y residencia con autocompletado.

**Inputs:**
- `formGroup: FormGroup` - Grupo de formulario
- `enums: EnumsResponse | null` - Enumeraciones
- Propiedades de autocompletado para países y provincias
- `cantonesNacimiento: CantonItem[]` - Cantones filtrados por provincia de nacimiento
- `cantonesResidencia: CantonItem[]` - Cantones filtrados por provincia de residencia

**Outputs:**
- Eventos para manejar autocompletado de países y provincias

**Uso:**
```html
<app-nacionalidad-residencia-section
  [formGroup]="nacionalidadGroup"
  [enums]="enums"
  [filteredPaisesNacionalidad]="filteredPaisesNacionalidad"
  [paisNacionalidadSearch]="paisNacionalidadSearch"
  (paisNacionalidadInput)="onPaisNacionalidadInput($event)"
  ...>
</app-nacionalidad-residencia-section>
```

### 5. ComposicionFamiliarSection ✅
Componente de tabla para gestionar la composición familiar.

**Inputs:**
- `formArray: FormArray` - Array de formularios para cada familiar
- `parentescoOpciones: Array<{value: string, label: string}>` - Opciones de parentesco

**Outputs:**
- `addRow: EventEmitter<void>` - Emite cuando se agrega una fila
- `removeRow: EventEmitter<number>` - Emite el índice de la fila a eliminar

**Uso:**
```html
<app-composicion-familiar-section
  [formArray]="composicionFamiliarArray"
  [parentescoOpciones]="parentescoOpciones"
  (addRow)="addComposicionFamiliar()"
  (removeRow)="removeComposicionFamiliar($event)">
</app-composicion-familiar-section>
```

### 6. IngresosFamiliaresSection ✅
Componente de tabla para gestionar ingresos familiares con cálculo automático.

**Inputs:**
- `formArray: FormArray` - Array de formularios para cada ingreso
- `parentescoOpciones: Array<{value: string, label: string}>` - Opciones de parentesco
- `ingresoTotalHogar: string | number` - Total calculado automáticamente

**Outputs:**
- `addRow: EventEmitter<void>` - Emite cuando se agrega una fila
- `removeRow: EventEmitter<number>` - Emite el índice de la fila a eliminar

**Uso:**
```html
<app-ingresos-familiares-section
  [formArray]="ingresosFamiliaresArray"
  [parentescoOpciones]="parentescoOpciones"
  [ingresoTotalHogar]="studentForm.get('ingresoTotalHogar')?.value"
  (addRow)="addIngresoFamiliar()"
  (removeRow)="removeIngresoFamiliar($event)">
</app-ingresos-familiares-section>
```

### 7. ContactoSection ✅
Componente para información de contacto del estudiante.

**Inputs:**
- `formGroup: FormGroup` - Grupo de formulario con los campos de contacto

**Uso:**
```html
<app-contacto-section
  [formGroup]="contactoGroup">
</app-contacto-section>
```

### 8. InformacionAcademicaSection ✅
Componente para información académica con autocompletado de colegios y subida de título.

**Inputs:**
- `formGroup: FormGroup` - Grupo de formulario
- `enums: EnumsResponse | null` - Enumeraciones
- `carrerasOpciones: string[]` - Lista de carreras disponibles
- Propiedades de autocompletado para colegios
- `tituloBachillerUploading: boolean` - Estado de subida de archivo
- `tituloBachillerError: string` - Mensaje de error de subida

**Outputs:**
- Eventos para autocompletado de colegios
- `tituloBachillerFileSelected: EventEmitter<Event>` - Archivo seleccionado
- `removeTituloBachiller: EventEmitter<HTMLInputElement>` - Eliminar archivo

**Uso:**
```html
<app-informacion-academica-section
  [formGroup]="informacionAcademicaGroup"
  [enums]="enums"
  [carrerasOpciones]="carrerasOpciones"
  [colegioSearch]="colegioSearch"
  [filteredColegios]="filteredColegios"
  (colegioInput)="onColegioInput($event)"
  (tituloBachillerFileSelected)="onTituloBachillerFileSelected($event)"
  ...>
</app-informacion-academica-section>
```

### 9. InformacionEconomicaSection ✅
Componente para información económica del estudiante.

**Inputs:**
- `formGroup: FormGroup` - Grupo de formulario
- `enums: EnumsResponse | null` - Enumeraciones

**Uso:**
```html
<app-informacion-economica-section
  [formGroup]="informacionEconomicaGroup"
  [enums]="enums">
</app-informacion-economica-section>
```

### 10. PracticasPreprofesionalesSection ✅
Componente para información sobre prácticas preprofesionales.

**Inputs:**
- `formGroup: FormGroup` - Grupo de formulario
- `enums: EnumsResponse | null` - Enumeraciones

**Uso:**
```html
<app-practicas-preprofesionales-section
  [formGroup]="practicasGroup"
  [enums]="enums">
</app-practicas-preprofesionales-section>
```

### 11. BecasAyudasSection ✅
Componente para información sobre becas y ayudas económicas.

**Inputs:**
- `formGroup: FormGroup` - Grupo de formulario
- `enums: EnumsResponse | null` - Enumeraciones

**Uso:**
```html
<app-becas-ayudas-section
  [formGroup]="becasGroup"
  [enums]="enums">
</app-becas-ayudas-section>
```

### 12. VinculacionSocialSection ✅
Componente para información sobre vinculación con la sociedad.

**Inputs:**
- `formGroup: FormGroup` - Grupo de formulario
- `enums: EnumsResponse | null` - Enumeraciones

**Uso:**
```html
<app-vinculacion-social-section
  [formGroup]="vinculacionGroup"
  [enums]="enums">
</app-vinculacion-social-section>
```

### 13. DatosHogarSection ✅
Componente para datos del hogar y familia.

**Inputs:**
- `formGroup: FormGroup` - Grupo de formulario
- `enums: EnumsResponse | null` - Enumeraciones

**Uso:**
```html
<app-datos-hogar-section
  [formGroup]="datosHogarGroup"
  [enums]="enums">
</app-datos-hogar-section>
```

## Ventajas de esta Arquitectura

1. **Reutilización**: Los componentes pueden usarse en otros formularios
2. **Mantenibilidad**: Cada sección es independiente y fácil de mantener
3. **Testing**: Más fácil probar componentes individuales
4. **Legibilidad**: El código es más limpio y organizado
5. **Lazy Loading**: Posibilidad de cargar componentes bajo demanda

## Estado de Componentes

Todos los componentes han sido creados exitosamente:

- [x] IdentificacionSection
- [x] DatosPersonalesSection
- [x] DiscapacidadSection
- [x] NacionalidadResidenciaSection
- [x] ComposicionFamiliarSection
- [x] IngresosFamiliaresSection
- [x] ContactoSection
- [x] InformacionAcademicaSection
- [x] InformacionEconomicaSection
- [x] PracticasPreprofesionalesSection
- [x] BecasAyudasSection
- [x] VinculacionSocialSection
- [x] DatosHogarSection

**Total: 13/13 componentes completados ✅**

## Integración en el Componente Principal

En el componente `student-form.ts`, importar y usar los componentes:

```typescript
import { IdentificacionSection } from './sections/identificacion/identificacion-section';
import { ComposicionFamiliarSection } from './sections/composicion-familiar/composicion-familiar-section';
import { IngresosFamiliaresSection } from './sections/ingresos-familiares/ingresos-familiares-section';

@Component({
  selector: 'app-student-form',
  imports: [
    // ... otros imports
    IdentificacionSection,
    ComposicionFamiliarSection,
    IngresosFamiliaresSection
  ],
  // ...
})
```

## Notas de Implementación

- Todos los componentes son **standalone** para facilitar su uso
- Usan **ReactiveFormsModule** para formularios reactivos
- Incluyen validación y mensajes de error
- Los estilos están encapsulados en cada componente
- Siguen las mejores prácticas de Angular
