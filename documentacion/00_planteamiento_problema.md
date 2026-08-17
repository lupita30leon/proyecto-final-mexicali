# Planteamiento del problema

## Título del proyecto

Análisis documental, temporal y geoespacial de registros delictivos de Mexicali mediante MongoDB.

## Descripción del problema

El conjunto de datos contiene registros delictivos del municipio de Mexicali correspondientes al periodo comprendido entre enero de 2014 y septiembre de 2024. Debido al volumen de información y a la existencia de atributos categóricos, temporales y geográficos, resulta necesario contar con una estructura que permita consultar los registros de manera organizada y eficiente.

El proyecto propone una solución documental en MongoDB para transformar la fuente tabular en documentos con fechas BSON, campos anidados y ubicaciones GeoJSON. La solución permite identificar clasificaciones frecuentes, analizar distribuciones temporales, consultar lugares específicos y estudiar la proximidad de registros respecto de un punto de referencia.

## Personas usuarias

La información podría ser utilizada por:

- Personal encargado de análisis de datos municipales.
- Equipos de planeación y evaluación de seguridad pública.
- Investigadores de fenómenos urbanos y delictivos.
- Analistas que necesiten explorar patrones temporales o territoriales.
- Personal técnico responsable de mantener sistemas de consulta.

Los resultados son exploratorios y agregados. No deben utilizarse por sí solos para estimar el riesgo individual de una persona, vivienda o establecimiento.

## Decisiones y necesidades que apoya

La solución puede apoyar las siguientes actividades:

- Identificar clasificaciones delictivas que requieren un análisis más detallado.
- Reconocer periodos con mayor cantidad de registros.
- Detectar lugares con concentraciones relevantes dentro de la fuente.
- Consultar registros recientes de una clasificación o lugar.
- Seleccionar registros cercanos a un punto de referencia.
- Evaluar si los índices reducen el trabajo realizado por MongoDB.
- Controlar que los nuevos documentos cumplan la estructura establecida.

El proyecto no pretende recomendar operativos, predecir delitos ni establecer relaciones causales.

## Preguntas del proyecto

1. ¿Cuáles son las clasificaciones delictivas con mayor número de registros?

2. ¿Cómo se distribuyen los registros por año, mes, día de la semana y hora?

3. ¿Cuáles son los veinte registros más recientes de robo de vehículo ocurridos durante 2023?

4. ¿Cuáles son los veinte registros más recientes de Valle del Pedregal ocurridos entre 2020 y 2024?

5. ¿Cuántos registros de robo de vehículo se encuentran dentro de cinco kilómetros de una ubicación de referencia registrada en Mirasol?

Estas preguntas se formularon en términos del problema antes de seleccionar los operadores e índices de MongoDB.

## Fuente de los datos

La fuente utilizada fue el conjunto público denominado `Mexicali Crimes`, obtenido mediante Kaggle.

Registro de procedencia:

| Elemento | Descripción |
|---|---|
| Plataforma | Kaggle |
| Nombre del conjunto | Mexicali Crimes |
| Archivo utilizado | `crimes_mxl.csv` |
| Fecha de incorporación al proyecto | 14 de agosto de 2026 |
| Registros sin encabezado | 175,482 |
| Periodo observado | Enero de 2014 a septiembre de 2024 |
| Uso en el proyecto | Académico |
| Copia original | `datos/crimes_mxl.csv` |

El archivo original se conservó sin modificaciones. La limpieza y transformación se realizaron mediante scripts reproducibles.

La ficha original de Kaggle debe conservarse junto con la entrega si el equipo dispone del enlace de descarga. La autoría y licencia de la fuente deben verificarse antes de reutilizar o distribuir los datos fuera del contexto académico.

## Protección de la información

La fuente no contiene nombres, correos electrónicos, teléfonos ni otros identificadores personales directos.

Sin embargo, los registros incluyen nombres de lugares y coordenadas. Por esta razón:

- La información geográfica se considera potencialmente sensible.
- No se interpreta una coordenada como domicilio exacto.
- Los resultados se presentan principalmente de manera agregada.
- No se realizan inferencias sobre personas concretas.
- No se incorporan trayectorias ni ubicaciones personales.
- Se documentan las limitaciones de precisión de las coordenadas.

## Colección principal

La solución utiliza una sola colección principal:

```text
Base de datos: m6_nosql
Colección: delitos_mexicali
```

Cada documento representa un registro de la fuente.

No se crearon colecciones relacionadas porque los atributos de lugar, fecha y ubicación pertenecen directamente a cada registro y son necesarios en las consultas principales.

## Modelo documental

Ejemplo representativo:

```javascript
{
  _id: ObjectId("6a7fadb31a330b39d9320f2c"),
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

## Justificación del modelo

### Un documento por registro

Se conservó un documento por cada fila válida del CSV. Esto permite mantener la unidad de análisis de la fuente y facilita el conteo, filtrado y agrupamiento de los registros.

### Objeto anidado para el lugar

Los campos `municipio`, `nombre` y `tipo` se agruparon en el objeto `lugar` porque describen una misma entidad territorial dentro del registro.

La información se incrustó en lugar de utilizar referencias porque:

- Se consulta junto con el registro.
- No requiere actualizaciones independientes dentro del proyecto.
- No existe una colección externa de lugares con identificadores estables.
- La lectura resulta más directa.

### Fechas BSON

`fechaRegistro` y `fechaOcurrencia` se almacenaron como BSON Date para permitir:

- Comparaciones por intervalo.
- Ordenamientos cronológicos.
- Extracción de año, mes, día y hora.
- Índices temporales.

### Ubicación GeoJSON

Las coordenadas válidas se transformaron a un objeto GeoJSON `Point`.

Se conservó el orden:

```text
longitud, latitud
```

La ubicación se dejó como campo opcional porque 35,019 registros no contienen coordenadas utilizables.

### Campos opcionales

Los siguientes campos son opcionales:

- `lugar.nombre`, ausente en 19 documentos.
- `lugar.tipo`, ausente en 35,019 documentos.
- `ubicacion`, ausente en 35,019 documentos.

Estos campos no se inventaron ni se completaron artificialmente.

## Pertinencia del análisis geoespacial

| Pregunta del problema | Entidad y geometría | Relación espacial | Decisión y justificación |
|---|---|---|---|
| ¿Cuántos robos de vehículo se encuentran dentro de cinco kilómetros de una referencia en Mirasol? | Registro delictivo representado como `Point` | Proximidad | Integrar, porque la distancia modifica la selección de documentos |
| ¿Cuáles son los registros más recientes de Valle del Pedregal? | Nombre de lugar | No requiere una relación geométrica | Utilizar filtro convencional e índice compuesto |
| ¿Cómo se distribuyen los registros por año, mes, día y hora? | Fecha de ocurrencia | No aplica | Utilizar análisis temporal |
| ¿Cuáles son las clasificaciones más frecuentes? | Clasificación delictiva | No aplica | Utilizar agregación categórica |

El componente geoespacial se incorporó únicamente en la pregunta donde la proximidad cambia el subconjunto analizado.

## Alcance

El proyecto incluye:

- Preparación y transformación del CSV.
- Carga reproducible a MongoDB.
- Consultas funcionales.
- Agregaciones temporales.
- Índices compuestos.
- Comparación de rendimiento.
- Validación JSON Schema.
- Pruebas válidas e inválidas.
- Representación GeoJSON.
- Índice `2dsphere`.
- Consulta de proximidad.
- Evidencia automatizada.
- Consideraciones de seguridad y privacidad.

## Limitaciones iniciales

- Los registros disponibles no representan necesariamente todos los delitos ocurridos.
- No se dispone de un denominador poblacional o de exposición.
- No se confirmó la zona horaria de las fechas.
- El año 2024 está incompleto.
- Algunos registros no contienen coordenadas.
- Varias observaciones comparten exactamente la misma ubicación.
- Las coordenadas podrían representar referencias generales y no puntos exactos.
- Un conteo no constituye una tasa.
- Una proximidad no demuestra causalidad ni nivel individual de riesgo.
