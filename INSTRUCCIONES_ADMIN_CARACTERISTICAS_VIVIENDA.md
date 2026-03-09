# Instrucciones para el Frontend de Administración - Campos de Características de la Vivienda

## 📋 Resumen

Se han agregado **todos los campos de "Características de la Vivienda"** (Sección 5.5 a 5.14) al formulario de inscripción. Estos campos ahora se envían al backend y deben aparecer en el documento **FICHA SOCIOECONÓMICA**.

---

## ✅ Campos Disponibles en la Respuesta del Backend

Cuando obtienes un estudiante desde el backend, ahora recibirás estos campos adicionales:

### **5.5. Tipo de Propiedad de la Vivienda**

**Campo:** `estudiante.tipoPropiedadVivienda`

**Tipo:** String (Enum)

**Valores posibles:**
- `'PROPIA'` - Propia
- `'ARRENDADA'` - Arrendada
- `'CEDIDA_TRABAJO'` - Cedida por trabajo
- `'CEDIDA_FAMILIAR'` - Cedida por familiar
- `'OTRO'` - Otro
- `'NA'` - No aplica

**Ejemplo de uso:**
```typescript
const tipoPropiedad = estudiante.tipoPropiedadVivienda || 'NA';
// Convertir a texto legible
const tipoPropiedadTexto = {
  'PROPIA': 'Propia',
  'ARRENDADA': 'Arrendada',
  'CEDIDA_TRABAJO': 'Cedida por trabajo',
  'CEDIDA_FAMILIAR': 'Cedida por familiar',
  'OTRO': 'Otro',
  'NA': 'N/A'
}[tipoPropiedad] || tipoPropiedad;
```

---

### **5.6. Estructura de la Vivienda**

**Campo:** `estudiante.estructuraVivienda`

**Tipo:** String (Enum o String con prefijo "OTRO:")

**Valores posibles:**
- `'HORMIGON'` - Hormigón
- `'LADRILLO'` - Ladrillo
- `'BLOQUE'` - Bloque
- `'ADOBE'` - Adobe
- `'MADERA'` - Madera
- `'CANA'` - Caña
- `'OTRO'` o `'OTRO: [especificación]'` - Otro
- `'NA'` - No aplica

**Campo relacionado:** `estudiante.estructuraViviendaEspecifique` (String)

**Ejemplo de uso:**
```typescript
let estructuraTexto = 'N/A';

if (estudiante.estructuraVivienda && estudiante.estructuraVivienda !== 'NA') {
  if (estudiante.estructuraVivienda.startsWith('OTRO:')) {
    const especificacion = estudiante.estructuraVivienda.replace(/^OTRO:\s*/i, '').trim();
    estructuraTexto = `Otro: ${especificacion}`;
  } else {
    const estructuraMap: { [key: string]: string } = {
      'HORMIGON': 'Hormigón',
      'LADRILLO': 'Ladrillo',
      'BLOQUE': 'Bloque',
      'ADOBE': 'Adobe',
      'MADERA': 'Madera',
      'CANA': 'Caña',
      'OTRO': 'Otro'
    };
    estructuraTexto = estructuraMap[estudiante.estructuraVivienda] || estudiante.estructuraVivienda;
    
    // Si hay especificación adicional
    if (estudiante.estructuraViviendaEspecifique) {
      estructuraTexto += `: ${estudiante.estructuraViviendaEspecifique}`;
    }
  }
}
```

---

### **5.7. Tipo de Vivienda**

**Campo:** `estudiante.tipoVivienda`

**Tipo:** String (Enum)

**Valores posibles:**
- `'SUITE_LUJO'` - Suite de lujo
- `'CASA'` - Casa
- `'DEPARTAMENTO'` - Departamento
- `'HABITACION'` - Habitación
- `'MEDIA_AGUA'` - Media agua
- `'RANCHO'` - Rancho
- `'NA'` - No aplica

**Ejemplo de uso:**
```typescript
const tipoViviendaMap: { [key: string]: string } = {
  'SUITE_LUJO': 'Suite de lujo',
  'CASA': 'Casa',
  'DEPARTAMENTO': 'Departamento',
  'HABITACION': 'Habitación',
  'MEDIA_AGUA': 'Media agua',
  'RANCHO': 'Rancho',
  'NA': 'N/A'
};

const tipoVivienda = tipoViviendaMap[estudiante.tipoVivienda] || estudiante.tipoVivienda || 'N/A';
```

---

### **5.9. Cantidad de Baños**

**Campo:** `estudiante.cantidadBanos`

**Tipo:** Number (Integer) o `null`/`undefined`

**Ejemplo de uso:**
```typescript
const cantidadBanos = estudiante.cantidadBanos != null && estudiante.cantidadBanos !== undefined
  ? String(estudiante.cantidadBanos)
  : 'NA';
```

---

### **5.10. Cantidad de Habitaciones**

**Campo:** `estudiante.cantidadHabitaciones`

**Tipo:** Number (Integer) o `null`/`undefined`

**Ejemplo de uso:**
```typescript
const cantidadHabitaciones = estudiante.cantidadHabitaciones != null && estudiante.cantidadHabitaciones !== undefined
  ? String(estudiante.cantidadHabitaciones)
  : 'NA';
```

---

### **5.11. ¿Compartes Habitación?**

**Campo:** `estudiante.comparteHabitacion`

**Tipo:** String

**Descripción:** Texto libre que describe con quién comparte habitación

**Ejemplo de uso:**
```typescript
const comparteHabitacion = estudiante.comparteHabitacion && estudiante.comparteHabitacion !== 'NA'
  ? estudiante.comparteHabitacion
  : 'NA';
```

---

### **5.12. ¿Actualmente con Quién o Quiénes Vives?**

**Campo:** `estudiante.conQuienVive`

**Tipo:** String

**Descripción:** Texto libre que describe con quién vive actualmente

**Ejemplo de uso:**
```typescript
const conQuienVive = estudiante.conQuienVive && estudiante.conQuienVive !== 'NA'
  ? estudiante.conQuienVive
  : 'NA';
```

---

### **5.14. ¿El Tamaño de la Vivienda es Suficiente?**

**Campo:** `estudiante.tamanoViviendaSuficiente`

**Tipo:** String (Enum)

**Valores posibles:**
- `'SI'` - Sí
- `'NO'` - No
- `'NA'` - No aplica

**Ejemplo de uso:**
```typescript
const tamanoSuficiente = estudiante.tamanoViviendaSuficiente === 'SI' ? 'Sí' :
                        estudiante.tamanoViviendaSuficiente === 'NO' ? 'No' :
                        'N/A';
```

---

## 📄 Cómo Mostrar en el Documento FICHA SOCIOECONÓMICA

### **Estructura de la Sección 5 (Características de la Vivienda)**

En el documento, estos campos deben aparecer en la **Sección 5** de la siguiente manera:

```
5. CARACTERÍSTICAS DE LA VIVIENDA

5.1. Ubicación (calles y dirección): [direccionDomicilio]
5.2. Zona: [zonaVivienda]
5.3. Coordenadas de la vivienda: [coordenadasVivienda]
5.4. Croquis de la vivienda: [imagen del croquis]
5.5. Tipo de propiedad: [tipoPropiedadVivienda]
5.6. Estructura de la vivienda: [estructuraVivienda]
5.7. Tipo de vivienda: [tipoVivienda]
5.8. Servicios disponibles: [serviciosDisponibles] (con checkboxes marcados)
5.9. ¿Cuántos baños existen en su hogar? [cantidadBanos]
5.10. ¿Cuántas habitaciones existen en el hogar? [cantidadHabitaciones]
5.11. ¿Compartes habitación? [comparteHabitacion]
5.12. ¿Actualmente con quien o quienes vives? [conQuienVive]
5.13. ¿Cuántas personas viven en total en la vivienda? [cantidadMiembrosHogar]
5.14. ¿El tamaño de la vivienda es suficiente respecto al número de personas que la habitan? [tamanoViviendaSuficiente] (Sí/No con checkbox)
```

---

## 💻 Ejemplos de Implementación

### **1. Para Documentos Word (.docx) con librería `docx`**

```typescript
import { Document, Packer, Paragraph, TextRun } from 'docx';

function generarSeccionCaracteristicasVivienda(estudiante: any): Paragraph[] {
  const elementos: Paragraph[] = [];
  
  // Título de la sección
  elementos.push(
    new Paragraph({
      text: "5. CARACTERÍSTICAS DE LA VIVIENDA",
      heading: "Heading1"
    })
  );
  
  // 5.5. Tipo de propiedad
  const tipoPropiedadMap: { [key: string]: string } = {
    'PROPIA': 'Propia',
    'ARRENDADA': 'Arrendada',
    'CEDIDA_TRABAJO': 'Cedida por trabajo',
    'CEDIDA_FAMILIAR': 'Cedida por familiar',
    'OTRO': 'Otro',
    'NA': 'N/A'
  };
  const tipoPropiedad = tipoPropiedadMap[estudiante.tipoPropiedadVivienda] || 'N/A';
  elementos.push(
    new Paragraph({
      children: [
        new TextRun({ text: "5.5. Tipo de propiedad: ", bold: true }),
        new TextRun({ text: tipoPropiedad })
      ]
    })
  );
  
  // 5.6. Estructura de la vivienda
  let estructuraTexto = 'N/A';
  if (estudiante.estructuraVivienda && estudiante.estructuraVivienda !== 'NA') {
    if (estudiante.estructuraVivienda.startsWith('OTRO:')) {
      const especificacion = estudiante.estructuraVivienda.replace(/^OTRO:\s*/i, '').trim();
      estructuraTexto = `Otro: ${especificacion}`;
    } else {
      const estructuraMap: { [key: string]: string } = {
        'HORMIGON': 'Hormigón',
        'LADRILLO': 'Ladrillo',
        'BLOQUE': 'Bloque',
        'ADOBE': 'Adobe',
        'MADERA': 'Madera',
        'CANA': 'Caña'
      };
      estructuraTexto = estructuraMap[estudiante.estructuraVivienda] || estudiante.estructuraVivienda;
      if (estudiante.estructuraViviendaEspecifique) {
        estructuraTexto += `: ${estudiante.estructuraViviendaEspecifique}`;
      }
    }
  }
  elementos.push(
    new Paragraph({
      children: [
        new TextRun({ text: "5.6. Estructura de la vivienda: ", bold: true }),
        new TextRun({ text: estructuraTexto })
      ]
    })
  );
  
  // 5.7. Tipo de vivienda
  const tipoViviendaMap: { [key: string]: string } = {
    'SUITE_LUJO': 'Suite de lujo',
    'CASA': 'Casa',
    'DEPARTAMENTO': 'Departamento',
    'HABITACION': 'Habitación',
    'MEDIA_AGUA': 'Media agua',
    'RANCHO': 'Rancho',
    'NA': 'N/A'
  };
  const tipoVivienda = tipoViviendaMap[estudiante.tipoVivienda] || 'N/A';
  elementos.push(
    new Paragraph({
      children: [
        new TextRun({ text: "5.7. Tipo de vivienda: ", bold: true }),
        new TextRun({ text: tipoVivienda })
      ]
    })
  );
  
  // 5.9. Cantidad de baños
  const cantidadBanos = estudiante.cantidadBanos != null ? String(estudiante.cantidadBanos) : 'NA';
  elementos.push(
    new Paragraph({
      children: [
        new TextRun({ text: "5.9. ¿Cuántos baños existen en su hogar? ", bold: true }),
        new TextRun({ text: cantidadBanos })
      ]
    })
  );
  
  // 5.10. Cantidad de habitaciones
  const cantidadHabitaciones = estudiante.cantidadHabitaciones != null ? String(estudiante.cantidadHabitaciones) : 'NA';
  elementos.push(
    new Paragraph({
      children: [
        new TextRun({ text: "5.10. ¿Cuántas habitaciones existen en el hogar? ", bold: true }),
        new TextRun({ text: cantidadHabitaciones })
      ]
    })
  );
  
  // 5.11. ¿Compartes habitación?
  const comparteHabitacion = estudiante.comparteHabitacion && estudiante.comparteHabitacion !== 'NA'
    ? estudiante.comparteHabitacion
    : 'NA';
  elementos.push(
    new Paragraph({
      children: [
        new TextRun({ text: "5.11. ¿Compartes habitación? (madre, padre, primas, primos, sobrinos, tías, tíos, pareja) ", bold: true }),
        new TextRun({ text: comparteHabitacion })
      ]
    })
  );
  
  // 5.12. ¿Actualmente con quien o quienes vives?
  const conQuienVive = estudiante.conQuienVive && estudiante.conQuienVive !== 'NA'
    ? estudiante.conQuienVive
    : 'NA';
  elementos.push(
    new Paragraph({
      children: [
        new TextRun({ text: "5.12. ¿Actualmente con quien o quienes vives? ", bold: true }),
        new TextRun({ text: conQuienVive })
      ]
    })
  );
  
  // 5.14. ¿El tamaño de la vivienda es suficiente?
  const tamanoSuficiente = estudiante.tamanoViviendaSuficiente === 'SI' ? 'Sí' :
                          estudiante.tamanoViviendaSuficiente === 'NO' ? 'No' :
                          'N/A';
  elementos.push(
    new Paragraph({
      children: [
        new TextRun({ text: "5.14. ¿El tamaño de la vivienda es suficiente respecto al número de personas que la habitan? ", bold: true }),
        new TextRun({ text: tamanoSuficiente })
      ]
    })
  );
  
  return elementos;
}
```

---

### **2. Para Documentos PDF con `pdfmake`**

```typescript
import pdfMake from 'pdfmake/build/pdfmake';

function generarSeccionCaracteristicasVivienda(estudiante: any): any[] {
  const contenido: any[] = [];
  
  // Título de la sección
  contenido.push({
    text: '5. CARACTERÍSTICAS DE LA VIVIENDA',
    style: 'header',
    margin: [0, 20, 0, 10]
  });
  
  // Función helper para crear fila
  const crearFila = (etiqueta: string, valor: string) => ({
    columns: [
      { text: etiqueta, width: '60%', bold: true },
      { text: valor || 'N/A', width: '40%' }
    ],
    margin: [0, 5, 0, 5]
  });
  
  // 5.5. Tipo de propiedad
  const tipoPropiedadMap: { [key: string]: string } = {
    'PROPIA': 'Propia',
    'ARRENDADA': 'Arrendada',
    'CEDIDA_TRABAJO': 'Cedida por trabajo',
    'CEDIDA_FAMILIAR': 'Cedida por familiar',
    'OTRO': 'Otro',
    'NA': 'N/A'
  };
  contenido.push(crearFila('5.5. Tipo de propiedad:', tipoPropiedadMap[estudiante.tipoPropiedadVivienda] || 'N/A'));
  
  // 5.6. Estructura de la vivienda
  let estructuraTexto = 'N/A';
  if (estudiante.estructuraVivienda && estudiante.estructuraVivienda !== 'NA') {
    if (estudiante.estructuraVivienda.startsWith('OTRO:')) {
      estructuraTexto = `Otro: ${estudiante.estructuraVivienda.replace(/^OTRO:\s*/i, '').trim()}`;
    } else {
      const estructuraMap: { [key: string]: string } = {
        'HORMIGON': 'Hormigón',
        'LADRILLO': 'Ladrillo',
        'BLOQUE': 'Bloque',
        'ADOBE': 'Adobe',
        'MADERA': 'Madera',
        'CANA': 'Caña'
      };
      estructuraTexto = estructuraMap[estudiante.estructuraVivienda] || estudiante.estructuraVivienda;
      if (estudiante.estructuraViviendaEspecifique) {
        estructuraTexto += `: ${estudiante.estructuraViviendaEspecifique}`;
      }
    }
  }
  contenido.push(crearFila('5.6. Estructura de la vivienda:', estructuraTexto));
  
  // 5.7. Tipo de vivienda
  const tipoViviendaMap: { [key: string]: string } = {
    'SUITE_LUJO': 'Suite de lujo',
    'CASA': 'Casa',
    'DEPARTAMENTO': 'Departamento',
    'HABITACION': 'Habitación',
    'MEDIA_AGUA': 'Media agua',
    'RANCHO': 'Rancho',
    'NA': 'N/A'
  };
  contenido.push(crearFila('5.7. Tipo de vivienda:', tipoViviendaMap[estudiante.tipoVivienda] || 'N/A'));
  
  // 5.9. Cantidad de baños
  const cantidadBanos = estudiante.cantidadBanos != null ? String(estudiante.cantidadBanos) : 'NA';
  contenido.push(crearFila('5.9. ¿Cuántos baños existen en su hogar?', cantidadBanos));
  
  // 5.10. Cantidad de habitaciones
  const cantidadHabitaciones = estudiante.cantidadHabitaciones != null ? String(estudiante.cantidadHabitaciones) : 'NA';
  contenido.push(crearFila('5.10. ¿Cuántas habitaciones existen en el hogar?', cantidadHabitaciones));
  
  // 5.11. ¿Compartes habitación?
  const comparteHabitacion = estudiante.comparteHabitacion && estudiante.comparteHabitacion !== 'NA'
    ? estudiante.comparteHabitacion
    : 'NA';
  contenido.push(crearFila('5.11. ¿Compartes habitación? (madre, padre, primas, primos, sobrinos, tías, tíos, pareja)', comparteHabitacion));
  
  // 5.12. ¿Actualmente con quien o quienes vives?
  const conQuienVive = estudiante.conQuienVive && estudiante.conQuienVive !== 'NA'
    ? estudiante.conQuienVive
    : 'NA';
  contenido.push(crearFila('5.12. ¿Actualmente con quien o quienes vives?', conQuienVive));
  
  // 5.14. ¿El tamaño de la vivienda es suficiente?
  const tamanoSuficiente = estudiante.tamanoViviendaSuficiente === 'SI' ? 'Sí' :
                          estudiante.tamanoViviendaSuficiente === 'NO' ? 'No' :
                          'N/A';
  contenido.push(crearFila('5.14. ¿El tamaño de la vivienda es suficiente respecto al número de personas que la habitan?', tamanoSuficiente));
  
  return contenido;
}
```

---

### **3. Para HTML/Preview**

```html
<div class="seccion-caracteristicas-vivienda">
  <h2>5. CARACTERÍSTICAS DE LA VIVIENDA</h2>
  
  <div class="campo-documento">
    <strong>5.5. Tipo de propiedad:</strong>
    <span>{{ getTipoPropiedadTexto(estudiante.tipoPropiedadVivienda) }}</span>
  </div>
  
  <div class="campo-documento">
    <strong>5.6. Estructura de la vivienda:</strong>
    <span>{{ getEstructuraViviendaTexto(estudiante) }}</span>
  </div>
  
  <div class="campo-documento">
    <strong>5.7. Tipo de vivienda:</strong>
    <span>{{ getTipoViviendaTexto(estudiante.tipoVivienda) }}</span>
  </div>
  
  <div class="campo-documento">
    <strong>5.9. ¿Cuántos baños existen en su hogar?</strong>
    <span>{{ estudiante.cantidadBanos != null ? estudiante.cantidadBanos : 'NA' }}</span>
  </div>
  
  <div class="campo-documento">
    <strong>5.10. ¿Cuántas habitaciones existen en el hogar?</strong>
    <span>{{ estudiante.cantidadHabitaciones != null ? estudiante.cantidadHabitaciones : 'NA' }}</span>
  </div>
  
  <div class="campo-documento">
    <strong>5.11. ¿Compartes habitación? (madre, padre, primas, primos, sobrinos, tías, tíos, pareja)</strong>
    <span>{{ estudiante.comparteHabitacion && estudiante.comparteHabitacion !== 'NA' ? estudiante.comparteHabitacion : 'NA' }}</span>
  </div>
  
  <div class="campo-documento">
    <strong>5.12. ¿Actualmente con quien o quienes vives?</strong>
    <span>{{ estudiante.conQuienVive && estudiante.conQuienVive !== 'NA' ? estudiante.conQuienVive : 'NA' }}</span>
  </div>
  
  <div class="campo-documento">
    <strong>5.14. ¿El tamaño de la vivienda es suficiente respecto al número de personas que la habitan?</strong>
    <span>{{ getTamanoSuficienteTexto(estudiante.tamanoViviendaSuficiente) }}</span>
  </div>
</div>
```

```typescript
// Funciones helper en el componente
getTipoPropiedadTexto(valor: string): string {
  const map: { [key: string]: string } = {
    'PROPIA': 'Propia',
    'ARRENDADA': 'Arrendada',
    'CEDIDA_TRABAJO': 'Cedida por trabajo',
    'CEDIDA_FAMILIAR': 'Cedida por familiar',
    'OTRO': 'Otro',
    'NA': 'N/A'
  };
  return map[valor] || valor || 'N/A';
}

getEstructuraViviendaTexto(estudiante: any): string {
  if (!estudiante.estructuraVivienda || estudiante.estructuraVivienda === 'NA') {
    return 'N/A';
  }
  
  if (estudiante.estructuraVivienda.startsWith('OTRO:')) {
    return `Otro: ${estudiante.estructuraVivienda.replace(/^OTRO:\s*/i, '').trim()}`;
  }
  
  const map: { [key: string]: string } = {
    'HORMIGON': 'Hormigón',
    'LADRILLO': 'Ladrillo',
    'BLOQUE': 'Bloque',
    'ADOBE': 'Adobe',
    'MADERA': 'Madera',
    'CANA': 'Caña'
  };
  
  let texto = map[estudiante.estructuraVivienda] || estudiante.estructuraVivienda;
  if (estudiante.estructuraViviendaEspecifique) {
    texto += `: ${estudiante.estructuraViviendaEspecifique}`;
  }
  
  return texto;
}

getTipoViviendaTexto(valor: string): string {
  const map: { [key: string]: string } = {
    'SUITE_LUJO': 'Suite de lujo',
    'CASA': 'Casa',
    'DEPARTAMENTO': 'Departamento',
    'HABITACION': 'Habitación',
    'MEDIA_AGUA': 'Media agua',
    'RANCHO': 'Rancho',
    'NA': 'N/A'
  };
  return map[valor] || valor || 'N/A';
}

getTamanoSuficienteTexto(valor: string): string {
  if (valor === 'SI') return 'Sí';
  if (valor === 'NO') return 'No';
  return 'N/A';
}
```

---

## ⚠️ Consideraciones Importantes

### **1. Manejo de Valores 'NA'**

Todos los campos pueden tener el valor `'NA'` o estar vacíos. Siempre verificar antes de mostrar:

```typescript
function getValueOrNA(value: any): string {
  if (!value || value === 'NA' || value === 'null' || value === 'undefined') {
    return 'N/A';
  }
  return String(value);
}
```

### **2. Números Opcionales**

Los campos `cantidadBanos` y `cantidadHabitaciones` pueden ser `null` o `undefined`:

```typescript
const cantidadBanos = estudiante.cantidadBanos != null && estudiante.cantidadBanos !== undefined
  ? String(estudiante.cantidadBanos)
  : 'NA';
```

### **3. Estructura Vivienda Especial**

El campo `estructuraVivienda` puede venir con el formato `'OTRO: [especificación]'`. Siempre verificar:

```typescript
if (estudiante.estructuraVivienda && estudiante.estructuraVivienda.startsWith('OTRO:')) {
  // Extraer la especificación
  const especificacion = estudiante.estructuraVivienda.replace(/^OTRO:\s*/i, '').trim();
  // Mostrar como "Otro: [especificación]"
}
```

### **4. Orden de los Campos**

Mantener el orden numérico en el documento:
- 5.5. Tipo de propiedad
- 5.6. Estructura de la vivienda
- 5.7. Tipo de vivienda
- 5.8. Servicios disponibles (ya implementado)
- 5.9. Cantidad de baños
- 5.10. Cantidad de habitaciones
- 5.11. ¿Compartes habitación?
- 5.12. ¿Actualmente con quien o quienes vives?
- 5.13. Cantidad de personas (ya implementado como `cantidadMiembrosHogar`)
- 5.14. ¿El tamaño de la vivienda es suficiente?

---

## 📋 Checklist de Implementación

### **Verificación de Campos:**
- [ ] Verificar que `tipoPropiedadVivienda` se muestra correctamente
- [ ] Verificar que `estructuraVivienda` se muestra correctamente (incluyendo casos con "OTRO:")
- [ ] Verificar que `estructuraViviendaEspecifique` se muestra cuando corresponde
- [ ] Verificar que `tipoVivienda` se muestra correctamente
- [ ] Verificar que `cantidadBanos` se muestra correctamente (o "NA" si es null)
- [ ] Verificar que `cantidadHabitaciones` se muestra correctamente (o "NA" si es null)
- [ ] Verificar que `comparteHabitacion` se muestra correctamente
- [ ] Verificar que `conQuienVive` se muestra correctamente
- [ ] Verificar que `tamanoViviendaSuficiente` se muestra correctamente (Sí/No/N/A)

### **Pruebas:**
- [ ] Probar con un estudiante que tenga todos los campos completos
- [ ] Probar con un estudiante que tenga algunos campos como 'NA'
- [ ] Probar con un estudiante que tenga `estructuraVivienda = 'OTRO: [especificación]'`
- [ ] Probar con un estudiante que tenga `cantidadBanos` y `cantidadHabitaciones` como null
- [ ] Verificar que los valores se muestran en el orden correcto (5.5, 5.6, 5.7, etc.)
- [ ] Verificar que los textos se muestran en formato legible (no en formato enum)

---

## 🔍 Estructura de Datos Esperada

Cuando obtienes un estudiante del backend, deberías recibir algo como:

```json
{
  "id": 1,
  "numeroIdentificacion": "1234567890",
  "tipoPropiedadVivienda": "ARRENDADA",
  "estructuraVivienda": "HORMIGON",
  "estructuraViviendaEspecifique": null,
  "tipoVivienda": "CASA",
  "cantidadBanos": 2,
  "cantidadHabitaciones": 3,
  "comparteHabitacion": "NA",
  "conQuienVive": "madre, padre",
  "tamanoViviendaSuficiente": "SI",
  "cantidadMiembrosHogar": 4,
  "croquisViviendaUrl": "https://bucket-url.com/maps/croquis-123.jpg"
}
```

---

## 📞 Soporte

Si tienes dudas sobre:
- Los valores posibles de los enums: consulta este documento
- El formato de los datos: revisa los ejemplos de código
- Problemas de visualización: verifica que estés accediendo correctamente a los campos del objeto `estudiante`

---

**Fecha de actualización:** 9 de marzo de 2026  
**Versión del formulario:** Actualizada con todos los campos de Características de la Vivienda  
**Documento relacionado:** Ver también `GUIA_ADMIN_DOCUMENTOS.md` para información general sobre otros campos
