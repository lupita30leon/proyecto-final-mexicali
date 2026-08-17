# Verificación de las guías de avance

## Alcance de la revisión

Esta matriz compara los elementos del proyecto con las guías de avance de las semanas 2 y 3.

La revisión considera:

- Planteamiento del problema.
- Preguntas y personas usuarias.
- Modelo documental.
- Procedencia y protección de los datos.
- Consultas e índices.
- Medición de rendimiento.
- Validación y calidad.
- Análisis geoespacial.
- Casos de control.
- Reproducibilidad.
- Interpretación y limitaciones.

## Semana 2: rendimiento y calidad

| Requisito | Estado | Evidencia |
|---|---|---|
| Título y descripción del problema | Cumplido | `documentacion/00_planteamiento_problema.md` |
| Personas usuarias y decisiones apoyadas | Cumplido | `documentacion/00_planteamiento_problema.md` |
| Entre tres y cinco preguntas concretas | Cumplido | Se documentaron cinco preguntas |
| Colección principal identificada | Cumplido | Base `m6_nosql`, colección `delitos_mexicali` |
| Documentos JSON representativos | Cumplido | `README.md` y documento de planteamiento |
| Justificación de anidamiento o referencias | Cumplido | Se justificaron `lugar` y `ubicacion` como objetos incrustados |
| Datos públicos y sin información personal directa | Cumplido | `documentacion/00_planteamiento_problema.md` y `07_seguridad_privacidad.md` |
| Procedencia de los datos | Cumplido | Kaggle, conjunto `Mexicali Crimes`, archivo y fecha registrados |
| Consultas relevantes | Cumplido | `scripts/consultas_funcionales.js` |
| Dos patrones de consulta para rendimiento | Cumplido | Robo de vehículo en 2023 y Valle del Pedregal entre 2020 y 2024 |
| Campos de igualdad, rango y ordenamiento documentados | Cumplido | `documentacion/03_indices_rendimiento.md` |
| Medición antes de crear índices | Cumplido | `resultados/medicion_antes_indices.txt` |
| Uso de `executionStats` | Cumplido | Se conservaron plan, resultados, llaves y documentos examinados |
| Creación de índices con nombres descriptivos | Cumplido | `scripts/crear_indices.js` |
| Verificación mediante `getIndexes()` | Cumplido | `resultados/creacion_indices.txt` |
| Medición posterior con las mismas consultas | Cumplido | `resultados/medicion_despues_indices.txt` |
| Comparación antes y después | Cumplido | `documentacion/03_indices_rendimiento.md` |
| Comprobación de resultados sin cambios | Cumplido | Identificadores y fechas coincidieron |
| Costos y limitaciones de los índices | Cumplido | `documentacion/03_indices_rendimiento.md` |
| Diccionario de datos | Cumplido | `documentacion/04_validacion_calidad.md` |
| Campos obligatorios y opcionales | Cumplido | Documentados y configurados |
| Tipos BSON y dominios | Cumplido | Validador JSON Schema |
| Documentos válidos e inválidos | Cumplido | 2 válidos y 9 inválidos |
| Al menos cuatro inconsistencias diferentes | Cumplido | Se probaron nueve inconsistencias |
| Explicación de cada prueba | Cumplido | Resultados relacionados con reglas concretas |
| Scripts reproducibles | Cumplido | `scripts/ejecutar_proyecto.sh` |
| Entorno de MongoDB Community identificado | Cumplido | AWS Academy Learner Lab con MongoDB Community 4.4 |

## Resultado de la semana 2

La estrategia de indexación redujo el trabajo de las dos consultas seleccionadas.

| Consulta | Documentos examinados antes | Documentos examinados después |
|---|---:|---:|
| Robo de vehículo durante 2023 | 175,482 | 0 |
| Valle del Pedregal entre 2020 y 2024 | 175,482 | 20 |

El validador aceptó los documentos correctos y rechazó las inconsistencias estructurales y geográficas probadas.

## Semana 3: análisis geoespacial

| Requisito | Estado | Evidencia |
|---|---|---|
| Pertinencia del análisis geoespacial | Cumplido | Tabla de decisión en `00_planteamiento_problema.md` |
| Pregunta con relación espacial explícita | Cumplido | Robos de vehículo dentro de cinco kilómetros |
| Entidad y geometría identificadas | Cumplido | Registro delictivo representado como GeoJSON `Point` |
| Fuente y fecha de incorporación | Cumplido | Kaggle y fecha registradas |
| Orden longitud-latitud | Cumplido | Documentado y comprobado |
| Intervalos válidos | Cumplido | 140,463 ubicaciones revisadas |
| Granularidad y precisión reconocidas | Cumplido | Se documentaron coordenadas compartidas y posible aproximación |
| Protección de ubicaciones | Cumplido | `07_seguridad_privacidad.md` |
| Estructura GeoJSON | Cumplido | `type` separado de `coordinates` |
| Geometría válida | Cumplido | Documento completo aceptado |
| Tipo geométrico incorrecto | Cumplido | `LineString` rechazado |
| Coordenadas incompletas | Cumplido | Arreglo de un elemento rechazado |
| Longitud fuera del intervalo | Cumplido | `[200, 32.60621895]` rechazado |
| Latitud fuera del intervalo | Cumplido | `[-115.3862048, 95]` rechazado |
| Diccionario y validador ampliados | Cumplido | `documentacion/04_validacion_calidad.md` |
| Índice `2dsphere` | Cumplido | `idx_ubicacion_2dsphere` |
| Verificación con `getIndexes()` | Cumplido | `resultados/analisis_geoespacial.txt` |
| Cantidad de geometrías utilizables | Cumplido | 140,463 |
| Operador espacial pertinente | Cumplido | `$geoNear` para proximidad y cálculo de distancia |
| `$geoNear` como primera etapa | Cumplido | `scripts/analisis_geoespacial.js` |
| Punto y distancia máxima definidos | Cumplido | Mirasol y 5,000 metros |
| Selección comprobada antes de agrupar | Cumplido | Diez registros cercanos revisados |
| Filtro temático posterior | Cumplido | `clasificacionDelito: "VEHICLE THEFT"` |
| Resultado agregado | Cumplido | 9,513 registros y distancia promedio |
| Caso incluido | Cumplido | Robo de vehículo dentro del radio |
| Caso excluido por distancia | Cumplido | Pórticos del Valle a 5,032.37 metros |
| Caso excluido por filtro temático | Cumplido | Lesiones culposas en Mirasol |
| Interpretación y limitaciones | Cumplido | `documentacion/05_analisis_geoespacial.md` |
| Diferencia entre conteo y tasa | Cumplido | Se reconoce la ausencia de denominador |
| Diferencia entre asociación y causalidad | Cumplido | Se documentó explícitamente |

## Resultado de la semana 3

La relación espacial fue pertinente porque permitió seleccionar registros según su distancia respecto de un punto de referencia.

El índice `idx_ubicacion_2dsphere` permitió utilizar `$geoNear`. La consulta identificó 9,513 registros de robo de vehículo dentro de cinco kilómetros del punto de referencia.

Los casos de control demostraron que:

- Un documento dentro del radio puede excluirse por no cumplir la clasificación.
- Un documento puede excluirse por superar la distancia máxima.
- La selección espacial y el filtro temático cumplen funciones diferentes.
- El conteo obtenido no representa una tasa.
- La proximidad no demuestra causalidad.

## Reproducibilidad

El archivo `scripts/ejecutar_proyecto.sh` reconstruye el proyecto en quince etapas.

El proceso parte de la fuente original y termina con once comprobaciones automáticas.

Para impedir una reconstrucción accidental, el ejecutor requiere:

```bash
bash scripts/ejecutar_proyecto.sh --confirmar
```

## Observaciones pendientes para uso externo

Dentro del contexto académico, la procedencia se registró mediante plataforma, nombre del conjunto, archivo y fecha de incorporación.

Antes de distribuir la fuente fuera del proyecto debe verificarse en la ficha original de Kaggle:

- Autor o responsable de la publicación.
- Enlace exacto.
- Licencia de reutilización.
- Condiciones de redistribución.

Estas observaciones no afectan la ejecución técnica, pero sí deben resolverse antes de una publicación externa de los datos.

## Conclusión de la auditoría

Los requisitos técnicos y documentales indicados en las guías de las semanas 2 y 3 se encuentran cubiertos mediante scripts, resultados y documentación reproducibles.

La evidencia no se limita a capturas de pantalla: cada consulta, índice, regla y prueba cuenta con un archivo ejecutable y una salida conservada en el repositorio.
