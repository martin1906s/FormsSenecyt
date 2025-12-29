# Ejemplo de JSON para POST /estudiantes

Este documento muestra el formato exacto del JSON que debes enviar en el POST al backend.

## Endpoint
```
POST http://localhost:3000/estudiantes
Content-Type: application/json
```

## Ejemplo Completo de JSON

```json
    {
    "tipoDocumento": "CEDULA",
    "numeroIdentificacion": "1234567890",
    "primerApellido": "GARCIA",
    "segundoApellido": "LOPEZ",
    "primerNombre": "JUAN",
    "segundoNombre": "CARLOS",
    "sexo": "HOMBRE",
    "genero": "MASCULINO",
    "estadoCivil": "SOLTERO",
    "etnia": "MESTIZO",
    "puebloNacionalidad": "NO_APLICA",
    "tipoSangre": "O_POSITIVO",
    "discapacidad": "NO",
    "porcentajeDiscapacidad": "NA",
    "numCarnetConadis": "NA",
    "tipoDiscapacidad": "NO_APLICA",
    "fechaNacimiento": "1995-05-15",
    "paisNacionalidadId": "ECUADOR",
    "provinciaNacimientoId": "PICHINCHA",
    "cantonNacimientoId": "1701",
    "paisResidenciaId": "ECUADOR",
    "provinciaResidenciaId": "PICHINCHA",
    "cantonResidenciaId": "1701",
    "tipoColegioId": "FISCAL",
    "modalidadCarrera": "PRESENCIAL",
    "jornadaCarrera": "MATUTINA",
    "fechaInicioCarrera": "2020-09-01",
    "fechaMatricula": "2020-08-15",
    "tipoMatricula": "ORDINARIA",
    "nivelAcademico": "TERCERO",
    "duracionPeriodoAcademico": 6,
    "haRepetidoAlMenosUnaMateria": "NO",
    "paralelo": "A",
    "haPerdidoLaGratuidad": "NO",
    "recibePensionDiferenciada": "NO",
    "estudianteOcupacion": "SOLO_ESTUDIA",
    "ingresosEstudiante": "NO_APLICA",
    "bonoDesarrollo": "SI",
    "haRealizadoPracticasPreprofesionales": "SI",
    "nroHorasPracticasPreprofesionalesPorPeriodo": "120",
    "entornoInstitucionalPracticasProfesionales": "PUBLICA",
    "sectorEconomicoPracticaProfesional": "AGRICULTURA_GANADERIA_SILVICULTURA_Y_PESCA",
    "tipoBeca": "TOTAL",
    "primeraRazonBeca": "SOCIOECONOMICA",
    "segundaRazonBeca": "NO_APLICA",
    "terceraRazonBeca": "NO_APLICA",
    "cuartaRazonBeca": "NO_APLICA",
    "quintaRazonBeca": "NO_APLICA",
    "sextaRazonBeca": "NO_APLICA",
    "montoBeca": "5000",
    "porcentajeBecaCoberturaArancel": "100",
    "porcentajeBecaCoberturaManutencion": "50",
    "financiamientoBeca": "FONDOS_PROPIOS",
    "montoAyudaEconomica": "NA",
    "montoCreditoEducativo": "NA",
    "participaEnProyectoVinculacionSociedad": "SI",
    "tipoAlcanceProyectoVinculacion": "NACIONAL",
    "correoElectronico": "juan.garcia@email.com",
    "numeroCelular": "0987654321",
    "nivelFormacionPadre": "SUPERIOR_UNIVERSITARIA",
    "nivelFormacionMadre": "SUPERIOR_UNIVERSITARIA",
    "ingresoTotalHogar": "1500",
    "cantidadMiembrosHogar": 4,
    "periodoAcademicoId": 1
    }
```

## Ejemplo con Discapacidad = SI

```json
{
  "tipoDocumento": "CEDULA",
  "numeroIdentificacion": "1234567890",
  "primerApellido": "GARCIA",
  "segundoApellido": "LOPEZ",
  "primerNombre": "JUAN",
  "segundoNombre": "CARLOS",
  "sexo": "HOMBRE",
  "genero": "MASCULINO",
  "estadoCivil": "SOLTERO",
  "etnia": "MESTIZO",
  "puebloNacionalidad": "NO_APLICA",
  "tipoSangre": "O_POSITIVO",
  "discapacidad": "SI",
  "porcentajeDiscapacidad": "45",
  "numCarnetConadis": "1234567",
  "tipoDiscapacidad": "FISICA",
  "fechaNacimiento": "1995-05-15",
  "paisNacionalidadId": "ECUADOR",
  "provinciaNacimientoId": "PICHINCHA",
  "cantonNacimientoId": "1701",
  "paisResidenciaId": "ECUADOR",
  "provinciaResidenciaId": "PICHINCHA",
  "cantonResidenciaId": "1701",
  "tipoColegioId": "FISCAL",
  "modalidadCarrera": "PRESENCIAL",
  "jornadaCarrera": "MATUTINA",
  "fechaInicioCarrera": "2020-09-01",
  "fechaMatricula": "2020-08-15",
  "tipoMatricula": "ORDINARIA",
  "nivelAcademico": "TERCERO",
  "duracionPeriodoAcademico": 6,
  "haRepetidoAlMenosUnaMateria": "NO",
  "paralelo": "A",
  "haPerdidoLaGratuidad": "NO",
  "recibePensionDiferenciada": "NO",
  "estudianteOcupacion": "SOLO_ESTUDIA",
  "ingresosEstudiante": "NO_APLICA",
  "bonoDesarrollo": "SI",
  "haRealizadoPracticasPreprofesionales": "SI",
  "nroHorasPracticasPreprofesionalesPorPeriodo": "120",
  "entornoInstitucionalPracticasProfesionales": "PUBLICA",
  "sectorEconomicoPracticaProfesional": "AGRICULTURA_GANADERIA_SILVICULTURA_Y_PESCA",
  "tipoBeca": "TOTAL",
  "primeraRazonBeca": "SOCIOECONOMICA",
  "segundaRazonBeca": "NO_APLICA",
  "terceraRazonBeca": "NO_APLICA",
  "cuartaRazonBeca": "NO_APLICA",
  "quintaRazonBeca": "NO_APLICA",
  "sextaRazonBeca": "NO_APLICA",
  "montoBeca": "5000",
  "porcentajeBecaCoberturaArancel": "100",
  "porcentajeBecaCoberturaManutencion": "50",
  "financiamientoBeca": "FONDOS_PROPIOS",
  "montoAyudaEconomica": "NA",
  "montoCreditoEducativo": "NA",
  "participaEnProyectoVinculacionSociedad": "SI",
  "tipoAlcanceProyectoVinculacion": "NACIONAL",
  "correoElectronico": "juan.garcia@email.com",
  "numeroCelular": "0987654321",
  "nivelFormacionPadre": "SUPERIOR_UNIVERSITARIA",
  "nivelFormacionMadre": "SUPERIOR_UNIVERSITARIA",
  "ingresoTotalHogar": "1500",
  "cantidadMiembrosHogar": 4,
  "periodoAcademicoId": 1
}
```

## Ejemplo con Etnia = INDIGENA (requiere puebloNacionalidad)

```json
{
  "tipoDocumento": "CEDULA",
  "numeroIdentificacion": "1234567890",
  "primerApellido": "GARCIA",
  "segundoApellido": "LOPEZ",
  "primerNombre": "JUAN",
  "segundoNombre": "CARLOS",
  "sexo": "HOMBRE",
  "genero": "MASCULINO",
  "estadoCivil": "SOLTERO",
  "etnia": "INDIGENA",
  "puebloNacionalidad": "KICHWA",
  "tipoSangre": "O_POSITIVO",
  "discapacidad": "NO",
  "porcentajeDiscapacidad": "NA",
  "numCarnetConadis": "NA",
  "tipoDiscapacidad": "NO_APLICA",
  "fechaNacimiento": "1995-05-15",
  "paisNacionalidadId": "ECUADOR",
  "provinciaNacimientoId": "PICHINCHA",
  "cantonNacimientoId": "1701",
  "paisResidenciaId": "ECUADOR",
  "provinciaResidenciaId": "PICHINCHA",
  "cantonResidenciaId": "1701",
  "tipoColegioId": "FISCAL",
  "modalidadCarrera": "PRESENCIAL",
  "jornadaCarrera": "MATUTINA",
  "fechaInicioCarrera": "2020-09-01",
  "fechaMatricula": "2020-08-15",
  "tipoMatricula": "ORDINARIA",
  "nivelAcademico": "TERCERO",
  "duracionPeriodoAcademico": 6,
  "haRepetidoAlMenosUnaMateria": "NO",
  "paralelo": "A",
  "haPerdidoLaGratuidad": "NO",
  "recibePensionDiferenciada": "NO",
  "estudianteOcupacion": "SOLO_ESTUDIA",
  "ingresosEstudiante": "NO_APLICA",
  "bonoDesarrollo": "SI",
  "haRealizadoPracticasPreprofesionales": "NO",
  "nroHorasPracticasPreprofesionalesPorPeriodo": "NA",
  "entornoInstitucionalPracticasProfesionales": "NO_APLICA",
  "sectorEconomicoPracticaProfesional": "NO_APLICA",
  "tipoBeca": "NO_APLICA",
  "primeraRazonBeca": "NO_APLICA",
  "segundaRazonBeca": "NO_APLICA",
  "terceraRazonBeca": "NO_APLICA",
  "cuartaRazonBeca": "NO_APLICA",
  "quintaRazonBeca": "NO_APLICA",
  "sextaRazonBeca": "NO_APLICA",
  "montoBeca": "NA",
  "porcentajeBecaCoberturaArancel": "0",
  "porcentajeBecaCoberturaManutencion": "0",
  "montoAyudaEconomica": "NA",
  "montoCreditoEducativo": "NA",
  "participaEnProyectoVinculacionSociedad": "NO",
  "correoElectronico": "juan.garcia@email.com",
  "numeroCelular": "0987654321",
  "nivelFormacionPadre": "SUPERIOR_UNIVERSITARIA",
  "nivelFormacionMadre": "SUPERIOR_UNIVERSITARIA",
  "ingresoTotalHogar": "1500",
  "cantidadMiembrosHogar": 4,
  "periodoAcademicoId": 1
}
```

## Valores de Enum Permitidos

### tipoDocumento
- `CEDULA`
- `PASAPORTE`

### sexo
- `HOMBRE`
- `MUJER`

### genero
- `MASCULINO`
- `FEMENINO`

### estadoCivil
- `SOLTERO`
- `CASADO`
- `DIVORCIADO`
- `UNION_LIBRE`
- `VIUDO`

### etnia
- `INDIGENA`
- `AFROECUATORIANO`
- `NEGRO`
- `MULATO`
- `MONTUVIO`
- `MESTIZO`
- `BLANCO`
- `OTRO`
- `NO_REGISTRA`

### puebloNacionalidad
- Solo requerido si `etnia = "INDIGENA"`
- Valores: `KICHWA`, `CHACHI`, `ACHUAR`, `SECOYA`, `SHIWIAR`, `SHUAR`, `WAORANI`, `MANTA`, `PALTA`, `CHIBULEO`, `KARANKI`, `KAYAMPI`, `KISAPINCHA`, `KITU_KARA`, `NATABUELA`, `OTAVALO`, `PANZALEO`, `SALASACA`, `SARAGURO`, `TOMABELA`, `WARANKA`, `QUIJOS`, `PASTO`, `NO_APLICA`

### tipoSangre
- `A_POSITIVO`
- `A_NEGATIVO`
- `B_POSITIVO`
- `B_NEGATIVO`
- `AB_POSITIVO`
- `AB_NEGATIVO`
- `O_POSITIVO`
- `O_NEGATIVO`
- `NO_REGISTRA`

### discapacidad
- `SI`
- `NO`

### tipoDiscapacidad
- `FISICA`
- `INTELECTUAL`
- `AUDITIVA`
- `VISUAL`
- `PSICOSOCIAL`
- `OTRA`
- `NO_APLICA`

### tipoMatricula
- `ORDINARIA`
- `EXTRAORDINARIA`
- `ESPECIAL`

### nivelAcademico
- `PRIMERO`
- `SEGUNDO`
- `TERCERO`
- `CUARTO`
- `QUINTO`
- `SEXTO`

### paralelo
- `A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`, `Q`, `R`, `S`, `T`

### estudianteOcupacion
- `SOLO_ESTUDIA`
- `TRABAJA_Y_ESTUDIA`

### ingresosEstudiante
- `FINANCIAR_ESTUDIOS`
- `PARA_MANTENER_HOGAR`
- `GASTOS_PERSONALES`
- `NO_APLICA`

### tipoBeca
- `TOTAL`
- `PARCIAL`
- `NO_APLICA`

## Campos Opcionales

- `financiamientoBeca`: Solo se envía si tiene valor
- `tipoAlcanceProyectoVinculacion`: Solo se envía si tiene valor
- `provinciaNacimientoId`: Solo se envía si `paisNacionalidadId = "ECUADOR"`

## Notas Importantes

1. **Todos los campos enum deben usar valores de enum en MAYÚSCULAS con guiones bajos** (ej: `A_POSITIVO`, `NO_APLICA`)

2. **Los campos numéricos** (`duracionPeriodoAcademico`, `cantidadMiembrosHogar`, `periodoAcademicoId`) deben ser números, no strings

3. **Los campos de texto** pueden contener `"NA"` cuando no aplican

4. **Las fechas** deben estar en formato `YYYY-MM-DD` (ej: `"2020-09-01"`)

5. **provinciaNacimientoId** es opcional y solo se envía si el país de nacionalidad es Ecuador

6. **puebloNacionalidad** debe ser `"NO_APLICA"` si la etnia no es `"INDIGENA"`, y un valor específico si es `"INDIGENA"`

