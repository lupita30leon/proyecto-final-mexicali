# Conclusiones del proyecto

## Resumen del trabajo realizado

El proyecto permitió construir una solución NoSQL para almacenar, consultar y analizar registros delictivos del municipio de Mexicali.

La fuente original contenía 175,482 registros correspondientes al periodo comprendido entre el 1 de enero de 2014 y el 30 de septiembre de 2024. Los datos se limpiaron, transformaron y cargaron en MongoDB dentro de la colección `delitos_mexicali`.

Durante la transformación se utilizaron documentos con campos anidados, fechas BSON y ubicaciones con estructura GeoJSON. Esto permitió efectuar análisis temporales, geoespaciales y de rendimiento.

## Resultados principales

### Composición de la colección

La colección final contiene:

- 175,482 documentos.
- 175,482 fechas de registro almacenadas como BSON Date.
- 175,482 fechas de ocurrencia almacenadas como BSON Date.
- 140,463 documentos con ubicación geográfica.
- 35,019 documentos sin ubicación geográfica.
- 19 documentos sin nombre de lugar.
- 16 clasificaciones delictivas diferentes.

El único municipio observado fue `MEXICALI`. Los tipos de lugar identificados fueron `CITY`, `COLONY` y `SUBDIVISION`.

### Clasificaciones delictivas

La clasificación más frecuente fue `VEHICLE THEFT`, con 37,331 registros.

Las siguientes clasificaciones con mayor número de registros fueron:

1. `HOME ROBBERY`, con 27,816 registros.
2. `OTHER NONVIOLENT ROBBERIES`, con 26,985 registros.
3. `MALICIOUS INJURY`, con 20,977 registros.
4. `ROBBERY WITH VIOLENCE TO COMMERCE`, con 18,277 registros.

Estos valores representan cantidades registradas en la fuente y no deben interpretarse directamente como tasas de incidencia delictiva.

### Comportamiento temporal

La cobertura temporal inicia el 1 de enero de 2014 y termina el 30 de septiembre de 2024.

El año 2014 presentó 24,480 registros, mientras que 2023 presentó 10,348. Sin embargo, esta diferencia no permite concluir por sí sola que exista una reducción real de la delincuencia, debido a que pueden existir cambios en la cobertura, captura o publicación de la información.

El año 2024 contiene únicamente información hasta septiembre, por lo que sus 8,764 registros no deben compararse como si representaran un año completo.

El lunes fue el día con más registros, con 27,260. Las horas con mayor cantidad de registros fueron:

- 12:00, con 11,895 registros.
- 08:00, con 11,533 registros.
- 10:00, con 9,140 registros.
- 00:00, con 8,725 registros.
- 20:00, con 8,510 registros.

Los horarios corresponden a los valores almacenados en la fuente. No se confirmó una zona horaria oficial ni se realizó una conversión horaria.

### Distribución territorial

Los lugares con mayor número de registros de robo de vehículo fueron:

1. `INDEPENDENCIA`, con 968 registros.
2. `GONZALEZ ORTEGA`, con 899 registros.
3. `NUEVA`, con 847 registros.
4. `VALLE DEL PEDREGAL`, con 824 registros.
5. `CENTRO CIVICO`, con 737 registros.

Las coordenadas geográficas observadas se encontraron dentro de los siguientes intervalos:

- Longitud: de -115.594338 a -114.7321086.
- Latitud: de 32.18634594 a 32.71268582.

Para el análisis de proximidad se utilizó como referencia una ubicación registrada en Mirasol, con las coordenadas `[-115.3862048, 32.60621895]`.

Dentro de un radio de cinco kilómetros se encontraron 9,513 registros de robo de vehículo. La distancia promedio fue de 2,721.06 metros y la distancia máxima observada fue de 4,989.75 metros.

Varios documentos presentaron una distancia de cero metros porque comparten exactamente las mismas coordenadas. Esto sugiere que algunos puntos podrían representar ubicaciones generales o centroides de colonias y no necesariamente la posición exacta de cada acontecimiento.

## Rendimiento de las consultas

Antes de crear índices especializados, las dos consultas evaluadas utilizaron `COLLSCAN` y examinaron los 175,482 documentos de la colección.

La consulta de robos de vehículo durante 2023 tardó 89 milisegundos y la consulta de Valle del Pedregal tardó 91 milisegundos.

Después de crear los índices compuestos, MongoDB utilizó `IXSCAN`.

En la primera consulta se examinaron 20 llaves y ningún documento, mientras que en la segunda se examinaron 20 llaves y 20 documentos. En ambas mediciones el tiempo reportado fue de cero milisegundos.

Los identificadores y las fechas de los resultados fueron iguales antes y después de crear los índices. Por lo tanto, la optimización mejoró el plan de ejecución sin modificar el resultado funcional de las consultas.

## Calidad y validación

Se configuró un validador JSON Schema con nivel `strict` y acción `error`.

El validador controla:

- La presencia de los campos obligatorios.
- Los tipos BSON de fechas y textos.
- Las clasificaciones delictivas permitidas.
- El dominio del municipio.
- Los tipos de lugar permitidos.
- La estructura GeoJSON de las ubicaciones.
- La cantidad de coordenadas.
- La ausencia de propiedades no definidas.

Se ejecutaron nueve casos de prueba. Dos documentos válidos fueron aceptados y siete documentos inválidos fueron rechazados. Los nueve resultados coincidieron con el comportamiento esperado.

Los campos `lugar.nombre`, `lugar.tipo` y `ubicacion` se conservaron como opcionales debido a que existen documentos reales donde esos valores no están disponibles.

## Seguridad y privacidad

Aunque la base no contiene nombres, teléfonos, correos electrónicos u otros identificadores personales directos, la información geográfica y delictiva puede ser sensible.

En un entorno de producción sería necesario implementar autenticación, autorización por roles, conexiones cifradas, cifrado de almacenamiento, respaldos protegidos y registros de auditoría.

También se recomienda compartir resultados agregados y evitar publicar ubicaciones exactas cuando puedan generar riesgos para personas, viviendas o establecimientos.

El archivo CSV original se conservó sin modificaciones. Las tareas de limpieza y transformación se realizaron mediante scripts reproducibles.

## Limitaciones

El análisis presenta las siguientes limitaciones:

- Los registros representan reportes contenidos en la fuente y no todos los delitos que pudieron haber ocurrido.
- No se dispone de población por colonia para calcular tasas.
- No se conocen por completo los cambios administrativos en la captura de información.
- El año 2024 está incompleto.
- No se verificó la zona horaria de las fechas.
- Algunos registros no contienen ubicación.
- Varias observaciones comparten las mismas coordenadas.
- Una concentración de registros no demuestra causalidad ni implica necesariamente mayor riesgo individual.

## Conclusión general

MongoDB fue adecuado para este proyecto porque permitió representar la información mediante documentos flexibles, campos anidados, fechas BSON y datos geográficos GeoJSON.

Los índices compuestos redujeron considerablemente la cantidad de documentos examinados y el índice `2dsphere` permitió ejecutar consultas de proximidad.

La validación mediante JSON Schema ayudó a proteger la estructura y calidad de la colección. Los análisis funcionales, temporales y geoespaciales demostraron que la base puede utilizarse para responder preguntas relevantes, siempre que los resultados se interpreten considerando la cobertura y las limitaciones de la fuente.

El proyecto produjo una solución organizada, reproducible y documentada, con scripts independientes para preparación, carga, validación, consultas, optimización y análisis.
