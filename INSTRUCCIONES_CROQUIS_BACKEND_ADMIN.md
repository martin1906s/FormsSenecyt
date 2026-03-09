# Instrucciones: Croquis de Vivienda - Backend y Frontend Admin

## 📋 Resumen

Este documento explica qué deben hacer el **Backend** y el **Frontend de Administración** para manejar correctamente el campo **Croquis de Vivienda** (`croquisViviendaUrl`) que ahora se puede subir desde el formulario de inscripción.

---

## ✅ Estado Actual del Formulario de Inscripción

El formulario de inscripción ya tiene implementado:

- ✅ Campo de subida de imagen para el croquis de vivienda
- ✅ Validación de formatos (JPG, PNG, WebP, GIF)
- ✅ Vista previa de la imagen subida
- ✅ Funcionalidad para eliminar y cambiar la imagen
- ✅ El campo `croquisViviendaUrl` se guarda en la base de datos

---

## 🔧 Backend - Verificaciones Necesarias

### 1. **Endpoint de Subida de Croquis** ✅

El backend ya tiene el endpoint implementado:

```
POST /estudiantes/upload-croquis-vivienda
Content-Type: multipart/form-data

Body:
- archivo: File (imagen)
```

**Respuesta esperada:**
```json
{
  "url": "https://bucket-url.com/maps/croquis-123456.jpg"
}
```

### 2. **Endpoint de Eliminación de Croquis** ✅

El backend ya tiene el endpoint implementado:

```
POST /estudiantes/delete-croquis-vivienda
Content-Type: application/json

Body:
{
  "url": "https://bucket-url.com/maps/croquis-123456.jpg"
}
```

**Respuesta esperada:**
```json
{
  "ok": true
}
```

### 3. **Campo en la Base de Datos** ✅

El campo `croquisViviendaUrl` ya existe en la tabla `Estudiante`:

- **Tipo:** String (VARCHAR/TEXT)
- **Valor por defecto:** `'NA'` o `null`
- **Descripción:** URL pública de la imagen del croquis almacenada en el bucket "maps"

### 4. **Verificación de Endpoints GET** 🔍

Asegúrate de que cuando se obtiene un estudiante, el campo `croquisViviendaUrl` se devuelve correctamente:

```json
{
  "id": 1,
  "numeroIdentificacion": "1234567890",
  "croquisViviendaUrl": "https://bucket-url.com/maps/croquis-123456.jpg",
  // ... otros campos
}
```

**Si no hay croquis:**
```json
{
  "id": 1,
  "numeroIdentificacion": "1234567890",
  "croquisViviendaUrl": "NA",
  // ... otros campos
}
```

### 5. **Bucket de Almacenamiento** 📦

Verifica que:
- ✅ El bucket "maps" existe y está configurado
- ✅ Las imágenes se suben correctamente al bucket
- ✅ Las URLs públicas son accesibles
- ✅ Las imágenes se eliminan correctamente cuando se solicita

---

## 🎨 Frontend de Administración - Implementación Necesaria

### 1. **Mostrar el Croquis en el Documento FICHA SOCIOECONÓMICA**

En la sección **"5.4. Croquis de la vivienda"** del documento, debes mostrar la imagen del croquis.

#### **Estructura de Datos:**

El estudiante viene con el campo:
```typescript
estudiante.croquisViviendaUrl: string
```

#### **Lógica de Mostrado:**

```typescript
// Verificar si existe croquis
if (estudiante.croquisViviendaUrl && 
    estudiante.croquisViviendaUrl !== 'NA' && 
    estudiante.croquisViviendaUrl !== '') {
  
  // Mostrar la imagen en el documento
  // La imagen debe mostrarse directamente, NO como link
  mostrarImagenEnDocumento(estudiante.croquisViviendaUrl);
  
} else {
  // Mostrar "NA" o dejar el espacio en blanco
  mostrarTexto('NA');
}
```

### 2. **Implementación para Documentos Word (.docx)**

Si usas una librería como `docx` o `docx-preview`:

```typescript
import { Document, Packer, Paragraph, ImageRun, WidthType } from 'docx';

async function generarDocumentoConCroquis(estudiante: any) {
  const elementos: any[] = [];
  
  // ... otros elementos del documento ...
  
  // Sección 5.4: Croquis de la vivienda
  elementos.push(
    new Paragraph({
      text: "5.4. Croquis de la vivienda:",
      heading: "Heading2"
    })
  );
  
  if (estudiante.croquisViviendaUrl && 
      estudiante.croquisViviendaUrl !== 'NA' && 
      estudiante.croquisViviendaUrl !== '') {
    
    try {
      // Descargar la imagen desde la URL
      const imagenResponse = await fetch(estudiante.croquisViviendaUrl);
      const imagenBlob = await imagenResponse.blob();
      const imagenArrayBuffer = await imagenBlob.arrayBuffer();
      
      // Agregar la imagen al documento
      elementos.push(
        new Paragraph({
          children: [
            new ImageRun({
              data: imagenArrayBuffer,
              transformation: {
                width: 500, // Ancho en puntos (ajustar según necesidad)
                height: 400, // Alto en puntos (ajustar según necesidad)
              },
            }),
          ],
        })
      );
    } catch (error) {
      console.error('Error al cargar el croquis:', error);
      elementos.push(
        new Paragraph({
          text: "NA (Error al cargar la imagen)"
        })
      );
    }
  } else {
    elementos.push(
      new Paragraph({
        text: "NA"
      })
    );
  }
  
  // ... resto del documento ...
  
  const doc = new Document({
    sections: [{
      children: elementos
    }]
  });
  
  return doc;
}
```

### 3. **Implementación para Documentos PDF**

Si usas una librería como `pdfmake` o `jspdf`:

#### **Con pdfmake:**

```typescript
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

async function generarPDFConCroquis(estudiante: any) {
  const contenido: any[] = [];
  
  // ... otros elementos del documento ...
  
  // Sección 5.4: Croquis de la vivienda
  contenido.push({
    text: '5.4. Croquis de la vivienda:',
    style: 'subheader',
    margin: [0, 20, 0, 10]
  });
  
  if (estudiante.croquisViviendaUrl && 
      estudiante.croquisViviendaUrl !== 'NA' && 
      estudiante.croquisViviendaUrl !== '') {
    
    try {
      // Convertir la imagen a base64
      const imagenBase64 = await convertirImagenABase64(estudiante.croquisViviendaUrl);
      
      contenido.push({
        image: imagenBase64,
        width: 400, // Ancho en puntos
        height: 300, // Alto en puntos (ajustar según necesidad)
        alignment: 'center',
        margin: [0, 10, 0, 20]
      });
    } catch (error) {
      console.error('Error al cargar el croquis:', error);
      contenido.push({
        text: 'NA (Error al cargar la imagen)',
        margin: [0, 10, 0, 20]
      });
    }
  } else {
    contenido.push({
      text: 'NA',
      margin: [0, 10, 0, 20]
    });
  }
  
  // ... resto del documento ...
  
  const documento = {
    content: contenido,
    styles: {
      // ... estilos ...
    }
  };
  
  pdfMake.createPdf(documento).download('ficha-socioeconomica.pdf');
}

// Función helper para convertir imagen a base64
async function convertirImagenABase64(url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
```

#### **Con jsPDF:**

```typescript
import jsPDF from 'jspdf';

async function generarPDFConCroquis(estudiante: any) {
  const doc = new jsPDF();
  
  // ... otros elementos del documento ...
  
  // Sección 5.4: Croquis de la vivienda
  doc.setFontSize(12);
  doc.text('5.4. Croquis de la vivienda:', 20, doc.internal.pageSize.height - 50);
  
  if (estudiante.croquisViviendaUrl && 
      estudiante.croquisViviendaUrl !== 'NA' && 
      estudiante.croquisViviendaUrl !== '') {
    
    try {
      // Cargar y agregar la imagen
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = () => {
          // Ajustar tamaño de la imagen
          const maxWidth = 170; // mm
          const maxHeight = 120; // mm
          let width = img.width;
          let height = img.height;
          
          // Calcular proporción
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
          
          // Agregar imagen al PDF
          doc.addImage(img, 'JPEG', 20, doc.internal.pageSize.height - 50 - height, width, height);
          resolve(null);
        };
        img.onerror = reject;
        img.src = estudiante.croquisViviendaUrl;
      });
    } catch (error) {
      console.error('Error al cargar el croquis:', error);
      doc.text('NA (Error al cargar la imagen)', 20, doc.internal.pageSize.height - 50);
    }
  } else {
    doc.text('NA', 20, doc.internal.pageSize.height - 50);
  }
  
  // ... resto del documento ...
  
  doc.save('ficha-socioeconomica.pdf');
}
```

### 4. **Implementación para HTML/Preview**

Si muestras el documento en HTML antes de descargarlo:

```html
<div class="document-section">
  <h3>5.4. Croquis de la vivienda:</h3>
  
  @if (estudiante.croquisViviendaUrl && 
       estudiante.croquisViviendaUrl !== 'NA' && 
       estudiante.croquisViviendaUrl !== '') {
    <img 
      [src]="estudiante.croquisViviendaUrl" 
      alt="Croquis de Vivienda"
      class="croquis-image"
      style="max-width: 100%; height: auto; border: 1px solid #ccc; border-radius: 4px;"
    />
  } @else {
    <p>NA</p>
  }
</div>
```

```scss
.croquis-image {
  max-width: 600px;
  height: auto;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin: 10px 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
```

---

## ⚠️ Consideraciones Importantes

### 1. **Manejo de Errores**

Siempre maneja los casos donde:
- La URL no es accesible
- La imagen no se puede cargar
- El formato de imagen no es compatible
- La conexión a internet falla

```typescript
try {
  // Intentar cargar la imagen
  await cargarImagen(estudiante.croquisViviendaUrl);
} catch (error) {
  // Mostrar mensaje de error o "NA"
  console.error('Error al cargar croquis:', error);
  mostrarTexto('NA (Error al cargar la imagen)');
}
```

### 2. **Tamaño de la Imagen**

- **Recomendación:** Ajusta el tamaño de la imagen para que no ocupe toda la página
- **Ancho máximo recomendado:** 400-500 puntos/píxeles
- **Alto máximo recomendado:** 300-400 puntos/píxeles
- **Mantener proporción:** Usa `aspect-ratio` o calcula la proporción

### 3. **Formato de la Imagen**

El formulario acepta:
- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)
- GIF (.gif)

Asegúrate de que tu librería de generación de documentos soporte estos formatos.

### 4. **CORS (Cross-Origin Resource Sharing)**

Si la imagen está en un bucket de S3 o similar, verifica que:
- ✅ El bucket permite acceso público o tiene CORS configurado
- ✅ La URL es accesible desde el frontend
- ✅ No hay restricciones de dominio

### 5. **Validación de URL**

Antes de intentar cargar la imagen, valida que la URL sea válida:

```typescript
function esUrlValida(url: string): boolean {
  if (!url || url === 'NA' || url === '') return false;
  
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}
```

---

## 📋 Checklist de Implementación

### **Backend:**
- [ ] Verificar que el endpoint `POST /estudiantes/upload-croquis-vivienda` funciona correctamente
- [ ] Verificar que el endpoint `POST /estudiantes/delete-croquis-vivienda` funciona correctamente
- [ ] Verificar que el campo `croquisViviendaUrl` se devuelve en los GET de estudiantes
- [ ] Verificar que el bucket "maps" está configurado y accesible
- [ ] Verificar que las URLs públicas son accesibles desde el frontend

### **Frontend de Administración:**
- [ ] Implementar lógica para mostrar la imagen en el documento
- [ ] Manejar el caso cuando `croquisViviendaUrl` es 'NA' o vacío
- [ ] Manejar errores al cargar la imagen
- [ ] Ajustar el tamaño de la imagen para que se vea bien en el documento
- [ ] Probar con diferentes formatos de imagen (JPG, PNG, WebP, GIF)
- [ ] Verificar que la imagen se muestra correctamente en el documento generado
- [ ] Probar con estudiantes que tienen croquis y estudiantes que no tienen

---

## 🧪 Pruebas Recomendadas

1. **Estudiante con croquis:**
   - Subir un croquis desde el formulario
   - Generar el documento desde el admin
   - Verificar que la imagen aparece correctamente

2. **Estudiante sin croquis:**
   - Generar el documento para un estudiante sin croquis
   - Verificar que muestra "NA" o espacio en blanco

3. **Errores de carga:**
   - Simular una URL inválida o inaccesible
   - Verificar que se maneja el error correctamente

4. **Diferentes formatos:**
   - Probar con imágenes JPG, PNG, WebP, GIF
   - Verificar que todos se muestran correctamente

---

## 📞 Soporte

Si tienes dudas sobre:
- La estructura de datos: consulta el endpoint `GET /estudiantes/:id`
- La URL del croquis: verifica que el bucket esté configurado correctamente
- Problemas de CORS: contacta al equipo de backend

---

**Fecha de actualización:** 8 de marzo de 2026  
**Versión del formulario:** Actualizada con campo de croquis de vivienda
