# Guía para el Frontend de Administración - Generación de Documentos

## 📋 Resumen Ejecutivo

Este documento contiene toda la información necesaria para que el equipo del **Frontend de Administración** pueda generar correctamente los documentos **FICHA ESTUDIANTIL** y **FICHA SOCIOECONÓMICA** a partir de los datos enviados por el formulario de inscripción.

---

## 🔄 Cambios en la Estructura de Datos del Backend

### **Relaciones Completas en lugar de Solo IDs**

El backend ahora devuelve **objetos completos con relaciones** en lugar de solo UUIDs. Esto significa que ahora recibirás los **nombres** de países, provincias, cantones, etc., directamente en la respuesta.

#### Ejemplo de Estructura:

```json
{
  "paisNacionalidadId": "b4f3b735-59e0-40c4-a29f-62194b3c2117",
  "Pais_Estudiante_paisNacionalidadIdToPais": {
    "id": "b4f3b735-59e0-40c4-a29f-62194b3c2117",
    "nombre": "Ecuador",
    "codigo": 1
  },
  "provinciaNacimientoId": "6632ad87-48ba-4be9-a2cf-df33cebb41cf",
  "Provincia_Estudiante_provinciaNacimientoIdToProvincia": {
    "id": "6632ad87-48ba-4be9-a2cf-df33cebb41cf",
    "nombre": "Pichincha",
    "codigo": 17
  },
  "cantonNacimientoId": "185ccca9-9572-4d32-b6e5-e798ec89546c",
  "Canton_Estudiante_cantonNacimientoIdToCanton": {
    "id": "185ccca9-9572-4d32-b6e5-e798ec89546c",
    "nombre": "Quito",
    "codigo": 1701
  }
}
```

---

## 📝 Cómo Acceder a los Nombres de Lugares

### **❌ Incorrecto (No usar UUIDs directamente):**
```typescript
// NO hacer esto
const lugarNacimiento = estudiante.paisNacionalidadId + ', ' + 
                        estudiante.provinciaNacimientoId + ', ' + 
                        estudiante.cantonNacimientoId;
```

### **✅ Correcto (Usar nombres de relaciones):**
```typescript
// Función helper para lugar de nacimiento
function getLugarNacimientoCompleto(estudiante: any): string {
  const partes = [
    estudiante.Pais_Estudiante_paisNacionalidadIdToPais?.nombre || 'N/A',
    estudiante.Provincia_Estudiante_provinciaNacimientoIdToProvincia?.nombre || 'N/A',
    estudiante.Canton_Estudiante_cantonNacimientoIdToCanton?.nombre || 'N/A'
  ].filter(n => n !== 'N/A');
  return partes.join(', ');
}

// Función helper para lugar de procedencia (residencia)
function getLugarProcedenciaCompleto(estudiante: any): string {
  const partes = [
    estudiante.Pais_Estudiante_paisResidenciaIdToPais?.nombre || 'N/A',
    estudiante.Provincia_Estudiante_provinciaResidenciaIdToProvincia?.nombre || 'N/A',
    estudiante.Canton_Estudiante_cantonResidenciaIdToCanton?.nombre || 'N/A',
    estudiante.parroquiaProcedencia || null
  ].filter(n => n && n !== 'N/A' && n !== 'NA');
  return partes.join(', ');
}

// Funciones individuales si las necesitas
function getPaisNacionalidadNombre(estudiante: any): string {
  return estudiante?.Pais_Estudiante_paisNacionalidadIdToPais?.nombre || 'N/A';
}

function getProvinciaNacimientoNombre(estudiante: any): string {
  return estudiante?.Provincia_Estudiante_provinciaNacimientoIdToProvincia?.nombre || 'N/A';
}

function getCantonNacimientoNombre(estudiante: any): string {
  return estudiante?.Canton_Estudiante_cantonNacimientoIdToCanton?.nombre || 'N/A';
}
```

### **Relaciones Disponibles:**

| Campo | Relación | Acceso |
|-------|----------|--------|
| País de Nacionalidad | `Pais_Estudiante_paisNacionalidadIdToPais` | `estudiante.Pais_Estudiante_paisNacionalidadIdToPais?.nombre` |
| País de Residencia | `Pais_Estudiante_paisResidenciaIdToPais` | `estudiante.Pais_Estudiante_paisResidenciaIdToPais?.nombre` |
| Provincia de Nacimiento | `Provincia_Estudiante_provinciaNacimientoIdToProvincia` | `estudiante.Provincia_Estudiante_provinciaNacimientoIdToProvincia?.nombre` |
| Provincia de Residencia | `Provincia_Estudiante_provinciaResidenciaIdToProvincia` | `estudiante.Provincia_Estudiante_provinciaResidenciaIdToProvincia?.nombre` |
| Cantón de Nacimiento | `Canton_Estudiante_cantonNacimientoIdToCanton` | `estudiante.Canton_Estudiante_cantonNacimientoIdToCanton?.nombre` |
| Cantón de Residencia | `Canton_Estudiante_cantonResidenciaIdToCanton` | `estudiante.Canton_Estudiante_cantonResidenciaIdToCanton?.nombre` |
| Parroquia de Procedencia | `parroquiaProcedencia` | `estudiante.parroquiaProcedencia` (string directo) |

---

## 🆕 Campos Nuevos Agregados al Formulario

### **1. Información Académica - Financiamiento**

Estos campos son **checkboxes** que deben aparecer en la FICHA SOCIOECONÓMICA con marcas 'X':

- `financiamientoFondosPropios` (boolean)
- `financiamientoAyudaPadres` (boolean)
- `financiamientoTarjetaCredito` (boolean)
- `financiamientoEntidadFinanciera` (boolean)
- `financiamientoTercerasPersonas` (boolean)
- `financiamientoQuienes` (string) - Solo aparece si `financiamientoTercerasPersonas` es `true`

**Ejemplo de uso:**
```typescript
// En FICHA SOCIOECONÓMICA, marcar con 'X' los que sean true
if (estudiante.financiamientoFondosPropios) {
  // Marcar checkbox "Fondos propios" con 'X'
}
if (estudiante.financiamientoAyudaPadres) {
  // Marcar checkbox "Ayuda de sus padres" con 'X'
}
// ... etc
if (estudiante.financiamientoTercerasPersonas && estudiante.financiamientoQuienes) {
  // Marcar checkbox "Ayuda a terceras personas" con 'X'
  // Y mostrar el texto: estudiante.financiamientoQuienes
}
```

### **2. Información Económica - Trabajo**

- `trabajoEspecifique` (string) - Solo aparece si `estudianteocupacionId` es 'SI'

**Ejemplo de uso:**
```typescript
if (estudiante.estudianteocupacionId === 'SI' && estudiante.trabajoEspecifique) {
  // Mostrar: "Si es así especifique: [estudiante.trabajoEspecifique]"
}
```

### **3. Nacionalidad y Residencia**

- `parroquiaProcedencia` (string) - Parroquia de procedencia del estudiante

**Ejemplo de uso:**
```typescript
// Ya incluido en getLugarProcedenciaCompleto()
const lugarProcedencia = getLugarProcedenciaCompleto(estudiante);
// Resultado: "Ecuador, Pichincha, Quito, Parroquia X"
```

### **4. Datos del Hogar - Dinámica Familiar**

- `dinamicaFamiliar` (string) - Texto libre sobre la dinámica familiar
- `violenciaFamiliar` (string) - "SI" o "NO"
- `tipoViolenciaFamiliar` (string) - Puede contener múltiples valores separados por comas, ej: "Física, Psicológica"
- `estudianteCabezaFamiliar` (string) - "SI" o "NO"

**Ejemplo de uso:**
```typescript
// Dinámica familiar
if (estudiante.dinamicaFamiliar && estudiante.dinamicaFamiliar !== 'NA') {
  // Mostrar texto completo
}

// Violencia familiar
if (estudiante.violenciaFamiliar === 'SI') {
  // Marcar checkbox "SI" con 'X'
  // Si hay tipoViolenciaFamiliar, mostrar los tipos
  if (estudiante.tipoViolenciaFamiliar) {
    const tipos = estudiante.tipoViolenciaFamiliar.split(',').map(t => t.trim());
    // Marcar checkboxes correspondientes con 'X'
  }
} else {
  // Marcar checkbox "NO" con 'X'
}

// Estudiante cabeza de familia
if (estudiante.estudianteCabezaFamiliar === 'SI') {
  // Marcar checkbox "SI" con 'X'
} else {
  // Marcar checkbox "NO" con 'X'
}
```

### **5. Datos del Hogar - Salud Familiar**

- `familiaDiscapacidadEnfermedadCatastrofica` (string) - "SI" o "NO"
- `familiaProblemaSalud` (string) - Solo aparece si `familiaDiscapacidadEnfermedadCatastrofica` es 'SI'
- `familiaParentesco` (string) - Solo aparece si `familiaDiscapacidadEnfermedadCatastrofica` es 'SI'
- `familiaServiciosMedicos` (string) - "SI" o "NO"
- `familiaServiciosMedicosDetalle` (string) - Puede contener: "IEES, Seguro Privado, Seguro Campesino, Otro: [texto]"

**Ejemplo de uso:**
```typescript
// Discapacidad o enfermedad catastrófica
if (estudiante.familiaDiscapacidadEnfermedadCatastrofica === 'SI') {
  // Marcar checkbox "SI" con 'X'
  if (estudiante.familiaProblemaSalud) {
    // Mostrar: estudiante.familiaProblemaSalud
  }
  if (estudiante.familiaParentesco) {
    // Mostrar: estudiante.familiaParentesco
  }
} else {
  // Marcar checkbox "NO" con 'X'
}

// Servicios médicos
if (estudiante.familiaServiciosMedicos === 'SI') {
  // Marcar checkbox "SI" con 'X'
  if (estudiante.familiaServiciosMedicosDetalle) {
    const detalle = estudiante.familiaServiciosMedicosDetalle;
    // Parsear y marcar checkboxes
    if (detalle.includes('IEES')) {
      // Marcar checkbox "IEES" con 'X'
    }
    if (detalle.includes('Seguro Privado')) {
      // Marcar checkbox "Seguro Privado" con 'X'
    }
    if (detalle.includes('Seguro Campesino')) {
      // Marcar checkbox "Seguro Campesino" con 'X'
    }
    // Extraer "Otro: [texto]"
    const match = detalle.match(/Otro:\s*(.+)/i);
    if (match) {
      // Marcar checkbox "Otro" con 'X'
      // Mostrar texto: match[1]
    }
  }
} else {
  // Marcar checkbox "NO" con 'X'
}
```

### **6. Datos del Hogar - Egresos Familiares**

Estos campos son **números** que representan gastos mensuales:

- `egresoVivienda` (number/string)
- `egresoAlimentacion` (number/string)
- `egresoEducacion` (number/string)
- `egresoIndumentaria` (number/string)
- `egresoTransporte` (number/string)
- `egresoSalud` (number/string)
- `egresoServiciosBasicos` (number/string)
- `egresoOtros` (number/string)
- `totalEgresos` (number) - **Campo calculado** (suma de todos los egresos)

**Ejemplo de uso:**
```typescript
// Mostrar en tabla de egresos
const egresos = [
  { concepto: 'Vivienda', monto: estudiante.egresoVivienda || 0 },
  { concepto: 'Alimentación', monto: estudiante.egresoAlimentacion || 0 },
  { concepto: 'Educación', monto: estudiante.egresoEducacion || 0 },
  { concepto: 'Indumentaria', monto: estudiante.egresoIndumentaria || 0 },
  { concepto: 'Transporte', monto: estudiante.egresoTransporte || 0 },
  { concepto: 'Salud', monto: estudiante.egresoSalud || 0 },
  { concepto: 'Servicios Básicos', monto: estudiante.egresoServiciosBasicos || 0 },
  { concepto: 'Otros', monto: estudiante.egresoOtros || 0 }
];

// Total (ya viene calculado del backend)
const total = estudiante.totalEgresos || 0;
```

---

## 👨‍👩‍👧‍👦 Composición Familiar

El backend devuelve estos datos en el array `ComposicionFamiliar` (con mayúscula).

### **Estructura:**
```json
{
  "ComposicionFamiliar": [
    {
      "id": 1,
      "nombresApellidos": "Juan Pérez",
      "fechaNacimiento": "1980-01-15",
      "cedulaIdentidad": "1234567890",
      "estadoCivil": "Casado",
      "parentesco": "Padre",
      "nivelEstudios": "Superior",
      "titulo": "Ingeniero",
      "laborOcupacion": "Ingeniero de Software"
    },
    {
      "id": 2,
      "nombresApellidos": "María Pérez",
      "fechaNacimiento": "1982-03-20",
      "cedulaIdentidad": "0987654321",
      "estadoCivil": "Casada",
      "parentesco": "Madre",
      "nivelEstudios": "Superior",
      "titulo": "Licenciada",
      "laborOcupacion": "Profesora"
    }
  ]
}
```

### **Ejemplo de uso:**
```typescript
// Iterar sobre la composición familiar
if (estudiante.ComposicionFamiliar && estudiante.ComposicionFamiliar.length > 0) {
  estudiante.ComposicionFamiliar.forEach((familiar, index) => {
    // Crear fila en tabla con:
    // familiar.nombresApellidos
    // familiar.fechaNacimiento
    // familiar.cedulaIdentidad
    // familiar.estadoCivil
    // familiar.parentesco
    // familiar.nivelEstudios
    // familiar.titulo
    // familiar.laborOcupacion
  });
} else {
  // Mostrar mensaje: "No hay datos de composición familiar"
}
```

---

## 💰 Ingresos Familiares

El backend devuelve estos datos en el array `IngresoFamiliar` (con mayúscula y singular).

### **Estructura:**
```json
{
  "IngresoFamiliar": [
    {
      "id": 1,
      "nombresApellidos": "Juan Pérez",
      "parentesco": "Padre",
      "actividadLaboral": "Ingeniero de Software",
      "ingresoMensual": "2000",
      "ingresosExtras": "500",
      "total": "2500"
    },
    {
      "id": 2,
      "nombresApellidos": "María Pérez",
      "parentesco": "Madre",
      "actividadLaboral": "Profesora",
      "ingresoMensual": "1500",
      "ingresosExtras": "0",
      "total": "1500"
    }
  ]
}
```

### **Ejemplo de uso:**
```typescript
// Iterar sobre los ingresos familiares
if (estudiante.IngresoFamiliar && estudiante.IngresoFamiliar.length > 0) {
  estudiante.IngresoFamiliar.forEach((ingreso, index) => {
    // Crear fila en tabla con:
    // ingreso.nombresApellidos
    // ingreso.parentesco
    // ingreso.actividadLaboral
    // ingreso.ingresoMensual
    // ingreso.ingresosExtras
    // ingreso.total
  });
  
  // Calcular total de ingresos familiares
  const totalIngresos = estudiante.IngresoFamiliar.reduce((sum, ing) => {
    return sum + (parseFloat(ing.total) || 0);
  }, 0);
} else {
  // Mostrar mensaje: "No hay datos de ingresos familiares"
}
```

---

## 📄 Título de Bachiller y Croquis de Vivienda

### **Título de Bachiller** 🔗

**IMPORTANTE:** Debe mostrarse como un **link clickeable**, NO como imagen.

```typescript
// Verificar si existe
if (estudiante.tituloBachiller && estudiante.tituloBachiller !== 'NA') {
  // Mostrar como link
  const link = estudiante.tituloBachiller;
  // En HTML: <a href="${link}" target="_blank">Ver Título de Bachiller</a>
  // En Word/PDF: Agregar hipervínculo al documento
} else {
  // Mostrar: "No disponible"
}
```

### **Croquis de Vivienda** 🖼️

**IMPORTANTE:** Debe mostrarse como una **imagen**, NO como link.

```typescript
// Verificar si existe
if (estudiante.croquisViviendaUrl && estudiante.croquisViviendaUrl !== 'NA') {
  // Mostrar como imagen
  const imagenUrl = estudiante.croquisViviendaUrl;
  // En HTML: <img src="${imagenUrl}" alt="Croquis de Vivienda" />
  // En Word/PDF: Agregar imagen al documento
} else {
  // Mostrar: "No disponible"
}
```

---

## ⚠️ Manejo de Valores Especiales

### **Valores 'NA' y 'No aplica'**

Muchos campos pueden tener el valor `'NA'` o `'No aplica'`. Siempre verificar antes de mostrar:

```typescript
function getValueOrNA(value: any): string {
  if (!value || value === 'NA' || value === 'No aplica' || value === 'NULL' || value === 'UNDEFINED') {
    return 'No disponible';
  }
  return String(value);
}

// Uso
const nombre = getValueOrNA(estudiante.primerNombre);
```

### **Validación de null/undefined**

Siempre usar el operador de encadenamiento opcional (`?.`) porque las relaciones pueden ser `null`:

```typescript
// ✅ Correcto
const pais = estudiante.Pais_Estudiante_paisNacionalidadIdToPais?.nombre || 'N/A';

// ❌ Incorrecto (puede causar error)
const pais = estudiante.Pais_Estudiante_paisNacionalidadIdToPais.nombre;
```

---

## 📋 Checklist de Verificación

Antes de considerar completada la implementación, verificar:

### **FICHA ESTUDIANTIL:**
- [ ] Los nombres de lugares (país, provincia, cantón) se muestran correctamente (no UUIDs)
- [ ] El título de bachiller se muestra como link clickeable (no imagen)
- [ ] Todos los campos básicos se muestran correctamente
- [ ] Los campos con valor 'NA' se manejan apropiadamente

### **FICHA SOCIOECONÓMICA:**
- [ ] Los nombres de lugares se muestran correctamente (no UUIDs)
- [ ] Los checkboxes de financiamiento se marcan con 'X' según los valores booleanos
- [ ] El campo `trabajoEspecifique` aparece cuando corresponde
- [ ] La tabla de **Composición Familiar** se muestra completa
- [ ] La tabla de **Ingresos Familiares** se muestra completa
- [ ] La tabla de **Egresos Familiares** se muestra completa con total calculado
- [ ] Los checkboxes de servicios médicos se marcan correctamente desde `familiaServiciosMedicosDetalle`
- [ ] Los campos de dinámica familiar y violencia familiar se muestran correctamente
- [ ] El croquis de vivienda se muestra como imagen (no link)
- [ ] Todos los campos con valor 'NA' se manejan apropiadamente

### **Datos Relacionales:**
- [ ] `ComposicionFamiliar` se itera correctamente (array con mayúscula)
- [ ] `IngresoFamiliar` se itera correctamente (array con mayúscula y singular)
- [ ] Las relaciones de países, provincias y cantones se acceden correctamente

---

## 🔍 Endpoints del Backend

Los siguientes endpoints devuelven las relaciones completas:

- `GET /estudiantes` - Lista todos los estudiantes con relaciones
- `GET /estudiantes/:id` - Obtiene un estudiante con relaciones
- `GET /estudiantes/buscar?tipoDocumento=...&numeroIdentificacion=...` - Busca estudiante con relaciones

---

## 📞 Soporte

Si tienen dudas sobre:
- La estructura de datos: consultar el endpoint `/estudiantes/enums` para ver los valores posibles de los enums
- Las relaciones: consultar la documentación de Prisma del backend
- Campos específicos: contactar al equipo del formulario de inscripción

---

## 📝 Notas Finales

1. **Formato de Documentos:**
   - **FICHA ESTUDIANTIL:** Se llena con **texto** (valores del formulario)
   - **FICHA SOCIOECONÓMICA:** Se llena con **marcas 'X'** en checkboxes según los valores del formulario

2. **Campos Calculados:**
   - `totalEgresos` ya viene calculado del backend
   - `ingresoTotalHogar` puede calcularse sumando todos los `total` de `IngresoFamiliar`

3. **Arrays:**
   - `ComposicionFamiliar` (con mayúscula)
   - `IngresoFamiliar` (con mayúscula y singular, no plural)

---

**Fecha de actualización:** 8 de marzo de 2026  
**Versión del backend:** Actualizada con relaciones completas  
**Formulario de inscripción:** Actualizado con todos los campos nuevos
