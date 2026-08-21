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

### ¿Por qué la consulta A llega exactamente a 0 documentos y 20 llaves examinadas?

Este resultado suele parecer contradictorio a primera vista: si `nReturned` es 20, ¿cómo puede `totalDocsExamined` ser 0? La explicación depende de comparar, campo por campo, lo que pide la consulta contra lo que contiene el índice `idx_clasificacion_fecha_id`:

| Lo que necesita la consulta A | ¿Lo cubre el índice `{ clasificacionDelito: 1, fechaOcurrencia: -1, _id: 1 }`? |
|---|---|
| Filtro de igualdad en `clasificacionDelito` | Sí, es el primer campo del índice |
| Filtro de rango `[2023-01-01, 2024-01-01)` en `fechaOcurrencia` | Sí, es el segundo campo del índice |
| Ordenamiento descendente por `fechaOcurrencia` y ascendente por `_id` | Sí, coincide con el orden físico de las entradas del índice |
| Proyección solicitada: `_id`, `clasificacionDelito`, `fechaOcurrencia` | Sí, los tres campos ya están dentro de las llaves del índice |

Como **los tres campos proyectados por la consulta A ya están contenidos en las llaves del índice**, MongoDB puede resolver la consulta completa leyendo únicamente la estructura del índice (`IXSCAN`), sin necesidad de ir al documento completo en la colección. Esa es la razón de que aparezca la etapa `PROJECTION_COVERED`: es un **índice cubierto** (*covered query*) para esta consulta específica.

De ahí se derivan las dos métricas:

- **`totalKeysExamined = 20`**: MongoDB recorre 20 entradas del índice, exactamente las que corresponden al límite (`limit(20)`) solicitado por la consulta, porque el orden del índice ya coincide con el orden pedido y no necesita revisar entradas adicionales para descartarlas.
- **`totalDocsExamined = 0`**: como toda la información que la consulta necesita ya viene en esas 20 llaves, MongoDB nunca abre el documento correspondiente en la colección. "Documentos examinados" cuenta lecturas a la colección, no al índice; por eso puede ser 0 aunque se devuelvan 20 resultados.

La consulta B, en cambio, sí pide `"lugar.nombre"`, que **no** forma parte del índice `idx_lugar_fecha_id` como valor devuelto (sólo se usa como llave de búsqueda), por lo que después de localizar las 20 llaves (`totalKeysExamined = 20`) MongoDB debe ejecutar `FETCH` y abrir cada uno de los 20 documentos para poder devolver ese campo (`totalDocsExamined = 20`). Esta comparación entre A y B es precisamente lo que demuestra que la reducción de documentos examinados depende de si la proyección solicitada está o no completamente contenida en el índice, no sólo de que exista un índice.

## Comprobación de resultados

Las dos mediciones devolvieron 20 documentos. Los identificadores, la primera fecha, la última fecha y el orden de los resultados permanecieron iguales antes y después de crear los índices.

Por lo tanto, los índices redujeron el trabajo de las consultas sin modificar el resultado esperado.

## Costos y limitaciones

Los índices requieren almacenamiento adicional y aumentan el costo de inserción, actualización y eliminación porque MongoDB debe mantener sus estructuras.

No se creó un índice para cada campo. Se propusieron solamente dos índices derivados de consultas específicas.

El tiempo de ejecución disminuyó de 92 ms en ambas consultas a 0 ms en esta ejecución. Sin embargo, el tiempo puede variar por caché, carga del entorno y precisión de la medición. La evidencia principal es el cambio de `COLLSCAN` a `IXSCAN`, la eliminación de `SORT` y la reducción de documentos examinados.

Los resultados corresponden a este conjunto y entorno de prueba. No demuestran que los mismos índices mejoren cualquier consulta o carga de trabajo.
