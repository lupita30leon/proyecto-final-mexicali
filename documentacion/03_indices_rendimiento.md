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
| A | `PROJECTION_SIMPLE`, `SORT`, `COLLSCAN` | 20 | 0 | 175,482 | 89 ms |
| B | `PROJECTION_DEFAULT`, `SORT`, `COLLSCAN` | 20 | 0 | 175,482 | 91 ms |

MongoDB recorrió los 175,482 documentos y realizó un ordenamiento independiente para devolver solamente 20 resultados en cada consulta.

## Índices propuestos

### Índice A

```javascript
{
  clasificacionDelito: 1,
  fechaOcurrencia: -1,
  _id: 1
}
