# Mensaje para el Backend - Campos de Financiamiento de la Carrera Universitaria

## 📋 Resumen

Se han agregado los campos de **"Financiamiento de la carrera universitaria"** (Sección 2.11) al POST del formulario. Estos campos ahora se envían al backend cuando el usuario completa el formulario.

---

## 📤 Campos que se Envían

El frontend ahora envía estos campos en el POST:

```json
{
  "financiamientoFondosPropios": true,
  "financiamientoAyudaPadres": true,
  "financiamientoTarjetaCredito": false,
  "financiamientoEntidadFinanciera": false,
  "financiamientoTercerasPersonas": false,
  "financiamientoQuienes": "NA"
}
```

---

## 📝 Detalles de Cada Campo

### **1. financiamientoFondosPropios**

**Tipo:** Boolean

**Valores posibles:**
- `true` - Si el usuario marca el checkbox "Fondos propios"
- `false` - Si el usuario NO marca el checkbox

**Formato en el POST:**
```json
{
  "financiamientoFondosPropios": true
}
```

---

### **2. financiamientoAyudaPadres**

**Tipo:** Boolean

**Valores posibles:**
- `true` - Si el usuario marca el checkbox "Ayuda de sus padres"
- `false` - Si el usuario NO marca el checkbox

**Formato en el POST:**
```json
{
  "financiamientoAyudaPadres": true
}
```

---

### **3. financiamientoTarjetaCredito**

**Tipo:** Boolean

**Valores posibles:**
- `true` - Si el usuario marca el checkbox "Tarjeta de crédito"
- `false` - Si el usuario NO marca el checkbox

**Formato en el POST:**
```json
{
  "financiamientoTarjetaCredito": true
}
```

---

### **4. financiamientoEntidadFinanciera**

**Tipo:** Boolean

**Valores posibles:**
- `true` - Si el usuario marca el checkbox "Entidad financiera (préstamos)"
- `false` - Si el usuario NO marca el checkbox

**Formato en el POST:**
```json
{
  "financiamientoEntidadFinanciera": true
}
```

---

### **5. financiamientoTercerasPersonas**

**Tipo:** Boolean

**Valores posibles:**
- `true` - Si el usuario marca el checkbox "Ayuda a terceras personas"
- `false` - Si el usuario NO marca el checkbox

**Formato en el POST:**
```json
{
  "financiamientoTercerasPersonas": true
}
```

---

### **6. financiamientoQuienes** (ya existía)

**Tipo:** String

**Descripción:** Texto libre que especifica quiénes ayudan (solo aparece si `financiamientoTercerasPersonas` es `true`)

**Valores posibles:**
- Texto libre (si el usuario escribe algo)
- `"NA"` (si el campo está vacío o `financiamientoTercerasPersonas` es `false`)

**Formato en el POST:**
```json
{
  "financiamientoQuienes": "tíos, abuelos"
}
```

O si está vacío:
```json
{
  "financiamientoQuienes": "NA"
}
```

---

## 📦 Ejemplo Completo de POST

Aquí está un ejemplo completo de cómo se envía el POST cuando el usuario completa el Paso 5 (Información Académica):

```json
{
  "tipoDocumento": "CEDULA",
  "numeroIdentificacion": "1234567890",
  "primerApellido": "GARCIA",
  "primerNombre": "JUAN",
  
  // ... otros campos del formulario ...
  
  // Campos de Financiamiento de la carrera universitaria (Sección 2.11)
  "financiamientoFondosPropios": true,
  "financiamientoAyudaPadres": true,
  "financiamientoTarjetaCredito": false,
  "financiamientoEntidadFinanciera": false,
  "financiamientoTercerasPersonas": true,
  "financiamientoQuienes": "tíos, abuelos",
  
  // ... otros campos del formulario ...
}
```

---

## 🔍 Verificaciones Necesarias en el Backend

### **1. Campos en la Base de Datos**

Verificar que estos campos existan en la tabla `Estudiante`:

- ✅ `financiamientoFondosPropios` (BOOLEAN)
- ✅ `financiamientoAyudaPadres` (BOOLEAN)
- ✅ `financiamientoTarjetaCredito` (BOOLEAN)
- ✅ `financiamientoEntidadFinanciera` (BOOLEAN)
- ✅ `financiamientoTercerasPersonas` (BOOLEAN)
- ✅ `financiamientoQuienes` (VARCHAR/TEXT) - Este ya debería existir

**Query SQL sugerido:**
```sql
-- Verificar estructura de la tabla
DESCRIBE Estudiante;

-- O en PostgreSQL
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'Estudiante'
AND column_name IN (
  'financiamientoFondosPropios',
  'financiamientoAyudaPadres',
  'financiamientoTarjetaCredito',
  'financiamientoEntidadFinanciera',
  'financiamientoTercerasPersonas',
  'financiamientoQuienes'
);
```

---

### **2. Validaciones Recomendadas**

#### **Campos Booleanos:**
- Aceptar solo `true` o `false`
- Valor por defecto: `false` si no se proporciona
- No requerir estos campos (opcionales)

#### **financiamientoQuienes:**
- Aceptar strings de hasta 200 caracteres
- Valor por defecto: `'NA'` si está vacío
- Solo tiene sentido si `financiamientoTercerasPersonas` es `true`

---

### **3. Endpoints Afectados**

Estos campos se envían en:
- `POST /estudiantes` - Crear nuevo estudiante
- `POST /estudiantes/guardar-paso` - Guardar paso del formulario
- `PUT /estudiantes/:id` - Actualizar estudiante existente

---

### **4. Respuesta GET**

Cuando se obtiene un estudiante, estos campos deben devolverse:

```json
{
  "id": 1,
  "numeroIdentificacion": "1234567890",
  "financiamientoFondosPropios": true,
  "financiamientoAyudaPadres": true,
  "financiamientoTarjetaCredito": false,
  "financiamientoEntidadFinanciera": false,
  "financiamientoTercerasPersonas": true,
  "financiamientoQuienes": "tíos, abuelos"
}
```

---

## ⚠️ Notas Importantes

1. **Campos Opcionales:** Todos estos campos son opcionales. Si no se proporcionan, deben tener valores por defecto (`false` para booleanos, `'NA'` para strings).

2. **Compatibilidad:** Estos campos pueden no existir aún en el backend. Si es así, el backend debe:
   - Crear una migración para agregar estos campos a la tabla `Estudiante`
   - Actualizar el modelo/ORM para incluir estos campos
   - Asegurarse de que se guarden y devuelvan correctamente

3. **Múltiples Selecciones:** El usuario puede marcar **múltiples checkboxes** a la vez. Por ejemplo, puede marcar "Fondos propios" Y "Ayuda de sus padres" al mismo tiempo.

4. **financiamientoQuienes:** Este campo solo tiene sentido si `financiamientoTercerasPersonas` es `true`. El frontend ya maneja esto mostrando el campo condicionalmente.

---

## 🧪 Prueba Sugerida para el Backend

1. **Crear un estudiante de prueba:**
   ```bash
   POST /estudiantes
   {
     "tipoDocumento": "CEDULA",
     "numeroIdentificacion": "9999999999",
     "primerApellido": "TEST",
     "primerNombre": "TEST",
     "financiamientoFondosPropios": true,
     "financiamientoAyudaPadres": true,
     "financiamientoTarjetaCredito": false,
     "financiamientoEntidadFinanciera": false,
     "financiamientoTercerasPersonas": true,
     "financiamientoQuienes": "tíos"
   }
   ```

2. **Verificar en la base de datos:**
   ```sql
   SELECT 
     financiamientoFondosPropios,
     financiamientoAyudaPadres,
     financiamientoTarjetaCredito,
     financiamientoEntidadFinanciera,
     financiamientoTercerasPersonas,
     financiamientoQuienes
   FROM Estudiante 
   WHERE numeroIdentificacion = '9999999999';
   ```

3. **Hacer un GET:**
   ```bash
   GET /estudiantes/buscar?tipoDocumento=CEDULA&numeroIdentificacion=9999999999
   ```

4. **Verificar la respuesta:**
   - ¿Los campos aparecen?
   - ¿Los valores son correctos?

---

## 📞 Pregunta Directa para el Backend

"Se agregaron los campos de financiamiento de la carrera universitaria (checkboxes: Fondos propios, Ayuda de sus padres, Tarjeta de crédito, Entidad financiera, Ayuda a terceras personas) al POST del formulario.

¿Estos campos ya existen en la base de datos? Si no, necesitan agregarlos como campos BOOLEAN en la tabla `Estudiante`.

El frontend ahora envía estos campos como booleanos (true/false). ¿Pueden verificar que:
1. Los campos existen en la base de datos
2. Se están guardando correctamente cuando reciben el POST
3. Se devuelven cuando hacen un GET del estudiante?"

---

**Fecha de actualización:** 9 de marzo de 2026  
**Versión del formulario:** Actualizada para enviar campos de financiamiento
