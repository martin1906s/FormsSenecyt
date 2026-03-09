# Instrucciones para el Frontend de Administración - Correo Institucional

## 📋 Resumen

El **correo institucional** NO se llena en el formulario de inscripción. Debe **generarse automáticamente** en el documento FICHA ESTUDIANTIL y FICHA SOCIOECONÓMICA usando el nombre y apellido del estudiante.

---

## 📧 Formato del Correo Institucional

### **Estructura:**
```
[primeraParteNombre].[primerApellido]@movilis.edu.ec
```

### **Ejemplo:**
- **Nombre:** Juan Carlos
- **Apellido:** García López
- **Correo institucional:** `juan.garcia@movilis.edu.ec`

---

## 🔧 Lógica de Generación

### **Pasos para generar el correo:**

1. **Tomar el primer nombre:**
   - Del campo `estudiante.primerNombre`
   - Convertir a minúsculas
   - Eliminar acentos y caracteres especiales
   - Ejemplo: "Juan" → "juan"

2. **Tomar el primer apellido:**
   - Del campo `estudiante.primerApellido`
   - Convertir a minúsculas
   - Eliminar acentos y caracteres especiales
   - Ejemplo: "García" → "garcia"

3. **Concatenar:**
   - `[primerNombre].[primerApellido]@movilis.edu.ec`
   - Ejemplo: `juan.garcia@movilis.edu.ec`

---

## 💻 Implementación

### **Función Helper en TypeScript:**

```typescript
/**
 * Genera el correo institucional a partir del nombre y apellido del estudiante
 * Formato: primerNombre.primerApellido@movilis.edu.ec
 */
function generarCorreoInstitucional(estudiante: any): string {
  // Obtener primer nombre y primer apellido
  const primerNombre = estudiante.primerNombre || '';
  const primerApellido = estudiante.primerApellido || '';
  
  // Si no hay nombre o apellido, retornar "NA"
  if (!primerNombre || !primerApellido) {
    return 'NA';
  }
  
  // Normalizar: convertir a minúsculas y eliminar acentos
  const normalizar = (texto: string): string => {
    return texto
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
      .replace(/[^a-z0-9]/g, ''); // Eliminar caracteres especiales, dejar solo letras y números
  };
  
  const nombreNormalizado = normalizar(primerNombre);
  const apellidoNormalizado = normalizar(primerApellido);
  
  // Si después de normalizar no hay nada, retornar "NA"
  if (!nombreNormalizado || !apellidoNormalizado) {
    return 'NA';
  }
  
  // Generar correo institucional
  return `${nombreNormalizado}.${apellidoNormalizado}@movilis.edu.ec`;
}
```

---

## 📝 Ejemplos de Uso

### **Ejemplo 1:**
- `primerNombre`: "Juan"
- `primerApellido`: "García"
- **Resultado:** `juan.garcia@movilis.edu.ec`

### **Ejemplo 2:**
- `primerNombre`: "María José"
- `primerApellido`: "López"
- **Resultado:** `mariajose.lopez@movilis.edu.ec` (nota: se eliminan espacios)

### **Ejemplo 3:**
- `primerNombre`: "José"
- `primerApellido`: "González"
- **Resultado:** `jose.gonzalez@movilis.edu.ec` (nota: se eliminan acentos)

### **Ejemplo 4:**
- `primerNombre`: "Carlos"
- `primerApellido`: "O'Brien"
- **Resultado:** `carlos.obrien@movilis.edu.ec` (nota: se eliminan caracteres especiales)

### **Ejemplo 5:**
- `primerNombre`: "NA" o vacío
- `primerApellido`: "García"
- **Resultado:** `NA` (si falta nombre o apellido)

---

## 📄 Cómo Mostrar en el Documento

### **En FICHA ESTUDIANTIL y FICHA SOCIOECONÓMICA:**

En la sección de **"1.8. Contactos"** o donde corresponda:

```
Correo institucional: [correo generado]
```

**Ejemplo:**
```
Correo institucional: juan.garcia@movilis.edu.ec
```

---

## 💻 Ejemplos de Implementación por Librería

### **1. Para Documentos Word (.docx) con librería `docx`:**

```typescript
import { Document, Packer, Paragraph, TextRun } from 'docx';

function generarSeccionContactos(estudiante: any): Paragraph[] {
  const elementos: Paragraph[] = [];
  
  // Generar correo institucional
  const correoInstitucional = generarCorreoInstitucional(estudiante);
  
  elementos.push(
    new Paragraph({
      children: [
        new TextRun({ text: "Correo institucional: ", bold: true }),
        new TextRun({ text: correoInstitucional })
      ]
    })
  );
  
  return elementos;
}
```

---

### **2. Para Documentos PDF con `pdfmake`:**

```typescript
import pdfMake from 'pdfmake/build/pdfmake';

function generarSeccionContactos(estudiante: any): any[] {
  const contenido: any[] = [];
  
  // Generar correo institucional
  const correoInstitucional = generarCorreoInstitucional(estudiante);
  
  contenido.push({
    columns: [
      { text: 'Correo institucional:', width: '40%', bold: true },
      { text: correoInstitucional, width: '60%' }
    ],
    margin: [0, 5, 0, 5]
  });
  
  return contenido;
}
```

---

### **3. Para HTML/Preview:**

```html
<div class="campo-documento">
  <strong>Correo institucional:</strong>
  <span>{{ generarCorreoInstitucional(estudiante) }}</span>
</div>
```

```typescript
// En el componente
generarCorreoInstitucional(estudiante: any): string {
  const primerNombre = estudiante.primerNombre || '';
  const primerApellido = estudiante.primerApellido || '';
  
  if (!primerNombre || !primerApellido) {
    return 'NA';
  }
  
  const normalizar = (texto: string): string => {
    return texto
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');
  };
  
  const nombreNormalizado = normalizar(primerNombre);
  const apellidoNormalizado = normalizar(primerApellido);
  
  if (!nombreNormalizado || !apellidoNormalizado) {
    return 'NA';
  }
  
  return `${nombreNormalizado}.${apellidoNormalizado}@movilis.edu.ec`;
}
```

---

## ⚠️ Consideraciones Importantes

### **1. Normalización de Texto**

Es importante normalizar el texto para:
- Eliminar acentos (á → a, é → e, etc.)
- Convertir a minúsculas
- Eliminar espacios y caracteres especiales
- Mantener solo letras y números

**Ejemplo de normalización:**
- "José María" → "josemaria"
- "García-López" → "garcialopez"
- "O'Brien" → "obrien"

### **2. Casos Especiales**

#### **Si falta nombre o apellido:**
```typescript
if (!primerNombre || !primerApellido) {
  return 'NA';
}
```

#### **Si el nombre o apellido tienen solo espacios:**
```typescript
const nombreNormalizado = normalizar(primerNombre);
if (!nombreNormalizado) {
  return 'NA';
}
```

#### **Si hay números en el nombre/apellido:**
- Los números se mantienen
- Ejemplo: "Juan2" → "juan2"

### **3. Dominio Fijo**

El dominio `@movilis.edu.ec` es **fijo para todos** los estudiantes. No debe variar.

---

## 📋 Checklist de Implementación

- [ ] Crear función `generarCorreoInstitucional()` en el frontend de admin
- [ ] Implementar normalización de texto (minúsculas, sin acentos, sin caracteres especiales)
- [ ] Agregar el correo institucional en la sección de contactos del documento
- [ ] Manejar casos especiales (nombre/apellido vacío, solo espacios, etc.)
- [ ] Probar con diferentes nombres y apellidos:
  - Nombres con acentos (José, María)
  - Apellidos con guiones (García-López)
  - Nombres compuestos (Juan Carlos)
  - Caracteres especiales (O'Brien)
- [ ] Verificar que el formato sea: `[nombre].[apellido]@movilis.edu.ec`

---

## 🧪 Pruebas Recomendadas

### **Prueba 1: Nombre y apellido simples**
- **Input:** `primerNombre: "Juan"`, `primerApellido: "García"`
- **Esperado:** `juan.garcia@movilis.edu.ec`

### **Prueba 2: Nombre con acento**
- **Input:** `primerNombre: "José"`, `primerApellido: "González"`
- **Esperado:** `jose.gonzalez@movilis.edu.ec`

### **Prueba 3: Nombre compuesto**
- **Input:** `primerNombre: "María José"`, `primerApellido: "López"`
- **Esperado:** `mariajose.lopez@movilis.edu.ec`

### **Prueba 4: Apellido con guion**
- **Input:** `primerNombre: "Carlos"`, `primerApellido: "García-López"`
- **Esperado:** `carlos.garcialopez@movilis.edu.ec`

### **Prueba 5: Caracteres especiales**
- **Input:** `primerNombre: "John"`, `primerApellido: "O'Brien"`
- **Esperado:** `john.obrien@movilis.edu.ec`

### **Prueba 6: Nombre vacío**
- **Input:** `primerNombre: ""`, `primerApellido: "García"`
- **Esperado:** `NA`

### **Prueba 7: Apellido vacío**
- **Input:** `primerNombre: "Juan"`, `primerApellido: ""`
- **Esperado:** `NA`

---

## 📞 Notas Finales

1. **NO usar el campo `correoInstitucional` del backend:**
   - El backend puede tener un campo `correoInstitucional`, pero debe **ignorarse** para la generación del documento
   - El correo debe generarse siempre desde `primerNombre` y `primerApellido`

2. **Formato consistente:**
   - Siempre usar minúsculas
   - Siempre usar punto (.) como separador entre nombre y apellido
   - Siempre usar `@movilis.edu.ec` como dominio

3. **Validación:**
   - Si no se puede generar el correo (falta nombre o apellido), mostrar "NA"

---

**Fecha de actualización:** 9 de marzo de 2026  
**Versión del formulario:** Correo institucional debe generarse automáticamente en el documento
