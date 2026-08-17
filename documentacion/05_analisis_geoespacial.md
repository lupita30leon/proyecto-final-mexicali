# Análisis geoespacial

## Pertinencia

El componente geoespacial es pertinente porque la ubicación permite seleccionar y ordenar registros según su proximidad a un punto de referencia. Esto ayuda a responder qué delitos se encuentran dentro de un radio determinado y cómo se distribuyen sus distancias.

La relación espacial modifica directamente la selección y el orden de los documentos, por lo que no se incorporó únicamente para mostrar un mapa.

## Datos geográficos

La geometría representa la ubicación asociada con un registro delictivo y se almacena como un punto GeoJSON:

```javascript
{
  type: "Point",
  coordinates: [
    longitud,
    latitud
  ]
}
```

La transformación conserva el orden longitud-latitud requerido por GeoJSON y MongoDB.

| Comprobación | Resultado |
|---|---:|
| Total de documentos | 175,482 |
| Documentos con ubicación | 140,463 |
| Documentos sin ubicación | 35,019 |
| Geometrías Point | 140,463 |
| Coordenadas dentro de intervalos válidos | 140,463 |

Los intervalos observados fueron:

| Componente | Mínimo | Máximo |
|---|---:|---:|
| Longitud | -115.594338 | -114.7321086 |
| Latitud | 32.18634594 | 32.71268582 |

Los registros sin coordenadas se conservaron sin el campo `ubicacion`; no se inventaron ubicaciones para incluirlos en el análisis.

## Punto de referencia

Se utilizó como referencia una coordenada asociada con MIRASOL dentro de la propia fuente:

```javascript
{
  type: "Point",
  coordinates: [
    -115.3862048,
    32.60621895
  ]
}
```

Este punto se eligió para construir un caso de control reproducible. No corresponde a un domicilio personal proporcionado por el equipo.

## Índice geoespacial

Se creó el siguiente índice:

```javascript
{
  ubicacion: "2dsphere"
}
```

Su nombre es:

```text
idx_ubicacion_2dsphere
```

La existencia del índice se comprobó mediante `getIndexes()`. El índice utiliza la versión 3 de `2dsphere`.

## Consulta de proximidad

Se utilizó `$geoNear` como primera etapa del pipeline. La consulta seleccionó y ordenó los registros ubicados a una distancia máxima de 5,000 metros respecto del punto de referencia.

La comprobación produjo:

| Comprobación | Resultado |
|---|---:|
| Resultados mostrados | 10 |
| Orden ascendente por distancia | Correcto |
| Todos dentro de 5 km | Sí |
| Distancia máxima permitida | 5,000 metros |

Los diez registros más cercanos presentaron una distancia de cero porque distintos eventos de MIRASOL comparten exactamente la misma coordenada.

Este resultado sugiere que las coordenadas representan una ubicación general de la zona y no necesariamente el punto exacto de cada evento.

## Robos de vehículo dentro de cinco kilómetros

La consulta espacial se combinó con el filtro:

```javascript
{
  clasificacionDelito: "VEHICLE THEFT"
}
```

Los resultados fueron:

| Indicador | Resultado |
|---|---:|
| Registros de robo de vehículo | 9,513 |
| Distancia promedio | 2,721.06 metros |
| Distancia máxima observada | 4,989.75 metros |

Los 9,513 registros corresponden al subconjunto de robos de vehículo con coordenadas localizadas dentro del radio de cinco kilómetros. El resultado es un conteo y no una tasa de incidencia.

## Caso de control excluido

Se buscó un documento ubicado entre 5,000 y 10,000 metros de la referencia.

El caso encontrado correspondió a `PORTICOS DEL VALLE`, con una distancia aproximada de:

```text
5,032.37 metros
```

Este documento queda fuera de la consulta principal porque supera el límite de 5,000 metros. La prueba permite demostrar que el límite espacial incluye y excluye documentos según la distancia definida.

## Interpretación

La consulta permite identificar registros próximos a una referencia y continuar el análisis dentro de un pipeline. El filtro temático mostró que 9,513 registros de robo de vehículo se encuentran dentro del radio seleccionado.

Este resultado no permite afirmar que MIRASOL sea la zona con mayor riesgo. Para comparar riesgo entre zonas sería necesario incorporar un denominador de exposición, como población, vehículos registrados, extensión territorial o flujo de personas.

## Limitaciones

- Hay 35,019 documentos sin coordenadas que quedan fuera del análisis.
- La precisión exacta de las coordenadas depende de la fuente.
- Varios eventos comparten una misma coordenada y generan distancias de cero.
- Una distancia geométrica no equivale a tiempo de traslado o accesibilidad.
- Los conteos espaciales no son tasas.
- La proximidad no demuestra causalidad.
- Las ubicaciones se interpretan de manera agregada y no como trayectorias personales.


## Comprobación progresiva de la selección espacial

La consulta se construyó progresivamente.

Primero se utilizó `$geoNear` para recuperar los diez documentos más cercanos al punto de referencia sin limitar la clasificación delictiva. Con esto se comprobó:

- Que el índice `2dsphere` estaba disponible.
- Que las distancias se calcularon en metros.
- Que los resultados estaban ordenados de menor a mayor distancia.
- Que todos los documentos mostrados se encontraban dentro del límite de cinco kilómetros.

Después se agregó el filtro temático:

```javascript
query: {
  clasificacionDelito: "VEHICLE THEFT"
}
```

Finalmente, el subconjunto seleccionado se agrupó para calcular la cantidad de registros, la distancia promedio y la distancia máxima observada.

## Control del filtro temático

Se seleccionó un documento de control ubicado exactamente en el punto de referencia de Mirasol:

```javascript
{
  clasificacionDelito: "CULPABLE INJURIES",
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

El documento se encuentra a una distancia de cero metros respecto del punto de referencia. Por lo tanto, cumple la condición espacial.

Sin embargo, no cumple el filtro temático porque su clasificación es `CULPABLE INJURIES` y no `VEHICLE THEFT`.

Al ejecutar el pipeline geoespacial con el filtro de robo de vehículo, el documento de control presentó cero coincidencias. El comportamiento fue el esperado.

## Resumen de controles geoespaciales

| Caso de control | Condición espacial | Condición temática | Resultado esperado | Resultado obtenido |
|---|---|---|---|---|
| Registro de robo de vehículo en Mirasol | Dentro de cinco kilómetros | Cumple `VEHICLE THEFT` | Incluido | Incluido |
| Registro de lesiones culposas en Mirasol | Dentro de cinco kilómetros | No cumple `VEHICLE THEFT` | Excluido | Excluido |
| Registro en Pórticos del Valle a 5,032.37 metros | Fuera de cinco kilómetros | No determina la selección | Excluido | Excluido |

Estos controles demuestran que la proximidad y la clasificación delictiva cumplen funciones diferentes dentro de la consulta.

La ubicación determina si el documento se encuentra dentro del radio establecido, mientras que el filtro temático determina si pertenece a la clasificación que se desea analizar.
