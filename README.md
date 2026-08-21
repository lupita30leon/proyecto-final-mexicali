# Análisis de delitos en Mexicali con MongoDB

Proyecto académico de bases de datos NoSQL desarrollado a partir del conjunto de datos **Mexicali Crimes**, obtenido de Kaggle.

El proyecto transforma un archivo CSV con registros delictivos en una colección documental de MongoDB preparada para realizar consultas funcionales, análisis temporales, búsquedas geoespaciales, validaciones de calidad y pruebas de rendimiento con índices.

## Objetivo

Diseñar e implementar una solución NoSQL reproducible para almacenar y analizar registros delictivos del municipio de Mexicali.

Los objetivos específicos fueron:

- Limpiar y transformar la fuente original.
- Diseñar documentos con campos anidados.
- Convertir las fechas a BSON Date.
- representar las coordenadas mediante GeoJSON.
- Ejecutar consultas y agregaciones relevantes.
- Diseñar índices de acuerdo con patrones de consulta.
- Comparar el rendimiento antes y después de crear índices.
- Configurar reglas de validación mediante JSON Schema.
- Desarrollar análisis temporales y geoespaciales.
- Documentar riesgos, seguridad, privacidad y limitaciones.
- Conservar scripts y evidencias reproducibles.

## Tecnologías utilizadas

- MongoDB 4.4
- MongoDB Shell
- Python 3
- PyMongo 3.11
- Bash
- Git y GitHub
- AWS Academy Learner Lab
- Markdown

## Conjunto de datos

| Característica | Resultado |
|---|---:|
| Registros originales, sin encabezado | 175,482 |
| Periodo cubierto | Enero de 2014 a septiembre de 2024 |
| Municipio | Mexicali |
| Clasificaciones delictivas | 16 |
| Documentos con ubicación | 140,463 |
| Documentos sin ubicación | 35,019 |
| Documentos sin nombre de lugar | 19 |

El archivo original utilizado es:

```text
datos/crimes_mxl.csv
```

El archivo contiene las columnas:

```text
CRIME_CLASSIFICATION
CRIME_SCENE
REGISTRATION_DATE
OCCURRED_DATE
CRIME_TIME
MUNICIPALITY
TYPE
X
Y
```

## Modelo documental

La información se transformó a documentos con nombres de campos descriptivos, objetos anidados, fechas BSON y ubicaciones GeoJSON.

Ejemplo simplificado:

```javascript
{
  clasificacionDelito: "HOME ROBBERY",
  fechaRegistro: ISODate("2014-01-01T00:00:00Z"),
  fechaOcurrencia: ISODate("2014-01-01T02:00:00Z"),
  lugar: {
    municipio: "MEXICALI",
    nombre: "MIRASOL",
    tipo: "SUBDIVISION"
  },
  ubicacion: {
    type: "Point",
    coordinates: [-115.3862048, 32.60621895]
  }
}
```

La base de datos y colección utilizadas son:

```text
Base de datos: m6_nosql
Colección: delitos_mexicali
```

## Estructura del repositorio

```text
proyecto-final-mexicali/
├── capturas_reporte/
│   ├── figura_4_indices.png
│   ├── figura_5_geoespacial.png
│   ├── figura_6_vista_protegida.png
│   └── figura_7_resultado.png
├── datos/
│   └── crimes_mxl.csv
├── documentacion/
│   ├── 00_planteamiento_problema.md
│   ├── 01_preparacion_datos.md
│   ├── 02_consultas_iniciales.md
│   ├── 03_indices_rendimiento.md
│   ├── 04_validacion_calidad.md
│   ├── 05_analisis_geoespacial.md
│   ├── 06_analisis_temporal.md
│   ├── 07_seguridad_privacidad.md
│   ├── 08_conclusiones.md
│   ├── 09_verificacion_guias.md
│   └── 10_busqueda.md
├── resultados/
│   ├── preparacion_csv.txt
│   ├── carga_mongodb.txt
│   ├── consultas_funcionales.txt
│   ├── medicion_antes_indices.txt
│   ├── creacion_indices.txt
│   ├── medicion_despues_indices.txt
│   ├── perfil_calidad.txt
│   ├── aplicacion_validador.txt
│   ├── refuerzo_validador_geografico.txt
│   ├── pruebas_validador.txt
│   ├── perfil_geoespacial.txt
│   ├── analisis_geoespacial.txt
│   ├── pruebas_geograficas_adicionales.txt
│   ├── analisis_temporal.txt
│   ├── evidencia_final.txt
│   ├── busqueda_lugares.txt
│   ├── salida_protegida_rol_consulta.txt
│   └── seguridad_roles_acceso.txt
├── scripts/
│   ├── preparar_csv.sh
│   ├── cargar_mongodb.py
│   ├── consultas_funcionales.js
│   ├── medicion_antes_indices.js
│   ├── crear_indices.js
│   ├── medicion_despues_indices.js
│   ├── perfil_calidad.js
│   ├── aplicar_validador.js
│   ├── reforzar_validador_geografico.js
│   ├── probar_validador.js
│   ├── perfil_geoespacial.js
│   ├── analisis_geoespacial.js
│   ├── pruebas_geograficas_adicionales.js
│   ├── analisis_temporal.js
│   ├── evidencia_final.js
│   ├── busqueda_lugares.js
│   ├── salida_protegida_rol_consulta.js
│   ├── seguridad_roles_acceso.js
│   └── ejecutar_proyecto.sh
├── .gitignore
├── monkeydata_proyecto_nosql.pdf
└── README.md
```

## Preparación del entorno

El proyecto se desarrolló en AWS Academy Learner Lab utilizando MongoDB Community 4.4.

Para iniciar MongoDB:

```bash
source ~/m6-nosql/setup/lib/mongodb_local.sh
mongodb_iniciar
```

Para clonar el repositorio:

```bash
git clone https://github.com/lupita30leon/proyecto-final-mexicali.git
cd proyecto-final-mexicali
```

## Ejecución completa

El ejecutor general realiza las actividades en el orden correcto:

1. Prepara el CSV.
2. Carga y transforma los documentos.
3. Ejecuta las consultas funcionales.
4. Mide el rendimiento sin índices especializados.
5. Crea los índices compuestos.
6. Mide nuevamente el rendimiento.
7. Genera el perfil de calidad.
8. Aplica el validador.
9. Refuerza los intervalos geográficos del validador.
10. Ejecuta las pruebas del validador.
11. Genera el perfil geoespacial.
12. Ejecuta el análisis de proximidad.
13. Ejecuta las pruebas geográficas adicionales.
14. Ejecuta el análisis temporal.
15. Ejecuta la búsqueda de lugares por patrón.
16. Genera la salida protegida para el rol de consulta.
17. Diseña los roles y comprueba el control de acceso.
18. Comprueba el resultado final.

El comando de ejecución es:

```bash
cd ~/proyecto-final-mexicali
bash scripts/ejecutar_proyecto.sh --confirmar
```

Este comando reconstruye la colección `delitos_mexicali`. Debe utilizarse únicamente cuando se desee reproducir el proyecto completo.

## Consultas desarrolladas

Las consultas funcionales permiten identificar:

- Las clasificaciones delictivas más frecuentes.
- La cantidad de registros por año.
- La distribución de registros por hora.
- Los lugares con más registros de robo de vehículo.

La clasificación con mayor frecuencia fue `VEHICLE THEFT`, con 37,331 registros.

Los lugares con más registros de robo de vehículo fueron:

| Lugar | Registros |
|---|---:|
| INDEPENDENCIA | 968 |
| GONZALEZ ORTEGA | 899 |
| NUEVA | 847 |
| VALLE DEL PEDREGAL | 824 |
| CENTRO CIVICO | 737 |

## Índices y rendimiento

Se crearon los siguientes índices:

```javascript
{
  clasificacionDelito: 1,
  fechaOcurrencia: -1,
  _id: 1
}
```

```javascript
{
  "lugar.nombre": 1,
  fechaOcurrencia: -1,
  _id: 1
}
```

```javascript
{
  ubicacion: "2dsphere"
}
```

Comparación de rendimiento, con las métricas de `explain("executionStats")` antes y después de crear los índices:

| Consulta | Plan antes | nReturned antes | Keys antes | Docs antes | Plan después | nReturned después | Keys después | Docs después |
|---|---|---:|---:|---:|---|---:|---:|---:|
| A. Robo de vehículo durante 2023 | `COLLSCAN` + `SORT` | 20 | 0 | 175,482 | `IXSCAN` cubierto (`PROJECTION_COVERED`) | 20 | 20 | 0 |
| B. Valle del Pedregal entre 2020 y 2024 | `COLLSCAN` + `SORT` | 20 | 0 | 175,482 | `IXSCAN` + `FETCH` | 20 | 20 | 20 |

**¿Por qué la consulta A pasa a 0 documentos examinados y 20 llaves examinadas?** Porque los tres campos que la consulta necesita devolver (`_id`, `clasificacionDelito`, `fechaOcurrencia`) ya forman parte de las llaves del índice `idx_clasificacion_fecha_id`. MongoDB puede resolver toda la consulta leyendo únicamente el índice (`totalKeysExamined = 20`, una llave por cada uno de los 20 resultados) sin abrir ningún documento de la colección (`totalDocsExamined = 0`): es un índice cubierto. La consulta B, en cambio, necesita `"lugar.nombre"`, que no es un valor devuelto por su índice, así que MongoDB sí abre los 20 documentos (`FETCH`) después de localizar las 20 llaves. El detalle campo por campo está en [Índices y rendimiento](documentacion/03_indices_rendimiento.md).

Los documentos recuperados (identificadores, primera y última fecha, orden) fueron los mismos antes y después de la optimización.

## Validación y calidad

Se configuró un validador JSON Schema con:

```javascript
validationLevel: "strict"
validationAction: "error"
```

Las reglas controlan:

- Campos obligatorios.
- Tipos BSON.
- Clasificaciones permitidas.
- Municipio permitido.
- Tipos de lugar permitidos.
- Estructura GeoJSON.
- Cantidad de coordenadas.
- Propiedades no definidas.

Se ejecutaron once casos de prueba:

| Resultado | Casos |
|---|---:|
| Documentos válidos aceptados | 2 |
| Documentos inválidos rechazados | 9 |
| Resultados diferentes de lo esperado | 0 |

## Análisis geoespacial

Responde la pregunta 5 del proyecto: ¿cuántos robos de vehículo se encuentran dentro de cinco kilómetros de una ubicación de referencia registrada en Mirasol? Se utilizó como referencia una ubicación real de Mirasol porque reutiliza el mismo registro del modelo documental (trazabilidad) y porque varios eventos comparten esa coordenada exacta, lo que permite construir un caso de control verificable a mano. Mirasol **no** se eligió por ser la colonia con más incidencia: esa comparación no se hizo.

```javascript
{
  type: "Point",
  coordinates: [-115.3862048, 32.60621895]
}
```

Dentro de un radio de cinco kilómetros se encontraron:

| Indicador | Resultado |
|---|---:|
| Robos de vehículo | 9,513 |
| Distancia promedio | 2,721.06 metros |
| Distancia máxima observada | 4,989.75 metros |

Este resultado es un conteo absoluto dentro de un radio fijo, no una tasa ni una medida de riesgo: no existe un denominador de población, vehículos registrados o exposición por zona, y no se comparó contra otros puntos de referencia. El detalle de esta interpretación está en [Análisis geoespacial](documentacion/05_analisis_geoespacial.md).

Algunos documentos comparten exactamente las mismas coordenadas. Por esa razón, varios resultados presentan una distancia de cero metros.

## Análisis temporal

La colección cubre desde el 1 de enero de 2014 hasta el 30 de septiembre de 2024.

El lunes presentó la mayor cantidad de registros, con 27,260.

Las horas con mayor cantidad de registros fueron:

| Hora | Registros |
|---|---:|
| 12:00 | 11,895 |
| 08:00 | 11,533 |
| 10:00 | 9,140 |
| 00:00 | 8,725 |
| 20:00 | 8,510 |

El año 2024 contiene solamente información hasta septiembre, por lo que no representa un año completo.

## Búsqueda de lugares

Se implementó búsqueda estructurada con `$regex` sobre `lugar.nombre`, en lugar de `$text`, porque el campo es un nombre propio corto (una colonia o fraccionamiento) y no texto libre. El detalle de la justificación está en [Búsqueda](documentacion/10_busqueda.md).

La evidencia real (no sólo teórica) mostró algo que vale la pena señalar: ni el patrón anclado ni el patrón sin anclar logran acotar `totalKeysExamined` al usar la bandera `i` (insensible a mayúsculas), porque esa bandera le impide al planificador calcular un rango de índice. Ambos casos recorren prácticamente el índice completo (175,463 llaves); la diferencia real está en cuántos documentos requieren `FETCH` después.

| Caso | Patrón | Etapas | Keys examinadas | Docs examinados (FETCH) | Qué demuestra |
|---|---|---|---:|---:|---|
| Prefijo anclado | `/^VALLE/i` | FETCH, IXSCAN | 175,463 | 10,297 | El anclaje no basta para acotar el índice cuando la búsqueda es insensible a mayúsculas |
| Subcadena sin anclar | `/PEDREGAL/i` | FETCH, IXSCAN | 175,463 | 3,605 | El índice reduce el `FETCH`, no el recorrido de llaves |
| Combinado con filtro temático | `/PEDREGAL/i` + `VEHICLE THEFT` | Igual que el caso anterior + filtro de igualdad | — | — | La búsqueda por patrón se integra con los filtros ya usados en el proyecto |
| Control de exclusión | `/ZZZZ_COLONIA_INEXISTENTE/i` | No aplica | 0 | 0 | Confirma 0 coincidencias para un patrón inexistente |

## Evidencia final

El script `scripts/evidencia_final.js` comprueba automáticamente:

- Cantidad de documentos.
- Tipos de fechas.
- Cobertura geográfica.
- Índices compuestos.
- Índice geoespacial.
- Configuración del validador.
- Clasificación más frecuente.
- Resultado de la consulta de proximidad.
- Existencia de la vista protegida `vista_publica_delitos`.
- Existencia de los cuatro roles de privilegio mínimo.

Resultado real, obtenido en AWS Academy Learner Lab después de correr los 18 pasos del ejecutor (`resultados/evidencia_final.txt`):

```text
Total de comprobaciones: 13
Comprobaciones correctas: 13
Comprobaciones con falla: 0
Resultado general: PROYECTO VERIFICADO CORRECTAMENTE
```

Las dos comprobaciones nuevas frente a la primera versión son la existencia de la vista `vista_publica_delitos` y la existencia de los cuatro roles de privilegio mínimo.

## Documentación

La explicación detallada de cada etapa se encuentra en:

- [Planteamiento del problema](documentacion/00_planteamiento_problema.md)
- [Preparación y carga de datos](documentacion/01_preparacion_datos.md)
- [Consultas iniciales](documentacion/02_consultas_iniciales.md)
- [Índices y rendimiento](documentacion/03_indices_rendimiento.md)
- [Validación y calidad](documentacion/04_validacion_calidad.md)
- [Análisis geoespacial](documentacion/05_analisis_geoespacial.md)
- [Análisis temporal](documentacion/06_analisis_temporal.md)
- [Seguridad y privacidad](documentacion/07_seguridad_privacidad.md)
- [Conclusiones](documentacion/08_conclusiones.md)
- [Búsqueda](documentacion/09_busqueda.md)

## Seguridad y privacidad

El conjunto no contiene identificadores personales directos. Sin embargo, los datos geográficos y delictivos pueden considerarse sensibles. El detalle completo está en [Seguridad y privacidad](documentacion/07_seguridad_privacidad.md); aquí se resume lo esencial.

**Clasificación de datos.** Cada campo se clasificó como público, interno o sensible, distinguiendo el registro individual del dato ya agregado. `ubicacion.coordinates` a nivel de registro es sensible; `fechaOcurrencia` exacta es sensible; ambos se vuelven públicos sólo cuando se generalizan (colonia en vez de coordenada, mes en vez de marca de tiempo exacta).

**Minimización, generalización y enmascaramiento.** `scripts/salida_protegida_rol_consulta.js` crea la vista `vista_publica_delitos`, que excluye `_id` y `ubicacion`, generaliza la fecha a `"año-mes"` y entrega sólo conteos agregados por clasificación, colonia y periodo. Nunca expone un documento individual.

**Matriz de roles y privilegio mínimo.** `scripts/seguridad_roles_acceso.js` define cuatro roles sin herencia entre sí:

| Rol | Puede leer datos crudos | Puede escribir | Puede administrar índices |
|---|---|---|---|
| `rol_lectura_publica` | No, sólo la vista agregada | No | No |
| `rol_analista_interno` | Sí | No | No |
| `rol_carga_datos` | Sí (para verificar) | Sólo inserción | No |
| `rol_administrador_indices` | No | No | Sí |

**Credenciales fuera del código.** Ningún script contiene usuarios ni contraseñas. La conexión de desarrollo es local y sin credenciales (`mongodb://127.0.0.1:27017`); las contraseñas de prueba se leen desde variables de entorno (`PASSWORD_ANALISTA`, `PASSWORD_LECTURA`) definidas fuera del repositorio.

**Rol diseñado frente a denegación comprobada.** El servidor usado en el desarrollo no tiene `security.authorization: enabled`. Por eso los cuatro roles están **diseñados y son verificables** (`getRoles({ showPrivileges: true })`), pero la **denegación real** de una operación fuera de privilegio sólo se considera comprobada si el script detecta autenticación activa y captura el error `not authorized` correspondiente; si no la detecta, lo documenta explícitamente en lugar de asumirlo. El resultado de esa comprobación está en `resultados/seguridad_roles_acceso.txt`.

Para un ambiente de producción se recomienda además:

- Autenticación obligatoria.
- Cifrado de conexiones (TLS) y de almacenamiento.
- Un gestor de secretos (por ejemplo, AWS Secrets Manager) en vez de variables de entorno sueltas.
- Respaldos protegidos y pruebas de restauración.
- Auditoría y monitoreo de accesos.

No deben almacenarse contraseñas, llaves privadas ni cadenas de conexión con credenciales dentro del repositorio.

## Limitaciones

- Los datos representan registros disponibles en la fuente, no necesariamente todos los delitos ocurridos.
- No se dispone de población por colonia para calcular tasas.
- El año 2024 está incompleto.
- No se confirmó la zona horaria de las fechas.
- Existen documentos sin coordenadas.
- Algunas coordenadas parecen representar puntos generales compartidos.
- Las concentraciones observadas no demuestran relaciones causales.

## Reporte final

El reporte `monkeydata_proyecto_nosql.pdf`, cubre 12 secciones (resumen ejecutivo, planteamiento, fuente y preparación, modelo documental, resultados funcionales, índices y rendimiento, validación y calidad, análisis temporal, análisis geoespacial, seguridad y privacidad, reproducibilidad, limitaciones y conclusiones) e incluye:

- Figuras de los datos (clasificaciones más frecuentes, registros por año, distribución por día y mes), embebidas como imágenes.
- Capturas reales de ejecución en AWS Academy Learner Lab: el índice cubierto de la consulta A (`IXSCAN`, 0 documentos, 20 llaves), el resultado geoespacial (9,513 registros), la comparación entre el documento crudo y la vista protegida `vista_publica_delitos`, y la comprobación final (13 de 13).

## Uso académico

Este repositorio fue elaborado con fines educativos para demostrar la preparación, modelado, consulta, validación y optimización de una base documental con MongoDB.
