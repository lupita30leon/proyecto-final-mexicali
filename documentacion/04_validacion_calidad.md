# Calidad de datos y validación

## Perfil de la colección

Antes de crear el validador se revisaron la presencia, los tipos y los dominios de los campos de los 175,482 documentos.

| Comprobación | Resultado |
|---|---:|
| Total de documentos | 175,482 |
| Sin clasificación | 0 |
| Clasificación tipo string | 175,482 |
| Sin fecha de registro | 0 |
| Fecha de registro BSON Date | 175,482 |
| Sin fecha de ocurrencia | 0 |
| Fecha de ocurrencia BSON Date | 175,482 |
| Sin documento lugar | 0 |
| Sin municipio | 0 |
| Sin nombre de lugar | 19 |
| Sin tipo de lugar | 35,019 |
| Con ubicación | 140,463 |
| Sin ubicación | 35,019 |
| Ubicaciones tipo Point | 140,463 |

El único municipio observado fue `MEXICALI`.

Los tipos de lugar encontrados fueron:

- `CITY`
- `COLONY`
- `SUBDIVISION`

Se encontraron 16 clasificaciones delictivas.

## Diccionario de datos

| Campo | Tipo BSON | Presencia | Restricción y justificación |
|---|---|---|---|
| `_id` | objectId | Automático | Identificador único generado por MongoDB |
| `clasificacionDelito` | string | Obligatorio | Debe pertenecer a las 16 clasificaciones observadas |
| `fechaRegistro` | date | Obligatorio | Debe ser BSON Date |
| `fechaOcurrencia` | date | Obligatorio | Debe ser BSON Date |
| `lugar` | object | Obligatorio | Agrupa los atributos territoriales |
| `lugar.municipio` | string | Obligatorio | Sólo admite `MEXICALI` |
| `lugar.nombre` | string | Opcional | Falta en 19 documentos |
| `lugar.tipo` | string | Opcional | Falta en 35,019 documentos |
| `ubicacion` | object | Opcional | Falta en 35,019 documentos |
| `ubicacion.type` | string | Obligatorio si existe ubicación | Sólo admite `Point` |
| `ubicacion.coordinates` | array | Obligatorio si existe ubicación | Debe contener exactamente dos números |

## Reglas implementadas

El validador se aplicó mediante `collMod` sobre la colección `delitos_mexicali`.

Se configuró con:

```javascript
validationLevel: "strict"
validationAction: "error"
```

Las reglas controlan:

- Tipo del documento raíz.
- Campos obligatorios.
- Tipos BSON.
- Dominio de clasificación delictiva.
- Dominio del municipio.
- Dominio del tipo de lugar.
- Estructura de los objetos anidados.
- Ausencia de propiedades no definidas.
- Estructura GeoJSON.
- Tipo geométrico `Point`.
- Dos coordenadas numéricas.

El resultado de `collMod` fue:

```javascript
{ "ok": 1 }
```

## Campos opcionales

`lugar.nombre`, `lugar.tipo` y `ubicacion` no se declararon obligatorios porque la fuente contiene documentos que no cuentan con esos valores.

No se inventaron nombres de lugar, tipos de zona ni coordenadas para completar los registros.

## Casos de prueba

Las pruebas se realizaron en la colección separada `delitos_mexicali_pruebas_validacion`, utilizando el mismo validador de la colección principal.

| Caso | Documento | Esperado | Obtenido | Regla |
|---:|---|---|---|---|
| 1 | Documento completo | Aceptado | Aceptado | Cumple campos, tipos, dominios y GeoJSON |
| 2 | Documento sin campos opcionales | Aceptado | Aceptado | Nombre, tipo y ubicación son opcionales |
| 3 | Falta clasificación | Rechazado | Rechazado | `clasificacionDelito` es obligatorio |
| 4 | Fecha como texto | Rechazado | Rechazado | `fechaRegistro` debe ser BSON Date |
| 5 | Clasificación inventada | Rechazado | Rechazado | No pertenece al dominio permitido |
| 6 | Falta municipio | Rechazado | Rechazado | `lugar.municipio` es obligatorio |
| 7 | Tipo de lugar inválido | Rechazado | Rechazado | Sólo se permiten tres tipos |
| 8 | Geometría LineString | Rechazado | Rechazado | La geometría debe ser Point |
| 9 | Una sola coordenada | Rechazado | Rechazado | Se requieren exactamente dos números |

Los nueve casos produjeron el resultado esperado. La colección de pruebas conservó únicamente los dos documentos válidos.

## Validación estructural y semántica

El `$jsonSchema` comprueba la estructura de la geometría, pero la transformación en Python también valida que:

- La longitud esté entre -180 y 180.
- La latitud esté entre -90 y 90.
- Ambas coordenadas estén disponibles.
- El orden sea longitud-latitud.

Una estructura válida no demuestra que la coordenada sea exacta, vigente o adecuada para una decisión.

## Consideraciones

La aplicación del validador no modifica ni vuelve a evaluar automáticamente todos los documentos existentes. Por ello se conservó también el perfil de calidad previo.

Las reglas representan los requisitos actuales del proyecto. Si la fuente incorpora nuevas clasificaciones o municipios, el dominio deberá revisarse antes de cargar esos documentos.


## Validación de intervalos geográficos

El JSON Schema controla la estructura del objeto GeoJSON, el tipo `Point`, la presencia del arreglo `coordinates` y que sus dos elementos sean numéricos.

Adicionalmente, el validador se reforzó mediante reglas de consulta para comprobar los intervalos correspondientes a GeoJSON:

- La longitud debe encontrarse entre -180 y 180.
- La latitud debe encontrarse entre -90 y 90.
- Los documentos sin el campo opcional `ubicacion` continúan siendo válidos.

Antes de aplicar estas reglas se comprobó que ninguno de los 140,463 documentos con ubicación estuviera fuera de los intervalos permitidos.

El validador final combina:

```javascript
{
  $and: [
    {
      $jsonSchema: {
        // Reglas estructurales del documento.
      }
    },
    {
      $or: [
        {
          ubicacion: {
            $exists: false
          }
        },
        {
          $and: [
            {
              "ubicacion.coordinates.0": {
                $gte: -180,
                $lte: 180
              }
            },
            {
              "ubicacion.coordinates.1": {
                $gte: -90,
                $lte: 90
              }
            }
          ]
        }
      ]
    }
  ]
}
```

Esta combinación distingue entre la estructura del documento y la validez semántica de los intervalos geográficos.

## Pruebas adicionales de coordenadas

Se agregaron dos casos inválidos para comprobar los límites:

| Caso | Coordenadas | Resultado esperado | Resultado obtenido |
|---|---|---|---|
| Longitud fuera del intervalo | `[200, 32.60621895]` | Rechazado | Rechazado |
| Latitud fuera del intervalo | `[-115.3862048, 95]` | Rechazado | Rechazado |

Ambos documentos fueron rechazados con `Document failed validation`.

Considerando las pruebas originales y las adicionales, se verificaron:

- 2 documentos válidos aceptados.
- 9 documentos inválidos rechazados.
- 11 comportamientos coincidentes con el resultado esperado.
- 0 fallas.

Los mensajes del motor se conservaron como evidencia, pero la explicación de cada resultado se relacionó con la regla específica que fue evaluada.
