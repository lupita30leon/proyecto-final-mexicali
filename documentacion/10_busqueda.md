# Búsqueda de lugares

## Decisión: $regex en lugar de $text

La guía de la semana 5 pide decidir entre lenguaje libre con `$text` o patrones estructurados con expresiones regulares, y justificar la decisión si la búsqueda no es pertinente.

En este proyecto la búsqueda **sí es pertinente**, pero sobre un campo que no es texto libre: `lugar.nombre` contiene nombres propios cortos de colonias y fraccionamientos (por ejemplo `"VALLE DEL PEDREGAL"`, `"NUEVO MEXICALI"`), no oraciones ni párrafos. Se eligió `$regex` sobre `$text` por tres razones:

1. **`$text` está diseñado para prosa, no para nombres propios cortos.** Tokeniza por palabras, elimina palabras vacías y ordena por una puntuación de relevancia (`$meta: "textScore"`). Para un campo categórico de una a cuatro palabras, esa puntuación no aporta información útil: casi cualquier coincidencia de palabra completa obtiene una relevancia similar.
2. **El caso de uso real es una coincidencia parcial o de mayúsculas/minúsculas, no una búsqueda semántica.** La persona usuaria (personal de análisis territorial) normalmente recuerda sólo una parte del nombre de la colonia. Un patrón `/PEDREGAL/i` resuelve directamente ese caso; `$text` requeriría que la palabra completa coincidiera con un token indexado.
3. **`$text` exige un índice de texto adicional** (`db.delitos_mexicali.createIndex({ "lugar.nombre": "text" })`) que compite en almacenamiento y mantenimiento con los índices ya justificados en `documentacion/03_indices_rendimiento.md`, sin aportar una capacidad que el caso de uso realmente necesite.

Por lo tanto, la búsqueda se implementó con `$regex`, distinguiendo dos patrones con costos distintos.

## Implementación

El script `scripts/busqueda_lugares.js` prueba cuatro casos sobre la colección `delitos_mexicali`.

### Caso 1: prefijo anclado

```javascript
delitos.find({ "lugar.nombre": /^VALLE/i })
```

Un patrón anclado al inicio de la cadena (`^`) puede aprovechar el índice `idx_lugar_fecha_id`, porque MongoDB puede acotar el recorrido del árbol B a las entradas que comienzan con ese prefijo, de forma similar a una condición de rango sobre una cadena.

### Caso 2: subcadena sin anclar

```javascript
delitos.find({ "lugar.nombre": /PEDREGAL/i })
```

Un patrón sin anclar (la coincidencia puede estar en cualquier posición del nombre) **no** puede acotarse a un rango del índice: MongoDB debe recorrer las entradas para evaluar cada una. Este costo se documenta explícitamente en lugar de ocultarlo; para el tamaño actual de la colección resulta aceptable, pero no debe generalizarse a colecciones mucho más grandes sin medirlo.

### Caso 3: búsqueda combinada con filtro temático

Se combina el patrón con `clasificacionDelito: "VEHICLE THEFT"` para mostrar que la búsqueda por patrón puede integrarse con los mismos filtros ya usados en el resto del proyecto (consistente con cómo se construyeron las consultas geoespaciales: primero la selección, después el filtro temático).

### Caso 4: patrón sin coincidencias (control de exclusión)

```javascript
delitos.find({ "lugar.nombre": /ZZZZ_COLONIA_INEXISTENTE/i })
```

Comprueba que un patrón que no existe en la fuente devuelve cero documentos, no un error ni un resultado vacío por accidente de sintaxis.

## Resultado esperado

| Caso | Patrón | Usa el índice | Coincidencias | Qué demuestra |
|---|---|---|---:|---|
| 1 | `/^VALLE/i` | Sí (prefijo) | Colonias que inician con "VALLE" (incluye `VALLE DEL PEDREGAL`, `VALLE DE PUEBLA`) | El anclaje permite un plan más eficiente que un recorrido completo |
| 2 | `/PEDREGAL/i` | No | `VALLE DEL PEDREGAL` | Coincidencia parcial sin importar la posición dentro del nombre |
| 3 | `/PEDREGAL/i` + `VEHICLE THEFT` | No (para el patrón) | Subconjunto de robos de vehículo en Valle del Pedregal | La búsqueda por patrón se combina con un filtro temático exacto |
| 4 | `/ZZZZ_COLONIA_INEXISTENTE/i` | No aplica | 0 | Caso de exclusión: ausencia correcta de resultados |

La salida completa, incluyendo las etapas del plan (`explain`) y las llaves/documentos examinados de los casos 1 y 2, se conserva en `resultados/busqueda_lugares.txt`.

## Limitaciones

- La búsqueda no corrige errores ortográficos ni acentos; sólo empareja el patrón literal (con la bandera `i` para ignorar mayúsculas y minúsculas).
- Los patrones sin anclar no se benefician del índice y su costo crece con el tamaño de la colección; para un catálogo de lugares mucho mayor sería necesario reevaluar esta decisión.
- No se implementó `$text` en esta versión del proyecto porque el campo analizado no es texto libre, según se justifica arriba. Si el proyecto incorporara en el futuro un campo narrativo (por ejemplo, una descripción libre del incidente), `$text` volvería a ser la opción pertinente y debería revisarse en ese momento.
