# Instrucciones para el Backend - Detección de Estudiante Ya Registrado

## Problema Actual

Cuando un estudiante con una cédula ya registrada intenta registrarse nuevamente, el frontend muestra 0% de progreso en lugar de 100% y no detecta correctamente que ya está registrado.

## Cambios Realizados en el Frontend

1. **Modal de éxito simplificado**: Se eliminó el texto "Los datos están disponibles para descargar en el panel de administración"
2. **Detección mejorada**: El frontend ahora verifica si un estudiante completó la FICHA ESTUDIANTIL (pasos 1-7)
3. **Progreso al 100%**: Cuando se detecta un estudiante ya registrado, se muestra el progreso al 100% y un modal informativo

## Lo que Necesita el Backend

### Endpoint: `GET /estudiantes/buscar-por-cedula`

El endpoint que busca estudiantes por cédula debe retornar **TODOS** los campos del estudiante, especialmente los de la FICHA ESTUDIANTIL (pasos 1-7).

#### Campos Críticos para Detección de Registro Completo (Solo Pasos 1-7):

**Paso 1 - Identificación:**
```json
{
  "tipoDocumento": "CEDULA",
  "numeroIdentificacion": "1728780766",
  "fechaNacimiento": "2005-12-30"
}
```

**Paso 2 - Datos Personales:**
```json
{
  "primerApellido": "Pérez",
  "primerNombre": "Juan",
  "sexo": "MASCULINO"
}
```

**Paso 4 - Nacionalidad y Residencia:**
```json
{
  "paisNacionalidadId": 1,
  "provinciaNacimientoId": 17,
  "cantonNacimientoId": 169,
  "paisResidenciaId": 1,
  "provinciaResidenciaId": 17,
  "cantonResidenciaId": 169
}
```

**Paso 5 - Información Académica:**
```json
{
  "carrera": "Desarrollo de Software",
  "modalidadCarrera": "PRESENCIAL",
  "jornadaCarrera": "MATUTINA"
}
```

**Paso 10 - Contacto (dentro de los primeros 7 pasos visibles):**
```json
{
  "correoElectronico": "juan.perez@example.com",
  "numeroCelular": "0987654321"
}
```

### Importante:

1. **Solo se validan pasos 1-7**: Los pasos 8-13 (Ficha Socioeconómica) NO se consideran para determinar si el estudiante ya está registrado

2. **No usar valores "NA" o null para campos completados**: Si un campo tiene un valor real, debe enviarse ese valor, no "NA"

3. **Retornar todos los campos disponibles**: Aunque solo se validan los pasos 1-7, el endpoint debe retornar TODOS los campos que tenga el estudiante para que se puedan cargar en el formulario

### Ejemplo de Respuesta Completa:

```json
{
  "id": 123,
  "tipoDocumento": "CEDULA",
  "numeroIdentificacion": "1728780766",
  "primerApellido": "Pérez",
  "segundoApellido": "García",
  "primerNombre": "Juan",
  "segundoNombre": "Carlos",
  "sexo": "MASCULINO",
  "genero": "MASCULINO",
  "estadoCivil": "SOLTERO",
  "etnia": "MESTIZO",
  "puebloNacionalidadId": null,
  "tipoSangre": "O_POSITIVO",
  "fechaNacimiento": "2005-12-30",
  "paisNacionalidadId": 1,
  "provinciaNacimientoId": 17,
  "cantonNacimientoId": 169,
  "paisResidenciaId": 1,
  "provinciaResidenciaId": 17,
  "cantonResidenciaId": 169,
  "correoElectronico": "juan.perez@example.com",
  "numeroCelular": "0987654321",
  "direccionDomicilio": "Calle Principal 123",
  "carrera": "Desarrollo de Software",
  "tipoColegioId": "FISCAL",
  "modalidadCarrera": "PRESENCIAL",
  "jornadaCarrera": "MATUTINA",
  "fechaInicioCarrera": "2024-01-15",
  "fechaMatricula": "2024-01-10",
  "tipoMatriculaId": "ORDINARIA",
  "duracionPeriodoAcademico": 6,
  "nivelAcademicoQueCursa": "PRIMER_NIVEL",
  "haRepetidoAlMenosUnaMateria": "NO",
  "paraleloId": "A",
  "haPerdidoLaGratuidad": "NO",
  "recibePensionDiferenciada": "NO",
  "estudianteOcupacion": "SOLO_ESTUDIA",
  "ingresosEstudiante": "NO_TIENE_INGRESOS",
  "bonoDesarrollo": "NO",
  "discapacidad": "NO",
  "porcentajeDiscapacidad": null,
  "numCarnetConadis": null,
  "tipoDiscapacidad": null,
  "alergias": "NO",
  "medicamentos": null,
  "referenciaPersonalNombre": "María López",
  "referenciaPersonalParentesco": "MADRE",
  "referenciaPersonalTelefono": "0987654322",
  "enfermedadCatastrofica": "NO",
  "haRealizadoPracticasPreprofesionales": "NO",
  "nroHorasPracticasPreprofesionalesPorPeriodo": null,
  "entornoInstitucionalPracticasProfesionales": null,
  "sectorEconomicoPracticaProfesional": null,
  "tipoBeca": "NO_APLICA",
  "primeraRazonBeca": null,
  "segundaRazonBeca": null,
  "terceraRazonBeca": null,
  "cuartaRazonBeca": null,
  "quintaRazonBeca": null,
  "sextaRazonBeca": null,
  "montoBeca": null,
  "porcentajeBecaCoberturaArancel": null,
  "porcentajeBecaCoberturaManutencion": null,
  "financiamientoBeca": null,
  "montoAyudaEconomica": null,
  "montoCreditoEducativo": null,
  "participaEnProyectoVinculacionSociedad": "NO",
  "tipoAlcanceProyectoVinculacion": null,
  "nivelFormacionPadre": "BACHILLERATO",
  "nivelFormacionMadre": "BACHILLERATO",
  "ingresoTotalHogar": 800,
  "cantidadMiembrosHogar": 4,
  "disenoCurricular": "2024",
  "periodoAcademico": "2024-1",
  "lugarResidencia": "URBANO"
}
```

### Validación de Registro Completo (Solo Pasos 1-7)

El frontend considera que un estudiante completó la FICHA ESTUDIANTIL si tiene valores válidos (no null, no vacío, no "NA") en estos campos:

**Paso 1 - Identificación:**
- `tipoDocumento`
- `numeroIdentificacion`
- `fechaNacimiento`

**Paso 2 - Datos Personales:**
- `primerApellido`
- `primerNombre`
- `sexo`

**Paso 4 - Nacionalidad y Residencia:**
- `paisNacionalidadId`
- `provinciaNacimientoId`
- `cantonNacimientoId`
- `paisResidenciaId`
- `provinciaResidenciaId`
- `cantonResidenciaId`

**Paso 5 - Información Académica:**
- `carrera`
- `modalidadCarrera`
- `jornadaCarrera`

**Paso 10 - Contacto:**
- `correoElectronico`
- `numeroCelular`

**NOTA IMPORTANTE:** Los pasos 8-13 (Datos del Hogar, Composición Familiar, Ingresos Familiares, etc.) NO se consideran para determinar si el estudiante ya está registrado. Solo se validan los 7 primeros pasos de la FICHA ESTUDIANTIL.

## Flujo Esperado

1. Usuario ingresa cédula en el paso de identificación
2. Frontend llama a `GET /estudiantes/buscar-por-cedula?tipo=CEDULA&numero=1728780766`
3. Backend retorna todos los datos del estudiante si existe
4. Frontend verifica si los campos críticos de los pasos 1-7 están completos
5. Si están completos:
   - Carga todos los datos en el formulario
   - Muestra progreso al 100% (paso 7 de 7)
   - Muestra modal: "Tu Registro Ya Fue Completado"
6. Si no están completos:
   - Carga los datos parciales
   - Permite continuar editando
   - Muestra mensaje: "Datos cargados. Puede editar y guardar."

## Notas Adicionales

- El backend debe asegurarse de que cuando un estudiante completa la FICHA ESTUDIANTIL (pasos 1-7), TODOS los campos requeridos de esos pasos tengan valores válidos
- No usar "NA" como valor por defecto para campos opcionales, usar `null` en su lugar
- Los campos numéricos deben ser números, no strings
- Las fechas deben estar en formato ISO (YYYY-MM-DD)
- Los pasos 8-13 son opcionales y no afectan la detección de "estudiante ya registrado"
