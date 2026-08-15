# Preparación y carga de los datos

## Fuente de los datos

El conjunto de datos utilizado corresponde a registros de delitos de Mexicali, Baja California, obtenido de Kaggle:

https://www.kaggle.com/datasets/cesarlr/mexicali-crimes

El archivo original utilizado es `crimes_mxl.csv`. Los datos comprenden registros entre enero de 2014 y septiembre de 2024.

## Tamaño del conjunto

El archivo contiene 175,482 registros y nueve columnas:

- `CRIME_CLASSIFICATION`: clasificación del delito.
- `CRIME_SCENE`: colonia, fraccionamiento o lugar del registro.
- `REGISTRATION_DATE`: fecha de registro.
- `OCCURRED_DATE`: fecha de ocurrencia.
- `CRIME_TIME`: hora de ocurrencia.
- `MUNICIPALITY`: municipio.
- `TYPE`: tipo de zona.
- `X`: longitud.
- `Y`: latitud.

## Preparación realizada

El archivo original se conservó sin modificaciones. El script `scripts/preparar_csv.sh` genera una copia limpia llamada `crimes_mxl_limpio.csv`.

La limpieza elimina la marca BOM de UTF-8 que aparecía antes del nombre de la primera columna. La copia limpia no se almacena en GitHub porque puede generarse nuevamente desde el archivo original.

## Transformación documental

El script `scripts/cargar_mongodb.py` lee el CSV y transforma cada fila en un documento de MongoDB.

Las transformaciones realizadas son:

- Conversión de las fechas textuales a BSON `Date`.
- Integración de la fecha y la hora en `fechaOcurrencia`.
- Agrupación de municipio, nombre y tipo dentro de `lugar`.
- Conversión de longitud y latitud a un `Point` de GeoJSON.
- Conservación de los registros sin coordenadas mediante la omisión del campo `ubicacion`.
- Carga por lotes de 1,000 documentos.

## Resultado de la carga

La colección creada es `m6_nosql.delitos_mexicali`.

Los resultados obtenidos fueron:

| Comprobación | Resultado |
|---|---:|
| Total de documentos | 175,482 |
| Fechas de ocurrencia BSON `Date` | 175,482 |
| Documentos con ubicación | 140,463 |
| Documentos sin ubicación | 35,019 |
| Documentos sin nombre de lugar | 19 |

## Estructura resultante

Un documento representativo tiene la siguiente estructura:

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
