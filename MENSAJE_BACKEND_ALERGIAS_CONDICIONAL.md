# Mensaje para el Backend - Validación Condicional de Alergias

## 📋 Resumen

Se implementó una lógica condicional en el frontend donde el campo `alergias` solo se puede llenar si `presentaAlergiaImportante === 'SI'`. El frontend ya está manejando esto correctamente, pero se recomienda agregar una validación de consistencia en el backend.

---

## 🔄 Comportamiento del Frontend

### **Lógica implementada:**
- Si `presentaAlergiaImportante === 'SI'` → El campo `alergias` está habilitado y puede tener cualquier valor.
- Si `presentaAlergiaImportante === 'NO'` o `'NA'` → El campo `alergias` se deshabilita automáticamente y se establece en `'NA'`.

### **Datos que se envían al backend:**
- Cuando `presentaAlergiaImportante !== 'SI'`, el frontend envía `alergias: 'NA'` automáticamente.
- Cuando `presentaAlergiaImportante === 'SI'`, el frontend envía el valor que el usuario escribió en `alergias`.

---

## ✅ Validación Recomendada (Opcional pero Recomendada)

Para asegurar la **integridad de los datos** y prevenir inconsistencias (por ejemplo, si alguien modifica directamente la base de datos o si hay un bug en el frontend), se recomienda agregar una validación en el backend:

### **Regla de validación:**
```typescript
// Pseudocódigo de validación
if (presentaAlergiaImportante !== 'SI') {
  // Si no tiene alergia importante, el campo alergias debe ser 'NA' o vacío
  if (alergias && alergias !== 'NA' && alergias.trim() !== '') {
    throw new ValidationError('El campo alergias solo puede tener valor si presentaAlergiaImportante es "SI"');
  }
  // Forzar a 'NA' si viene otro valor
  alergias = 'NA';
}
```

### **Validación en el esquema (ejemplo con Zod/joi/etc):**
```typescript
// Ejemplo con Zod
z.object({
  presentaAlergiaImportante: z.enum(['SI', 'NO', 'NA']),
  alergias: z.string().refine((val, ctx) => {
    const presentaAlergia = ctx.parent.presentaAlergiaImportante;
    if (presentaAlergia !== 'SI') {
      return val === 'NA' || val === '' || !val;
    }
    return true; // Si es 'SI', puede tener cualquier valor
  }, {
    message: 'El campo alergias solo puede tener valor si presentaAlergiaImportante es "SI"'
  })
})
```

---

## 📦 Estructura de Datos

### **Campos relacionados:**
```typescript
{
  presentaAlergiaImportante: 'SI' | 'NO' | 'NA',
  alergias: string,  // 'NA' si presentaAlergiaImportante !== 'SI'
  // ... otros campos ...
}
```

### **Combinaciones válidas:**
| presentaAlergiaImportante | alergias | ¿Válido? |
|--------------------------|----------|----------|
| 'SI' | 'ALERGIA AL POLEN' | ✅ Sí |
| 'SI' | 'NA' | ✅ Sí (usuario puede escribir NA) |
| 'NO' | 'NA' | ✅ Sí |
| 'NO' | 'ALERGIA AL POLEN' | ❌ No (debe ser 'NA') |
| 'NA' | 'NA' | ✅ Sí |
| 'NA' | 'ALERGIA AL POLEN' | ❌ No (debe ser 'NA') |

---

## ⚠️ Consideraciones

1. **No es estrictamente necesario:** El frontend ya está manejando esto correctamente, así que los datos siempre llegarán consistentes.

2. **Recomendado para seguridad:** Agregar la validación en el backend es una buena práctica para:
   - Prevenir inconsistencias si alguien modifica directamente la base de datos
   - Detectar bugs en el frontend
   - Asegurar la integridad de los datos

3. **Comportamiento actual:** Si no implementan la validación, el sistema funcionará correctamente porque el frontend ya está enviando los valores correctos.

---

## ✅ Checklist de Implementación (Opcional)

- [ ] Agregar validación que verifique: si `presentaAlergiaImportante !== 'SI'`, entonces `alergias` debe ser `'NA'` o vacío
- [ ] Si se recibe un valor inconsistente, forzar `alergias = 'NA'` o rechazar la petición con un error de validación
- [ ] Probar con diferentes combinaciones de valores
- [ ] Documentar la regla de negocio en el código

---

## 📝 Notas Adicionales

- **El frontend ya está funcionando correctamente** y enviando los datos de forma consistente.
- Esta validación es una **medida de seguridad adicional** recomendada pero no crítica.
- Si deciden no implementarla, el sistema seguirá funcionando sin problemas.

---

**Fecha de implementación:** Estos cambios ya están implementados en el frontend del formulario de inscripción.
