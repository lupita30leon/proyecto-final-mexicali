# Verificación de las guías de avance

## Alcance de la revisión

Esta matriz compara los elementos del proyecto con las guías de avance de las semanas 2 a 5.

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

El archivo `scripts/ejecutar_proyecto.sh` reconstruye el proyecto en dieciocho etapas.

El proceso parte de la fuente original y termina con trece comprobaciones automáticas, todas correctas en la última ejecución registrada en `resultados/evidencia_final.txt`.

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

## Semana 4: análisis temporal

| Requisito | Estado | Evidencia |
|---|---|---|
| Fechas BSON Date con significado, granularidad y zona horaria | Cumplido con limitación documentada | `fechaRegistro` y `fechaOcurrencia` son BSON Date; la zona horaria no se confirmó contra una fuente oficial, y esa limitación se documenta explícitamente en `documentacion/06_analisis_temporal.md` |
| Consulta por intervalo `[inicio, fin)` | Cumplido | Los filtros de las consultas A y B en `documentacion/03_indices_rendimiento.md` usan `$gte`/`$lt` |
| Índice acorde con la consulta por intervalo | Cumplido | `idx_clasificacion_fecha_id` e `idx_lugar_fecha_id` incluyen `fechaOcurrencia` como parte del patrón de claves |
| Pipeline por periodo con indicador interpretable | Cumplido | Registros por mes, por día de la semana y cobertura mensual de 2024 en `scripts/analisis_temporal.js` |
| Prueba con fechas conocidas y conclusión breve | Cumplido | La cobertura temporal (primera y última fecha) se contrasta contra el rango esperado (2014-01-01 a 2024-09-30) en `scripts/analisis_temporal.js` y se reafirma en `scripts/evidencia_final.js` |

## Semana 5: búsqueda, seguridad y privacidad

| Requisito | Estado | Evidencia |
|---|---|---|
| Decisión entre `$text` y `$regex`, con prueba de coincidencias y exclusiones | Cumplido | `documentacion/10_busqueda.md` y `scripts/busqueda_lugares.js`; incluye un caso de exclusión sin coincidencias |
| Clasificación de datos: públicos, internos o sensibles | Cumplido | Tabla por campo en `documentacion/07_seguridad_privacidad.md`, sección 1 |
| Minimización, exclusión, generalización o enmascaramiento de campos | Cumplido | Vista `vista_publica_delitos` en `scripts/salida_protegida_rol_consulta.js`, documentada en la sección 2 de `07_seguridad_privacidad.md` |
| Matriz de roles, operaciones y privilegio mínimo | Cumplido | Cuatro roles sin herencia en `scripts/seguridad_roles_acceso.js`, tabla en la sección 3 de `07_seguridad_privacidad.md` |
| Credenciales fuera del código | Cumplido | Ningún script contiene usuarios ni contraseñas; las de prueba se leen de variables de entorno (sección 4) |
| Cifrado en el entorno objetivo | Cumplido como análisis de brecha | Tabla laboratorio vs. entorno objetivo (AWS) en la sección 4 de `07_seguridad_privacidad.md`; el laboratorio en sí no cifra, y esa brecha se documenta en vez de ignorarse |
| Distinción entre rol diseñado y denegación comprobada | Cumplido | Sección 5 de `07_seguridad_privacidad.md`; el script detecta si `security.authorization` está activo y sólo reporta denegación comprobada cuando la evidencia lo respalda |

## Integración de todo el proyecto (semanas 1 a 5)

| Elemento de la lista de integración | Estado | Evidencia |
|---|---|---|
| Carga o preparación de los datos | Cumplido | `scripts/preparar_csv.sh`, `scripts/cargar_mongodb.py` |
| Consultas o pipelines principales | Cumplido | `scripts/consultas_funcionales.js`, `scripts/analisis_temporal.js`, `scripts/analisis_geoespacial.js` |
| Validador con un caso válido y otro inválido | Cumplido | `scripts/probar_validador.js`, 2 válidos y 9 inválidos |
| Índices con `getIndexes()` y `explain()` | Cumplido | `scripts/crear_indices.js`, `scripts/medicion_antes_indices.js`, `scripts/medicion_despues_indices.js` |
| Componente especializado seleccionado | Cumplido | Análisis geoespacial, justificado sobre temporal y textual en `documentacion/00_planteamiento_problema.md` |
| Salida protegida o minimizada para un rol de consulta | Cumplido | `scripts/salida_protegida_rol_consulta.js` y vista `vista_publica_delitos` |

## Conclusión de la auditoría

Los requisitos técnicos y documentales indicados en las guías de las semanas 2 a 5 se encuentran cubiertos mediante scripts, resultados y documentación reproducibles, con evidencia real capturada en AWS Academy Learner Lab para cada uno de los tres componentes de la semana 5 (búsqueda, minimización y roles).

La evidencia no se limita a capturas de pantalla: cada consulta, índice, regla y prueba cuenta con un archivo ejecutable y una salida conservada en el repositorio.
