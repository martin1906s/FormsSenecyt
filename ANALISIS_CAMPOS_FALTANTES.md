# Análisis de Campos Faltantes en el Formulario de Inscripción

## Resumen Ejecutivo

He analizado los dos documentos que se generan desde el formulario:
1. **FICHA ESTUDIANTIL** - Documento simple con datos básicos
2. **FICHA SOCIOECONÓMICA** - Documento completo con 8 secciones

## Estado Actual del Formulario

El formulario tiene **11 pasos** actualmente:
1. Identificación ✅
2. Datos Personales ✅
3. Discapacidad ✅
4. Nacionalidad y Residencia ✅
5. Información Académica ✅
6. Información Económica ✅
7. Prácticas Preprofesionales ✅
8. Becas y Ayudas ✅
9. Vinculación Social ✅
10. Contacto ✅
11. Datos del Hogar ✅

## Secciones que Existen pero NO se Usan

Hay 2 componentes creados que NO están integrados en el formulario:
- `composicion-familiar-section` ❌ (existe pero no se usa)
- `ingresos-familiares-section` ❌ (existe pero no se usa)

---

## FICHA ESTUDIANTIL - Análisis de Campos

### Campos que SÍ existen en el formulario:
- ✅ Apellidos y Nombres
- ✅ Fecha de Nacimiento
- ✅ Lugar de Nacimiento (campo: lugarNacimiento)
- ✅ No. Cédula (campo: numeroIdentificacion)
- ✅ Estado Civil
- ✅ Edad (se puede calcular desde fechaNacimiento)
- ✅ Sexo
- ✅ Género
- ✅ Etnia
- ✅ Carrera
- ✅ Diseño (campo: disenoCurricular)
- ✅ Nivel (campo: nivelAcademicoQueCursa)
- ✅ Paralelo
- ✅ Período (campo: periodoAcademico)

### Campos de Emergencia (Página 2):
- ✅ Tipo de Sangre
- ✅ Alergias
- ✅ Discapacidad
- ✅ Enfermedad Catastrófica
- ✅ Medicamentos
- ✅ Referencia Personal (Nombre, Parentesco, Teléfono)

**CONCLUSIÓN FICHA ESTUDIANTIL:** ✅ Todos los campos existen

---

## FICHA SOCIOECONÓMICA - Análisis Detallado

### 1. DATOS GENERALES

#### 1.1 Apellidos y Nombres ✅
- primerApellido, segundoApellido, primerNombre, segundoNombre

#### 1.2 Tipo de documentación de identificación ✅
- tipoDocumentoId (Cédula/Pasaporte)
- numeroIdentificacion
- N° de cédula

#### 1.3 Estado civil ✅
- estadocivilId (Soltero, Casado, Viudo, Divorciado, Unión de hecho)

#### 1.4 Sexo ✅
- sexoId (Hombre/Mujer)

#### 1.5 Género ✅
- generoId (Masculino/Femenino)

#### 1.6 Lugar y fecha de nacimiento ✅
- fechaNacimiento
- lugarNacimiento (existe pero puede necesitar ajuste)

#### 1.7 Etnia ✅
- etniaId (Afro ecuatoriano, Negro, Mulato, Indígena, Montubio, Mestizo, Blanco, Otro)

#### 1.8 Contactos ✅
- numeroConvencional ✅
- numeroCelular ✅
- correoElectronico ✅
- correoInstitucional ✅

#### 1.9 Tipo de sangre ✅
- tipoSangre

#### 1.10 En caso de emergencias comunicarse con ✅
- referenciaPersonalNombre ✅
- referenciaPersonalParentesco ✅
- referenciaPersonalTelefono ✅

#### 1.11 ¿Presenta carnet de discapacidad? ✅
- presentaCarnetDiscapacidad ✅

#### 1.12 ¿Presenta algún tipo de alergia importante a considerar? ✅
- presentaAlergiaImportante ✅

### 2. DATOS ACADÉMICOS

#### 2.1 Carrera en la cual va estudiar o estudia ✅
- carrera

#### 2.2 Diseño ✅
- disenoCurricular (Validación/Regular)

#### 2.3 Período académico ✅
- periodoAcademico

#### 2.4 Paralelo ✅
- paraleloId

#### 2.5 Nivel ✅
- nivelAcademicoQueCursa

#### 2.6 Colegio del cual proviene ❌ FALTA
**Campo faltante:** `nombreColegioProcedencia` (existe en createForm pero no en secciones)

#### 2.7 Tipo de colegio ✅
- tipoColegioId (Privado/Fiscal/Municipal)

#### 2.8 Título de Bachiller ❌ FALTA
**Campo faltante:** `tituloBachiller` (existe en createForm pero no en secciones)

#### 2.9 Año de graduación ❌ FALTA
**Campo faltante:** `anioGraduacion` (existe en createForm pero no en secciones)

#### 2.10 Modalidad de estudio ✅
- modalidadCarrera (Presencial/Semipresencial/Híbrida/En línea)

#### 2.11 Financiamiento de la carrera universitaria ❌ FALTA PARCIALMENTE
- Fondos propios ❌
- Ayuda de sus padres ❌
- Tarjeta de crédito ❌
- Entidad financiera (préstamos) ❌
- Ayuda a terceras personas ✅ (financiamientoQuienes existe)
- ¿Quiénes? ✅

**Campos faltantes:** Necesitamos checkboxes para las opciones de financiamiento

### 3. ACTIVIDAD OCUPACIONAL DEL ESTUDIANTE

#### 3.1 ¿Tiene usted algún trabajo? ✅
- estudianteocupacionId
- Si es así especifique ❌ FALTA

**Campo faltante:** `trabajoEspecifique` (texto libre)

### 4. DATOS DOMICILIARIOS

#### 4.1 Lugar de procedencia ❌ FALTAN VARIOS
- País ✅ (paisNacionalidadId)
- Provincia ✅ (provinciaNacimientoId)
- Cantón ✅ (cantonNacimientoId)
- Parroquia ❌ FALTA
- Barrio/Sector ✅ (barrioSector)
- Dirección de domicilio ✅ (direccionDomicilio)
- Referencia domiciliaria ✅ (referenciaDomiciliaria)

**Campo faltante:** `parroquiaProcedencia`

#### 4.1 (continuación) - Estudiantes de otro país o residencia
- País ❌ FALTA (necesitamos campo separado para procedencia extranjera)
- Estado/Provincia ❌ FALTA
- Cantón ❌ FALTA
- Parroquia ❌ FALTA
- Barrio/Sector ❌ FALTA
- Dirección domiciliaria ❌ FALTA

**Campos faltantes:** Sistema completo para estudiantes extranjeros
- `paisProcedenciaExtranjero`
- `estadoProvinciaProcedencia`
- `cantonProcedencia`
- `parroquiaProcedencia`
- `barrioSectorProcedencia`
- `direccionDomicilioProcedencia`

### 5. CARACTERÍSTICAS DE LA VIVIENDA

#### 5.1 Ubicación (calles y dirección) ✅
- direccionDomicilio

#### 5.2 Zona ✅
- zonaVivienda (Urbana/Rural/Suburbano)

#### 5.3 Coordenadas de la vivienda ✅
- coordenadasVivienda

#### 5.4 Croquis de la vivienda ✅
- croquisViviendaUrl

#### 5.5 Tipo de propiedad ✅
- tipoPropiedadVivienda (Propia/Arrendada/Cedida por trabajo/Cedida por familiar/Otro)

#### 5.6 Estructura de la vivienda ✅
- estructuraVivienda (Hormigón/Ladrillo/Bloque/Adobe/Madera/Caña/Otro)
- estructuraViviendaEspecifique

#### 5.7 Tipo de vivienda ✅
- tipoVivienda (Suite de lujo/Casa/Departamento/Habitación/Media agua/Rancho)

#### 5.8 Servicios disponibles ❌ FALTA (checkboxes múltiples)
- Energía eléctrica ❌
- Agua potable ❌
- Alcantarillado ❌
- Teléfono fijo ❌
- Internet ❌
- TV cable ❌
- Plan de datos ❌

**Campo actual:** `serviciosDisponibles` (string) - necesita convertirse en checkboxes

**Campos faltantes:**
- `servicioEnergiaElectrica` (boolean)
- `servicioAguaPotable` (boolean)
- `servicioAlcantarillado` (boolean)
- `servicioTelefonoFijo` (boolean)
- `servicioInternet` (boolean)
- `servicioTvCable` (boolean)
- `servicioPlanDatos` (boolean)

#### 5.9 ¿Cuántos baños existen en su hogar? ✅
- cantidadBanos

#### 5.10 ¿Cuántas habitaciones existen en el hogar? ✅
- cantidadHabitaciones

#### 5.11 ¿Compartes habitación? ✅
- comparteHabitacion (madre, padre, primas, primos, sobrinos, tías, tíos, pareja)

#### 5.12 ¿Actualmente con quien o quienes vives? ✅
- conQuienVive

#### 5.13 ¿Cuántas personas viven en total en la vivienda? ✅
- cantidadMiembrosHogar

#### 5.14 ¿El tamaño de la vivienda es suficiente respecto al número de personas que la habitan? ✅
- tamanoViviendaSuficiente (Si/No)

### 6. DATOS GRUPO FAMILIAR

#### 6.1 Composición familiar ❌ NO INTEGRADO
**Componente existe pero NO está en el formulario**

Tabla con campos:
- Nombres y Apellidos
- Fecha de Nacimiento
- Cédula de Identidad
- Estado Civil
- Parentesco
- Nivel de estudios
- Título
- Labor u ocupación

**Acción requerida:** Integrar `composicion-familiar-section` en el formulario

### 7. INGRESOS Y EGRESOS (Página 7-8)

#### 7.1 Ingresos familiares ❌ NO INTEGRADO
**Componente existe pero NO está en el formulario**

Necesita tabla con:
- Nombres y Apellidos
- Parentesco
- Actividad Laboral
- Ingreso Mensual
- Ingresos Extras
- Total

**Acción requerida:** Integrar `ingresos-familiares-section` en el formulario

#### 7.2 Egresos familiares del grupo familiar ✅ PARCIAL
Tabla de gastos mensuales:
- Vivienda ✅ (egresoVivienda)
- Alimentación ✅ (egresoAlimentacion)
- Educación ✅ (egresoEducacion)
- Indumentaria ✅ (egresoIndumentaria)
- Transporte ✅ (egresoTransporte)
- Salud ✅ (egresoSalud)
- Servicios Básicos ✅ (egresoServiciosBasicos)
- OTROS ✅ (egresoOtros)
- TOTAL DE EGRESOS ✅ (totalEgresos)

**Acción requerida:** Crear sección visual para mostrar estos campos

### 8. SITUACIÓN DE LA SALUD DE LA FAMILIA

#### 8.1 ¿Algún miembro de la familia presenta discapacidades y/o enfermedades catastróficas? ✅
- familiaDiscapacidadEnfermedadCatastrofica (Si/No)
- Problema de salud ✅ (familiaProblemaSalud)
- Parentesco ✅ (familiaParentesco)

#### 8.2 ¿Su familia cuenta con servicios médicos? ✅
- familiaServiciosMedicos (Si/No)
- Si es que es así especifique con cuales:
  - IEES ✅ (familiaServicioIees)
  - Seguro Privado ✅ (familiaServicioSeguroPrivado)
  - Seguro Campesino ✅ (familiaServicioSeguroCampesino)
  - Otro ✅ (familiaServicioOtro)
  - Especifique ✅ (familiaServicioOtroEspecifique)

**Acción requerida:** Crear sección visual para mostrar estos campos

---

## CAMPOS ADICIONALES QUE FALTAN

### Campos que existen en createForm pero no en ninguna sección:

1. **Información Académica:**
   - `nombreColegioProcedencia` ❌
   - `tituloBachiller` ❌
   - `anioGraduacion` ❌

2. **Datos de Procedencia (extranjeros):**
   - Sistema completo para estudiantes de otro país ❌

3. **Servicios de la vivienda:**
   - Convertir `serviciosDisponibles` a checkboxes individuales ❌

4. **Financiamiento:**
   - Checkboxes para tipos de financiamiento ❌
   - `trabajoEspecifique` ❌

5. **Dinámica Familiar (campos que existen pero no se muestran):**
   - `dinamicaFamiliar` ✅ (existe)
   - `violenciaFamiliar` ✅ (existe)
   - `tipoViolenciaFamiliar` ✅ (existe)
   - `estudianteCabezaFamiliar` ✅ (existe)

---

## RESUMEN DE ACCIONES REQUERIDAS

### 1. Integrar Secciones Existentes (PRIORIDAD ALTA)
- [ ] Integrar `composicion-familiar-section` en el paso 11 o crear paso 12
- [ ] Integrar `ingresos-familiares-section` en el paso 11 o crear paso 13

### 2. Crear Nuevas Secciones (PRIORIDAD ALTA)
- [ ] Sección "Egresos Familiares" con tabla de gastos
- [ ] Sección "Salud Familiar" con campos de discapacidad y servicios médicos

### 3. Agregar Campos Faltantes en Secciones Existentes (PRIORIDAD MEDIA)
- [ ] En Información Académica: agregar nombreColegioProcedencia, tituloBachiller, anioGraduacion
- [ ] En Información Económica: agregar trabajoEspecifique
- [ ] En Información Económica: agregar checkboxes de financiamiento
- [ ] En Datos Domiciliarios: agregar parroquiaProcedencia
- [ ] En Características Vivienda: convertir serviciosDisponibles a checkboxes

### 4. Sistema para Estudiantes Extranjeros (PRIORIDAD BAJA)
- [ ] Crear campos condicionales para procedencia de otro país

### 5. Ajustar Generación de Documentos (PRIORIDAD ALTA)
- [ ] Modificar servicio para generar FICHA ESTUDIANTIL con texto
- [ ] Modificar servicio para generar FICHA SOCIOECONÓMICA con marcas X en checkboxes

---

## ESTRUCTURA PROPUESTA DE PASOS

### Opción A: Mantener 11 pasos y expandir el paso 11
**Paso 11: Datos del Hogar y Familia** (expandido)
- Nivel formación padre/madre
- Ingreso total hogar
- Cantidad miembros hogar
- **+ Composición Familiar** (tabla)
- **+ Ingresos Familiares** (tabla)
- **+ Egresos Familiares** (tabla)
- **+ Salud Familiar** (campos)

### Opción B: Crear nuevos pasos (RECOMENDADO)
- Paso 11: Datos del Hogar (actual)
- **Paso 12: Composición Familiar** (nuevo)
- **Paso 13: Ingresos y Egresos Familiares** (nuevo)
- **Paso 14: Salud Familiar** (nuevo)

Total: 14 pasos

---

## PRÓXIMOS PASOS

1. ¿Quieres que integre las secciones existentes primero?
2. ¿Prefieres la Opción A (expandir paso 11) u Opción B (crear nuevos pasos)?
3. ¿Empezamos con los campos faltantes en las secciones actuales?

**Esperando tu aprobación para proceder...**
