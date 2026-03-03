# Refactorización Pendiente - student-form.ts

## Estado Actual

Se han refactorizado exitosamente 5 secciones, moviendo su lógica específica a componentes independientes:

1. ✅ **IdentificacionSection** - Búsqueda por cédula
2. ✅ **NacionalidadResidenciaSection** - Autocompletado geográfico
3. ✅ **InformacionAcademicaSection** - Colegios y título
4. ✅ **DatosHogarSection** - Servicios, violencia, croquis, egresos
5. ✅ **DatosPersonalesSection** - Mayúsculas y normalización

## Métodos a Eliminar de student-form.ts

### Métodos ya movidos a secciones (ELIMINAR):

1. **Búsqueda por cédula** (ahora en IdentificacionSection):
   - `buscarPorCedula()`
   - `onCedulaBlur()`

2. **Carrera desde landing** (ahora en InformacionAcademicaSection):
   - `applyCarreraFromLanding()`

3. **Título de bachiller** (ahora en InformacionAcademicaSection):
   - `onTituloBachillerFileSelected()`
   - `removeTituloBachiller()`

4. **Croquis de vivienda** (ahora en DatosHogarSection):
   - `onCroquisFileSelected()`
   - `removeCroquis()`

5. **Servicios disponibles** (ahora en DatosHogarSection):
   - `toggleServicio()`
   - `isServicioSelected()`

6. **Tipos de violencia** (ahora en DatosHogarSection):
   - `toggleTipoViolencia()`
   - `isTipoViolenciaSelected()`

7. **Autocompletado geográfico** (ahora en NacionalidadResidenciaSection):
   - `filterPaisesNacionalidad()`
   - `filterPaisesResidencia()`
   - `filterProvinciasNacimiento()`
   - `filterProvinciasResidencia()`
   - `filterCantonesNacimiento()`
   - `filterCantonesResidencia()`
   - `selectPaisNacionalidad()`
   - `selectPaisResidencia()`
   - `selectProvinciaNacimiento()`
   - `selectProvinciaResidencia()`
   - `selectCantonNacimiento()`
   - `selectCantonResidencia()`
   - `onPaisNacionalidadInput()`
   - `onPaisNacionalidadFocus()`
   - `onPaisNacionalidadBlur()`
   - `onPaisResidenciaInput()`
   - `onPaisResidenciaFocus()`
   - `onPaisResidenciaBlur()`
   - `onProvinciaNacimientoInput()`
   - `onProvinciaNacimientoFocus()`
   - `onProvinciaNacimientoBlur()`
   - `onCantonNacimientoInput()`
   - `onCantonNacimientoFocus()`
   - `onCantonNacimientoBlur()`
   - `onProvinciaResidenciaInput()`
   - `onProvinciaResidenciaFocus()`
   - `onProvinciaResidenciaBlur()`
   - `onCantonResidenciaInput()`
   - `onCantonResidenciaFocus()`
   - `onCantonResidenciaBlur()`
   - `cantonPerteneceAProvincia()`
   - `esPaisEcuador()`
   - `getCantonesFiltered()`

8. **Autocompletado de colegios** (ahora en InformacionAcademicaSection):
   - `loadColegiosFromAPI()`
   - `filterColegiosLocally()`
   - `filterColegios()`
   - `selectColegio()`
   - `onColegioInput()`
   - `onColegioFocus()`
   - `onColegioBlur()`

9. **Conversión a mayúsculas** (ahora en DatosPersonalesSection):
   - `setupAutoUppercase()`

10. **Normalización N/A** (ahora en DatosPersonalesSection):
    - `setupNormalizeNA()`
    - `attachNormalizeNAToComposicionIngresos()`

11. **Cálculo de egresos** (ahora en DatosHogarSection):
    - `setupTotalEgresos()`
    - `updateTotalEgresos()`
    - `parseEgresoVal()`

### Métodos auxiliares que pueden permanecer:

- `normalizeText()` - Usado en múltiples lugares
- `getEnumLabel()` - Usado en múltiples lugares
- Validadores estáticos (`integerValidator`, `lettersOnlyValidator`, etc.)

## Propiedades a Eliminar

### Ya movidas a secciones:

```typescript
// Búsqueda por cédula
isSearchingByCedula
cedulaSearchMessage

// Subida de archivos
tituloBachillerUploading
tituloBachillerError
croquisUploading
croquisError

// Autocompletado geográfico
filteredPaisesNacionalidad
filteredPaisesResidencia
filteredProvinciasNacimiento
filteredCantonesNacimiento
filteredProvinciasResidencia
filteredCantonesResidencia
showPaisesNacionalidad
showPaisesResidencia
showProvinciasNacimiento
showCantonesNacimiento
showProvinciasResidencia
showCantonesResidencia
paisNacionalidadSearch
paisResidenciaSearch
provinciaNacimientoSearch
cantonNacimientoSearch
provinciaResidenciaSearch
cantonResidenciaSearch

// Autocompletado de colegios
colegioSearch
filteredColegios
showColegios
allColegios

// Opciones de vivienda (ahora en DatosHogarSection)
estructuraViviendaOpciones
tipoViviendaOpciones
serviciosDisponiblesOpciones
tipoViolenciaOpciones
```

## Actualización del Template HTML

El template `student-form.html` necesita actualizarse para:

1. **IdentificacionSection**:
   - Conectar evento `(estudianteEncontrado)="onEstudianteEncontrado($event)"`
   - Eliminar propiedades `[isSearchingByCedula]` y `[cedulaSearchMessage]`

2. **NacionalidadResidenciaSection**:
   - Eliminar todos los `@Input()` de autocompletado
   - Eliminar todos los `@Output()` de eventos
   - Conectar evento `(colegiosCacheCleared)` si es necesario

3. **InformacionAcademicaSection**:
   - Pasar `[provinciaResidenciaId]` y `[cantonResidenciaId]` como inputs
   - Eliminar eventos de colegios y título
   - La sección maneja todo internamente

4. **DatosHogarSection**:
   - Eliminar todos los eventos y propiedades de servicios, violencia y croquis
   - La sección es completamente autónoma

5. **DatosPersonalesSection**:
   - No requiere cambios, ya es autónoma

## Métodos que Deben Permanecer en student-form.ts

### Coordinación General:
- `ngOnInit()` - Inicialización
- `loadEnums()` - Carga de enumeraciones
- `onEstudianteEncontrado()` - Nuevo método para manejar evento de identificación

### Navegación:
- `nextStep()`
- `previousStep()`
- `goToStep()`
- `getCurrentStepFields()`
- `getStepCompletionStatus()`

### Validación:
- `setupConditionalValidators()`
- `validateCurrentStep()`
- `isStepValid()`
- `getCamposConErrores()`
- `getCamposConErroresForStep()`
- `markFormGroupTouched()`
- `hasError()`
- `getErrorMessage()`
- `getErrorMessageForField()`

### Formulario:
- `createForm()`
- `toggleSection()`

### Composición Familiar:
- `createComposicionFamiliarGroup()`
- `addComposicionFamiliar()`
- `removeComposicionFamiliar()`
- `get composicionFamiliarArray()`

### Ingresos Familiares:
- `createIngresoFamiliarGroup()`
- `addIngresoFamiliar()`
- `removeIngresoFamiliar()`
- `get ingresosFamiliaresArray()`
- `updateIngresoTotalRow()`
- `updateIngresoTotalHogar()`
- `parseIngresoVal()`

### Envío y Guardado:
- `onSubmit()`
- `getFormDataForBackend()`
- `setupAutoSave()`
- `saveFormData()`
- `loadSavedData()`
- `clearSavedData()`

### Utilidades:
- `normalizeText()`
- `getEnumLabel()`
- `parseNumber()`
- `parseInt()`
- `toNumOrNAString()`
- `getProgress()`
- `scrollToFirstError()`
- `patchFormFromEstudiante()`
- `apiEstudianteToFormValue()`

### Validadores Estáticos:
- Todos los validadores estáticos (`integerValidator`, `lettersOnlyValidator`, etc.)

## Próximos Pasos

1. Eliminar métodos duplicados del student-form.ts (listados arriba)
2. Eliminar propiedades duplicadas
3. Actualizar student-form.html para usar las nuevas interfaces
4. Probar cada sección individualmente
5. Probar flujo completo del formulario
6. Verificar que el auto-guardado funciona correctamente
7. Verificar que la navegación entre pasos funciona
8. Verificar que el envío final funciona

## Beneficios Logrados

- Código más organizado y mantenible
- Secciones reutilizables
- Responsabilidades claramente definidas
- Más fácil de probar
- Menos acoplamiento entre componentes
