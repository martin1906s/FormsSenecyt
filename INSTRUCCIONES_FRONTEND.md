# Instrucciones para el Equipo de Frontend

## 📋 Resumen de Cambios en el Backend

El backend ha sido actualizado para devolver **objetos completos con relaciones** en lugar de solo IDs. Esto significa que ahora recibirás los nombres de países, provincias, cantones, etc., en lugar de solo UUIDs.

---

## 🔧 Cambios Necesarios en el Frontend

### 1. **Lugar de Nacimiento y Procedencia** ✅

**Problema anterior:** Se mostraban UUIDs como `b4f3b735-59e0-40c4-a29f-62194b3c2117`

**Solución:** El backend ahora devuelve objetos completos. Debes usar las propiedades `nombre` de las relaciones.

#### Estructura de datos que ahora recibes:

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
    "codigo": 17,
    "paisId": "b4f3b735-59e0-40c4-a29f-62194b3c2117"
  },
  "cantonNacimientoId": "185ccca9-9572-4d32-b6e5-e798ec89546c",
  "Canton_Estudiante_cantonNacimientoIdToCanton": {
    "id": "185ccca9-9572-4d32-b6e5-e798ec89546c",
    "nombre": "Quito",
    "codigo": 1701,
    "provinciaId": "6632ad87-48ba-4be9-a2cf-df33cebb41cf"
  }
}
```

#### Cómo mostrar el lugar de nacimiento:

**❌ Antes (incorrecto):**
```typescript
// Mostraba el UUID directamente
const lugarNacimiento = estudiante.paisNacionalidadId + ', ' + 
                        estudiante.provinciaNacimientoId + ', ' + 
                        estudiante.cantonNacimientoId;
```

**✅ Ahora (correcto):**
```typescript
// Usar los nombres de las relaciones
const lugarNacimiento = [
  estudiante.Pais_Estudiante_paisNacionalidadIdToPais?.nombre || 'N/A',
  estudiante.Provincia_Estudiante_provinciaNacimientoIdToProvincia?.nombre || 'N/A',
  estudiante.Canton_Estudiante_cantonNacimientoIdToCanton?.nombre || 'N/A'
].filter(n => n !== 'N/A').join(', ');

// O para lugar de procedencia (residencia):
const lugarProcedencia = [
  estudiante.Pais_Estudiante_paisResidenciaIdToPais?.nombre || 'N/A',
  estudiante.Provincia_Estudiante_provinciaResidenciaIdToProvincia?.nombre || 'N/A',
  estudiante.Canton_Estudiante_cantonResidenciaIdToCanton?.nombre || 'N/A',
  estudiante.parroquiaProcedencia || null
].filter(n => n && n !== 'N/A').join(', ');
```

#### Relaciones disponibles:

- **País de Nacionalidad:** `estudiante.Pais_Estudiante_paisNacionalidadIdToPais?.nombre`
- **País de Residencia:** `estudiante.Pais_Estudiante_paisResidenciaIdToPais?.nombre`
- **Provincia de Nacimiento:** `estudiante.Provincia_Estudiante_provinciaNacimientoIdToProvincia?.nombre`
- **Provincia de Residencia:** `estudiante.Provincia_Estudiante_provinciaResidenciaIdToProvincia?.nombre`
- **Cantón de Nacimiento:** `estudiante.Canton_Estudiante_cantonNacimientoIdToCanton?.nombre`
- **Cantón de Residencia:** `estudiante.Canton_Estudiante_cantonResidenciaIdToCanton?.nombre`
- **Parroquia de Procedencia:** `estudiante.parroquiaProcedencia` (string directo)

---

### 2. **Título de Bachiller** 🔗

**Problema:** Se muestra la imagen directamente en el documento.

**Solución:** Debe mostrarse como un **link clickeable**, no como imagen.

#### Cómo implementar:

**❌ Antes (incorrecto):**
```html
<!-- No mostrar así -->
<img [src]="estudiante.tituloBachiller" alt="Título de Bachiller" />
```

**✅ Ahora (correcto):**
```html
<!-- Mostrar como link -->
<a [href]="estudiante.tituloBachiller" 
   target="_blank" 
   rel="noopener noreferrer"
   *ngIf="estudiante.tituloBachiller && estudiante.tituloBachiller !== 'NA'">
  Ver Título de Bachiller
</a>
<span *ngIf="!estudiante.tituloBachiller || estudiante.tituloBachiller === 'NA'">
  No disponible
</span>
```

**O en TypeScript para documentos:**
```typescript
// Para documentos Word/PDF
const tituloBachillerLink = estudiante.tituloBachiller && 
                           estudiante.tituloBachiller !== 'NA' 
  ? `Link: ${estudiante.tituloBachiller}` 
  : 'No disponible';
```

---

### 3. **Croquis de Vivienda** 🖼️

**Problema:** No se muestra la imagen del croquis.

**Solución:** Debe mostrarse la imagen directamente.

#### Cómo implementar:

**✅ Correcto:**
```html
<!-- Mostrar la imagen del croquis -->
<img [src]="estudiante.croquisViviendaUrl" 
     alt="Croquis de Vivienda"
     *ngIf="estudiante.croquisViviendaUrl && estudiante.croquisViviendaUrl !== 'NA'"
     style="max-width: 100%; height: auto;" />
<span *ngIf="!estudiante.croquisViviendaUrl || estudiante.croquisViviendaUrl === 'NA'">
  No disponible
</span>
```

**Para documentos Word/PDF:**
```typescript
// Incluir la imagen en el documento
if (estudiante.croquisViviendaUrl && estudiante.croquisViviendaUrl !== 'NA') {
  // Agregar imagen al documento
  document.addImage(estudiante.croquisViviendaUrl, 'Croquis de Vivienda');
}
```

---

### 4. **Composición Familiar** 👨‍👩‍👧‍👦

**Estado:** El backend ya devuelve estos datos correctamente.

**Estructura de datos:**
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
    }
  ]
}
```

**Verificación:** Asegúrate de que el frontend esté iterando sobre `estudiante.ComposicionFamiliar` correctamente:

```typescript
// Ejemplo de uso
estudiante.ComposicionFamiliar?.forEach(familiar => {
  console.log(familiar.nombresApellidos);
  console.log(familiar.parentesco);
  // ... resto de campos
});
```

---

### 5. **Ingresos Familiares** 💰

**Problema:** Aparece vacío en el documento.

**Estado:** El backend ya devuelve estos datos correctamente.

**Estructura de datos:**
```json
{
  "IngresoFamiliar": [
    {
      "id": 1,
      "nombresApellidos": "Juan Pérez",
      "parentesco": "Padre",
      "actividadLaboral": "Ingeniero",
      "ingresoMensual": "2000",
      "ingresosExtras": "500",
      "total": "2500"
    }
  ]
}
```

**Verificación:** Asegúrate de que el frontend esté iterando sobre `estudiante.IngresoFamiliar` correctamente:

```typescript
// Ejemplo de uso
estudiante.IngresoFamiliar?.forEach(ingreso => {
  console.log(ingreso.nombresApellidos);
  console.log(ingreso.ingresoMensual);
  console.log(ingreso.total);
  // ... resto de campos
});
```

**Para la tabla de ingresos:**
```html
<table>
  <thead>
    <tr>
      <th>Nombres y Apellidos</th>
      <th>Parentesco</th>
      <th>Actividad Laboral</th>
      <th>Ingreso Mensual</th>
      <th>Ingresos Extras</th>
      <th>Total</th>
    </tr>
  </thead>
  <tbody>
    <tr *ngFor="let ingreso of estudiante.IngresoFamiliar">
      <td>{{ ingreso.nombresApellidos }}</td>
      <td>{{ ingreso.parentesco }}</td>
      <td>{{ ingreso.actividadLaboral }}</td>
      <td>{{ ingreso.ingresoMensual }}</td>
      <td>{{ ingreso.ingresosExtras }}</td>
      <td>{{ ingreso.total }}</td>
    </tr>
  </tbody>
</table>
```

---

## 📝 Checklist de Cambios

- [ ] Actualizar renderizado de **lugar de nacimiento** para usar nombres de relaciones
- [ ] Actualizar renderizado de **lugar de procedencia** para usar nombres de relaciones
- [ ] Cambiar **título de bachiller** de imagen a link clickeable
- [ ] Verificar que **croquis de vivienda** muestre la imagen correctamente
- [ ] Verificar que **composición familiar** se muestre correctamente en tablas/documentos
- [ ] Verificar que **ingresos familiares** se muestre correctamente en tablas/documentos
- [ ] Probar con datos reales del backend
- [ ] Verificar que los documentos generados (Word/PDF) muestren correctamente todos los datos

---

## 🔍 Endpoints Afectados

Los siguientes endpoints ahora devuelven las relaciones completas:

- `GET /estudiantes` - Lista todos los estudiantes con relaciones
- `GET /estudiantes/:id` - Obtiene un estudiante con relaciones
- `GET /estudiantes/buscar?tipoDocumento=...&numeroIdentificacion=...` - Busca estudiante con relaciones

---

## ⚠️ Notas Importantes

1. **Validación de null/undefined:** Siempre usar el operador de encadenamiento opcional (`?.`) porque las relaciones pueden ser `null` si no están configuradas.

2. **Valores por defecto:** Muchos campos tienen `'NA'` como valor por defecto. Verificar antes de mostrar:
   ```typescript
   const valor = estudiante.campo && estudiante.campo !== 'NA' ? estudiante.campo : 'No disponible';
   ```

3. **Nombres de relaciones:** Los nombres de las relaciones en Prisma son largos. Considera crear funciones helper para acceder a ellos:
   ```typescript
   getPaisNacimiento(estudiante: Estudiante): string {
     return estudiante.Pais_Estudiante_paisNacionalidadIdToPais?.nombre || 'N/A';
   }
   ```

---

## 🧪 Pruebas Recomendadas

1. Probar con un estudiante que tenga todos los datos completos
2. Probar con un estudiante que tenga algunos campos vacíos o 'NA'
3. Verificar que los documentos generados muestren correctamente:
   - Nombres de lugares (no UUIDs)
   - Link del título de bachiller (no imagen)
   - Imagen del croquis
   - Tabla de composición familiar completa
   - Tabla de ingresos familiares completa

---

## 📞 Soporte

Si tienen dudas sobre la estructura de datos o necesitan más información, pueden consultar:
- El endpoint `/estudiantes/enums` para ver los valores posibles de los enums
- La documentación de Prisma para entender las relaciones
- El equipo de backend para aclaraciones sobre la estructura de datos

---

**Fecha de actualización:** 8 de marzo de 2026  
**Versión del backend:** Actualizada con relaciones completas
