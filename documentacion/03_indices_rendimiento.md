# Estrategia de índices y comparación de rendimiento

## Patrones seleccionados

Se seleccionaron dos consultas relevantes para estudiar el rendimiento. Las consultas se mantuvieron sin cambios entre las mediciones realizadas antes y después de crear los índices.

### Consulta A

**Pregunta:** ¿Cuáles son los 20 registros más recientes de robo de vehículo ocurridos durante 2023?

La consulta utiliza:

- Igualdad en `clasificacionDelito`.
- Rango en `fechaOcurrencia`.
- Orden descendente en `fechaOcurrencia`.
- `_id` ascendente como criterio de desempate.
- Límite de 20 documentos.

### Consulta B

**Pregunta:** ¿Cuáles son los 20 registros más recientes de Valle del Pedregal ocurridos entre 2020 y 2024?

La consulta utiliza:

- Igualdad en `lugar.nombre`.
- Rango en `fechaOcurrencia`.
- Orden descendente en `fechaOcurrencia`.
- `_id` ascendente como criterio de desempate.
- Límite de 20 documentos.

## Medición inicial

La primera medición se realizó únicamente con el índice obligatorio `_id_`.

| Consulta | Etapas | nReturned | totalKeysExamined | totalDocsExamined | Tiempo |
|---|---|---:|---:|---:|---:|
| A | `PROJECTION_SIMPLE`, `SORT`, `COLLSCAN` | 20 | 0 | 175,482 | 92 ms |
| B | `PROJECTION_DEFAULT`, `SORT`, `COLLSCAN` | 20 | 0 | 175,482 | 92 ms |

MongoDB recorrió los 175,482 documentos y realizó un ordenamiento independiente para devolver solamente 20 resultados en cada consulta.

## Índices propuestos

### Índice A

```javascript
{
  clasificacionDelito: 1,
  fechaOcurrencia: -1,
  _id: 1
}
```

Nombre:

```text
idx_clasificacion_fecha_id
```

`clasificacionDelito` se encuentra primero porque la consulta aplica una condición de igualdad. `fechaOcurrencia` se incluye después con dirección descendente para atender el rango y el orden solicitado. `_id` se agrega como criterio de desempate para garantizar un orden reproducible cuando varios documentos tienen la misma fecha.

### Índice B

```javascript
{
  "lugar.nombre": 1,
  fechaOcurrencia: -1,
  _id: 1
}
```

Nombre:

```text
idx_lugar_fecha_id
```

`lugar.nombre` se coloca primero por tratarse de una condición de igualdad. Los campos siguientes corresponden al ordenamiento temporal y al criterio de desempate.

Ninguno de los índices es multikey porque los campos indexados no son arreglos.

## Medición posterior

| Consulta | Etapas | nReturned | totalKeysExamined | totalDocsExamined | Tiempo |
|---|---|---:|---:|---:|---:|
| A | `LIMIT`, `PROJECTION_COVERED`, `IXSCAN` | 20 | 20 | 0 | 0 ms |
| B | `LIMIT`, `PROJECTION_DEFAULT`, `FETCH`, `IXSCAN` | 20 | 20 | 20 | 0 ms |

## Comparación

| Consulta | Plan antes | Plan después | Docs antes | Docs después | Keys antes | Keys después |
|---|---|---|---:|---:|---:|---:|
| A | `COLLSCAN` + `SORT` | `IXSCAN` cubierto | 175,482 | 0 | 0 | 20 |
| B | `COLLSCAN` + `SORT` | `IXSCAN` + `FETCH` | 175,482 | 20 | 0 | 20 |

En la consulta A, el índice contiene todos los campos utilizados por el filtro, ordenamiento y proyección. Por eso aparece `PROJECTION_COVERED` y MongoDB no necesita leer documentos de la colección.

En la consulta B, MongoDB utiliza el índice para localizar y ordenar los resultados, pero ejecuta `FETCH` para recuperar `clasificacionDelito`, que no forma parte del índice. Aun así, los documentos examinados disminuyeron de 175,482 a 20.

En ambas consultas desapareció la etapa `SORT`, porque los índices proporcionan el orden solicitado.

## Comprobación de resultados

Las dos mediciones devolvieron 20 documentos. Los identificadores, la primera fecha, la última fecha y el orden de los resultados permanecieron iguales antes y después de crear los índices.

Por lo tanto, los índices redujeron el trabajo de las consultas sin modificar el resultado esperado.

## Costos y limitaciones

Los índices requieren almacenamiento adicional y aumentan el costo de inserción, actualización y eliminación porque MongoDB debe mantener sus estructuras.

No se creó un índice para cada campo. Se propusieron solamente dos índices derivados de consultas específicas.

El tiempo de ejecución disminuyó de 92 ms en ambas consultas a 0 ms en esta ejecución. Sin embargo, el tiempo puede variar por caché, carga del entorno y precisión de la medición. La evidencia principal es el cambio de `COLLSCAN` a `IXSCAN`, la eliminación de `SORT` y la reducción de documentos examinados.

Los resultados corresponden a este conjunto y entorno de prueba. No demuestran que los mismos índices mejoren cualquier consulta o carga de trabajo.
