# Mensaje para el Frontend de Administración - Reorganización de Campos

## 📋 Resumen

Se han realizado cambios en la organización y etiquetas de algunos campos en el formulario de inscripción. Estos cambios deben reflejarse en los documentos generados (FICHA ESTUDIANTIL y FICHA SOCIOECONÓMICA).

---

## 🔄 Cambios Realizados

### **1. Reorganización de Campos en el Paso "Discapacidad"**

Los campos del paso "Discapacidad" ahora están organizados en dos secciones claramente diferenciadas:

#### **Sección 1: Datos del Estudiante**
- Discapacidad
- Porcentaje de Discapacidad
- Número Carnet CONADIS
- Tipo de Discapacidad
- Alergias
- **Medicamentos que usa con frecuencia** (cambio de label)
- Enfermedad catastrófica
- ¿Presenta carnet de discapacidad?
- ¿Presenta algún tipo de alergia importante?

#### **Sección 2: Datos del Representante** (al final)
- Referencia personal – Nombre
- Referencia personal – Parentesco
- Referencia personal – Teléfono

**Nota importante:** Los campos de referencia personal ahora están claramente identificados como "Datos del Representante" y aparecen al final del paso, separados visualmente de los datos del estudiante.

---

### **2. Cambio de Label**

**Campo:** `medicamentos`
- **Label anterior:** "Medicamentos"
- **Label nuevo:** "Medicamentos que usa con frecuencia"

**Acción requerida:** Actualizar el label en los documentos generados para reflejar este cambio.

---

### **3. Campo de Colegio - Nombres Nuevos**

El campo `nombreColegioProcedencia` ahora puede contener nombres de colegios que **no están en el catálogo oficial**. Los usuarios pueden agregar manualmente nombres de colegios nuevos.

**Implicaciones:**
- El campo puede tener valores que no existen en la tabla de colegios
- El campo `tipoColegioId` puede estar vacío o ser `'NA'` para colegios nuevos
- No es necesario validar que el nombre exista en el catálogo

**Acción requerida:** Asegurar que los documentos muestren correctamente cualquier nombre de colegio, incluso si no está en el catálogo.

---

## 📍 Ubicación en los Documentos

### **FICHA ESTUDIANTIL:**

Los campos deben aparecer en el siguiente orden dentro de la sección de "Discapacidad y Salud":

1. **Datos del Estudiante:**
   - Discapacidad
   - Porcentaje de Discapacidad
   - Número Carnet CONADIS
   - Tipo de Discapacidad
   - Alergias
   - **Medicamentos que usa con frecuencia** ← (label actualizado)
   - Enfermedad catastrófica
   - ¿Presenta carnet de discapacidad?
   - ¿Presenta algún tipo de alergia importante?

2. **Datos del Representante:** (separado visualmente)
   - Referencia personal – Nombre
   - Referencia personal – Parentesco
   - Referencia personal – Teléfono

---

## 💻 Implementación Sugerida

### **Ejemplo de estructura en el documento:**

```html
<!-- Sección: Datos del Estudiante -->
<h3>Datos del Estudiante</h3>
<!-- Campos del estudiante aquí -->

<!-- Separador visual -->
<hr style="border-color: #f9eb1d; margin: 20px 0;" />

<!-- Sección: Datos del Representante -->
<h3>Datos del Representante</h3>
<!-- Campos de referencia personal aquí -->
```

---

## ✅ Checklist de Implementación

- [ ] Actualizar el label de "Medicamentos" a "Medicamentos que usa con frecuencia" en los documentos
- [ ] Reorganizar los campos en el paso de Discapacidad para mostrar primero los datos del estudiante y luego los del representante
- [ ] Agregar separador visual entre las dos secciones
- [ ] Asegurar que el campo `nombreColegioProcedencia` muestre cualquier valor, incluso si no está en el catálogo
- [ ] Verificar que `tipoColegioId` pueda estar vacío o mostrar "N/A" cuando el colegio es nuevo

---

## 📝 Notas Adicionales

- La reorganización es principalmente visual y de organización lógica
- Los nombres de los campos en la API no han cambiado
- Solo cambió el orden de visualización y algunos labels
- El campo de colegio ahora es más flexible y acepta valores nuevos

---

**Fecha de implementación:** Estos cambios ya están implementados en el formulario de inscripción.
