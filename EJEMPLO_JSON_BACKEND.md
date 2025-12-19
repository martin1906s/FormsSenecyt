# Ejemplo de JSON Final para Backend

Este documento muestra un ejemplo del JSON que se envía al backend cuando el formulario es válido.

## Método de obtención

El método `getFormDataForBackend()` en el componente `StudentForm` procesa los datos del formulario y los convierte al formato adecuado para el backend.

## Ejemplo de JSON Completo

```json
{
  "tipoDocumentoId": 1,
  "numeroIdentificacion": "1234567890",
  "primerApellido": "GARCIA",
  "segundoApellido": "LOPEZ",
  "primerNombre": "JUAN",
  "segundoNombre": "CARLOS",
  "sexoId": 1,
  "generoId": 1,
  "estadocivilId": 1,
  "etniaId": 1,
  "pueblonacionalidadId": 5,
  "tipoSangre": "O+",
  "discapacidad": 1,
  "porcentajeDiscapacidad": "45",
  "numCarnetConadis": "1234567",
  "tipoDiscapacidad": 2,
  "fechaNacimiento": "1995-05-15",
  "paisNacionalidadId": "EC",
  "provinciaNacimientoId": "17",
  "cantonNacimientoId": "1701",
  "paisResidenciaId": "EC",
  "provinciaResidenciaId": "17",
  "cantonResidenciaId": "1701",
  "tipoColegioId": 1,
  "modalidadCarrera": 1,
  "jornadaCarrera": 1,
  "fechaInicioCarrera": "2020-09-01",
  "fechaMatricula": "2020-08-15",
  "tipoMatriculaId": 1,
  "nivelAcademicoQueCursa": 3,
  "duracionPeriodoAcademico": 6,
  "haRepetidoAlMenosUnaMateria": 2,
  "paraleloId": 1,
  "haPerdidoLaGratuidad": 2,
  "recibePensionDiferenciada": 1,
  "estudianteocupacionId": 1,
  "ingresosestudianteId": 2,
  "bonodesarrolloId": 1,
  "haRealizadoPracticasPreprofesionales": 1,
  "nroHorasPracticasPreprofesionalesPorPeriodo": "120",
  "entornoInstitucionalPracticasProfesionales": 1,
  "sectorEconomicoPracticaProfesional": 5,
  "tipoBecaId": 1,
  "primeraRazonBecaId": 1,
  "segundaRazonBecaId": 1234,
  "terceraRazonBecaId": 2,
  "cuartaRazonBecaId": 1,
  "quintaRazonBecaId": "RAZON123",
  "sextaRazonBecaId": 1,
  "montoBeca": "5000",
  "porcientoBecaCoberturaArancel": "100",
  "porcientoBecaCoberturaManuntencion": "50",
  "financiamientoBeca": 1,
  "montoAyudaEconomica": "NA",
  "montoCreditoEducativo": "NA",
  "participaEnProyectoVinculacionSociedad": 1,
  "tipoAlcanceProyectoVinculacionId": 2,
  "correoElectronico": "juan.garcia@email.com",
  "numeroCelular": "0987654321",
  "nivelFormacionPadre": 3,
  "nivelFormacionMadre": 3,
  "ingresoTotalHogar": "1500",
  "cantidadMiembrosHogar": 4
}
```

## Ejemplo con Valores "NA" y "No aplica"

```json
{
  "tipoDocumentoId": 1,
  "numeroIdentificacion": "1234567890",
  "primerApellido": "GARCIA",
  "segundoApellido": "NA",
  "primerNombre": "MARIA",
  "segundoNombre": "NA",
  "sexoId": 2,
  "generoId": 2,
  "estadocivilId": 1,
  "etniaId": 2,
  "pueblonacionalidadId": "NA",
  "tipoSangre": "A+",
  "discapacidad": 2,
  "porcentajeDiscapacidad": "NA",
  "numCarnetConadis": "NA",
  "tipoDiscapacidad": 7,
  "fechaNacimiento": "1998-03-20",
  "paisNacionalidadId": "EC",
  "provinciaNacimientoId": "NA",
  "cantonNacimientoId": "NA",
  "paisResidenciaId": "EC",
  "provinciaResidenciaId": "17",
  "cantonResidenciaId": "1701",
  "tipoColegioId": 2,
  "modalidadCarrera": 1,
  "jornadaCarrera": 2,
  "fechaInicioCarrera": "2021-09-01",
  "fechaMatricula": "2021-08-20",
  "tipoMatriculaId": 1,
  "nivelAcademicoQueCursa": 2,
  "duracionPeriodoAcademico": 6,
  "haRepetidoAlMenosUnaMateria": 2,
  "paraleloId": 2,
  "haPerdidoLaGratuidad": 2,
  "recibePensionDiferenciada": 2,
  "estudianteocupacionId": 2,
  "ingresosestudianteId": 1,
  "bonodesarrolloId": 2,
  "haRealizadoPracticasPreprofesionales": 2,
  "nroHorasPracticasPreprofesionalesPorPeriodo": "NA",
  "entornoInstitucionalPracticasProfesionales": 5,
  "sectorEconomicoPracticaProfesional": 22,
  "tipoBecaId": 5,
  "primeraRazonBecaId": "No aplica",
  "segundaRazonBecaId": "No aplica",
  "terceraRazonBecaId": "No aplica",
  "cuartaRazonBecaId": "No aplica",
  "quintaRazonBecaId": "No aplica",
  "sextaRazonBecaId": "No aplica",
  "montoBeca": "NA",
  "porcientoBecaCoberturaArancel": "NA",
  "porcientoBecaCoberturaManuntencion": "NA",
  "financiamientoBeca": null,
  "montoAyudaEconomica": "NA",
  "montoCreditoEducativo": "NA",
  "participaEnProyectoVinculacionSociedad": 2,
  "tipoAlcanceProyectoVinculacionId": null,
  "correoElectronico": "NA",
  "numeroCelular": "0987654321",
  "nivelFormacionPadre": 2,
  "nivelFormacionMadre": 2,
  "ingresoTotalHogar": "NA",
  "cantidadMiembrosHogar": 3
}
```

## Notas Importantes

1. **Campos numéricos**: Se convierten a números cuando tienen valor
2. **Campos de texto**: Se mantienen como strings, incluyendo "NA" y "No aplica"
3. **Campos opcionales**: Si están vacíos, no se incluyen en el JSON
4. **Valores automáticos**: Cuando `tipoBecaId = 5` o `discapacidad = 2`, los valores se establecen automáticamente
5. **Validaciones**: Todos los campos pasan las validaciones estrictas antes de ser enviados

## Uso en el Componente

```typescript
onSubmit(): void {
  if (this.studentForm.valid) {
    const formData = this.getFormDataForBackend();
    // Enviar al backend
    // this.studentService.saveStudent(formData).subscribe(...)
  }
}
```

