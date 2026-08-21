# Búsqueda de lugares

## Decisión: $regex en lugar de $text

La guía de la semana 5 pide decidir entre lenguaje libre con `$text` o patrones estructurados con expresiones regulares, y justificar la decisión si la búsqueda no es pertinente.

En este proyecto la búsqueda **sí es pertinente**, pero sobre un campo que no es texto libre: `lugar.nombre` contiene nombres propios cortos de colonias y fraccionamientos (por ejemplo `"VALLE DEL PEDREGAL"`, `"NUEVO MEXICALI"`), no oraciones ni párrafos. Se eligió `$regex` sobre `$text` por tres razones:

1. **`$text` está diseñado para prosa, no para nombres propios cortos.** Tokeniza por palabras, elimina palabras vacías y ordena por una puntuación de relevancia (`$meta: "textScore"`). Para un campo categórico de una a cuatro palabras, esa puntuación no aporta información útil: casi cualquier coincidencia de palabra completa obtiene una relevancia similar.
2. **El caso de uso real es una coincidencia parcial o de mayúsculas/minúsculas, no una búsqueda semántica.** La persona usuaria (personal de análisis territorial) normalmente recuerda sólo una parte del nombre de la colonia. Un patrón `/PEDREGAL/i` resuelve directamente ese caso; `$text` requeriría que la palabra completa coincidiera con un token indexado.
3. **`$text` exige un índice de texto adicional** (`db.delitos_mexicali.createIndex({ "lugar.nombre": "text" })`) que compite en almacenamiento y mantenimiento con los índices ya justificados en `documentacion/03_indices_rendimiento.md`, sin aportar una capacidad que el caso de uso realmente necesite.

Por lo tanto, la búsqueda se implementó con `$regex`. La comparación de costo entre patrones no se dejó como una afirmación teórica: se comprobó con `explain("executionStats")` sobre datos reales, y el resultado obligó a corregir una suposición inicial (ver "Hallazgo real" más abajo).

## Implementación

El script `scripts/busqueda_lugares.js` prueba cuatro casos sobre la colección `delitos_mexicali`.

### Caso 1: prefijo anclado, insensible a mayúsculas

```javascript
delitos.find({ "lugar.nombre": /^VALLE/i })
```

### Caso 2: subcadena sin anclar

```javascript
delitos.find({ "lugar.nombre": /PEDREGAL/i })
```

### Caso 3: búsqueda combinada con filtro temático

Se combina el patrón con `clasificacionDelito: "VEHICLE THEFT"` para mostrar que la búsqueda por patrón puede integrarse con los mismos filtros ya usados en el resto del proyecto (consistente con cómo se construyeron las consultas geoespaciales: primero la selección, después el filtro temático).

### Caso 4: patrón sin coincidencias (control de exclusión)

```javascript
delitos.find({ "lugar.nombre": /ZZZZ_COLONIA_INEXISTENTE/i })
```

Comprueba que un patrón que no existe en la fuente devuelve cero documentos, no un error ni un resultado vacío por accidente de sintaxis.

## Hallazgo real: la suposición inicial sobre el prefijo anclado era incorrecta

Antes de ejecutar el script contra los 175,482 documentos reales, se asumió que `/^VALLE/i` acotaría el recorrido del índice `idx_lugar_fecha_id` a sólo las entradas que empiezan con "VALLE", igual que una condición de rango. La evidencia real (`resultados/busqueda_lugares.txt`) contradice esa suposición:

| Caso | Patrón | Etapas del plan | totalKeysExamined | totalDocsExamined | nReturned |
|---|---|---|---:|---:|---:|
| 1 | `/^VALLE/i` | FETCH, IXSCAN | 175,463 | 10,297 | 10,297 |
| 2 | `/PEDREGAL/i` | FETCH, IXSCAN | 175,463 | 3,605 | 3,605 |

Los dos casos examinan prácticamente **el mismo número de llaves** (175,463, casi el índice completo), sin importar que el patrón esté anclado o no. La razón es la bandera `i`: MongoDB sólo puede calcular un rango acotado para un prefijo anclado cuando la comparación es sensible a mayúsculas y minúsculas. La bandera insensible a mayúsculas, necesaria para el caso de uso real (una persona analista no siempre escribe el nombre con el mismo patrón de mayúsculas), le impide al planificador construir ese rango, y el índice se recorre casi por completo en ambos casos.

Esto no significa que el índice no sirva aquí. La diferencia real entre los dos casos está en `totalDocsExamined`: MongoDB evalúa el patrón contra el valor ya indexado (sin abrir el documento) para las 175,463 entradas, y sólo ejecuta `FETCH` sobre los documentos que efectivamente coinciden (10,297 y 3,605 respectivamente). Frente a un `COLLSCAN` puro, que habría abierto los 175,482 documentos completos para evaluar el patrón en cada uno, esto sigue siendo una reducción real de trabajo, aunque no sea la reducción "por rango" que se esperaba inicialmente para el caso anclado.

**Conclusión corregida:** con `$regex` insensible a mayúsculas, ni el patrón anclado ni el patrón sin anclar logran acotar `totalKeysExamined`; ambos dependen del índice para evitar `FETCH` sobre documentos que no coinciden, no para reducir el recorrido de llaves. Acotar el recorrido por rango sólo sería posible con un patrón anclado **sensible** a mayúsculas y minúsculas (sin la bandera `i`), lo cual no encaja con el caso de uso real de este proyecto.

## Resultado esperado

| Caso | Patrón | Plan | Coincidencias distintas | Qué demuestra |
|---|---|---|---:|---|
| 1 | `/^VALLE/i` | IXSCAN + FETCH, recorrido casi completo del índice | 139 nombres de colonia distintos | El anclaje no basta para acotar el índice cuando la búsqueda es insensible a mayúsculas |
| 2 | `/PEDREGAL/i` | IXSCAN + FETCH, mismo recorrido de llaves que el caso 1 | 53 nombres de colonia distintos | El índice reduce el `FETCH`, no el recorrido de llaves |
| 3 | `/PEDREGAL/i` + `VEHICLE THEFT` | Igual que el caso 2, más el filtro de igualdad | Subconjunto de robos de vehículo en colonias con "PEDREGAL" | La búsqueda por patrón se combina con un filtro temático exacto |
| 4 | `/ZZZZ_COLONIA_INEXISTENTE/i` | No aplica | 0 | Caso de exclusión: ausencia correcta de resultados |

La salida completa, incluyendo las etapas del plan (`explain`) y las llaves/documentos examinados, se conserva en `resultados/busqueda_lugares.txt`.

## Limitaciones

- La búsqueda no corrige errores ortográficos ni acentos; sólo empareja el patrón literal (con la bandera `i` para ignorar mayúsculas y minúsculas). La fuente real contiene numerosas variantes ortográficas del mismo nombre de colonia (por ejemplo, "PEDREGAL" aparece mal escrito como "PEDRFEGAL" o "PEDRREGAL"), que un `$regex` exacto no captura; resolverlo requeriría normalización adicional o búsqueda difusa, fuera del alcance de este proyecto.
- Ni el patrón anclado ni el sin anclar acotan `totalKeysExamined` en este proyecto, por la bandera `i` (ver "Hallazgo real"); el costo de ambos crece de forma similar con el tamaño de la colección.
- No se implementó `$text` en esta versión del proyecto porque el campo analizado no es texto libre, según se justifica arriba. Si el proyecto incorporara en el futuro un campo narrativo (por ejemplo, una descripción libre del incidente), `$text` volvería a ser la opción pertinente y debería revisarse en ese momento.
