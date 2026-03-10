# Mensaje para el Backend - Campo de Colegio con Opción de Agregar Nuevos

## 📋 Resumen

El formulario de inscripción ahora permite que los usuarios **agreguen nombres de colegios nuevos** que no existen en el catálogo de colegios. Esto significa que el campo `nombreColegioProcedencia` puede recibir valores que no están en la tabla de colegios.

---

## 🔄 Cambio en el Comportamiento

### **Antes:**
- El campo `nombreColegioProcedencia` solo aceptaba valores del catálogo de colegios.
- Si un colegio no existía, el usuario no podía continuar.

### **Ahora:**
- El campo `nombreColegioProcedencia` puede recibir **cualquier texto** (nombre de colegio).
- Si el usuario escribe un nombre que no está en el catálogo, puede agregarlo manualmente.
- El campo `tipoColegioId` puede quedar vacío cuando se agrega un colegio nuevo (ya que no tenemos esa información del catálogo).

---

## 📦 Estructura de Datos

### **Campos relacionados:**

```typescript
{
  nombreColegioProcedencia: string,  // Puede ser cualquier texto, no solo del catálogo
  tipoColegioId: string,              // Puede estar vacío si es un colegio nuevo
  // ... otros campos ...
}
```

### **Valores posibles:**

- **`nombreColegioProcedencia`**: 
  - Puede ser un nombre del catálogo (como antes)
  - Puede ser un nombre nuevo escrito manualmente por el usuario
  - Ejemplo: "UNIDAD EDUCATIVA NUEVA ESPERANZA" (puede no existir en el catálogo)

- **`tipoColegioId`**:
  - Si el colegio viene del catálogo: tendrá el valor del `sostenimiento`
  - Si el colegio es nuevo: puede estar vacío (`''`) o `'NA'`

---

## ⚠️ Consideraciones Importantes

1. **Validación:**
   - El backend debe aceptar cualquier texto válido en `nombreColegioProcedencia`
   - No debe validar que el nombre exista en el catálogo de colegios
   - El campo `tipoColegioId` puede ser opcional cuando `nombreColegioProcedencia` es un colegio nuevo

2. **Almacenamiento:**
   - Guardar el nombre tal como viene del frontend (en mayúsculas)
   - Si `tipoColegioId` está vacío para un colegio nuevo, puede guardarse como `null` o `'NA'`

3. **Búsqueda mejorada:**
   - El frontend ahora hace búsquedas más flexibles (por palabras individuales)
   - Esto no afecta al backend, pero es bueno saberlo

---

## ✅ Checklist de Implementación

- [ ] Verificar que `nombreColegioProcedencia` acepte cualquier texto válido (no solo del catálogo)
- [ ] Asegurar que `tipoColegioId` sea opcional cuando el colegio es nuevo
- [ ] Actualizar validaciones si es necesario
- [ ] Probar con nombres de colegios nuevos que no existen en el catálogo

---

## 📞 Notas Adicionales

- Los usuarios pueden seguir seleccionando colegios del catálogo (comportamiento anterior)
- La opción de agregar nuevos colegios es para casos donde el colegio no está en el catálogo
- El backend no necesita crear nuevos registros en la tabla de colegios automáticamente
- Solo debe aceptar y guardar el nombre tal como viene del frontend

---

**Fecha de implementación:** Estos cambios ya están implementados en el frontend del formulario de inscripción.
