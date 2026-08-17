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
│   └── 09_verificacion_guias.md
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
│   ├── ejecucion_completa.txt
│   └── evidencia_final.txt
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
│   └── ejecutar_proyecto.sh
├── .gitignore
└── README.md
```

## Preparación del entorno

El proyecto se desarrolló en AWS Academy Learner Lab utilizando MongoDB Community 4.4.

Para iniciar MongoDB:

```bash
source ~/m6-nosql/setup/lib/mongodb_local.sh
mongodb_iniciar
```

Para clonar este repositorio mediante SSH:

```bash
cd ~
git clone git@github.com:lupita30leon/proyecto-final-mexicali.git
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
15. Comprueba el resultado final.

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

Comparación de rendimiento:

| Consulta | Antes | Después |
|---|---:|---:|
| Robo de vehículo durante 2023 | 175,482 documentos examinados | 0 documentos y 20 llaves examinadas |
| Valle del Pedregal entre 2020 y 2024 | 175,482 documentos examinados | 20 documentos y 20 llaves examinadas |

Antes de crear los índices se utilizó `COLLSCAN`. Después de crearlos se utilizó `IXSCAN`.

Los documentos recuperados fueron los mismos antes y después de la optimización.

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

Se utilizó como referencia una ubicación registrada en Mirasol:

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

Resultado obtenido:

```text
Total de comprobaciones: 11
Comprobaciones correctas: 11
Comprobaciones con falla: 0
Resultado general: PROYECTO VERIFICADO CORRECTAMENTE
```

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
- [Verificación de las guías](documentacion/09_verificacion_guias.md)

## Seguridad y privacidad

El conjunto no contiene identificadores personales directos. Sin embargo, los datos geográficos y delictivos pueden considerarse sensibles.

Para un ambiente de producción se recomienda implementar:

- Autenticación.
- Acceso mediante roles.
- Cifrado de conexiones.
- Cifrado de almacenamiento.
- Respaldos protegidos.
- Auditoría.
- Publicación de resultados agregados.

No deben almacenarse contraseñas, llaves privadas ni cadenas de conexión con credenciales dentro del repositorio.

## Limitaciones

- Los datos representan registros disponibles en la fuente, no necesariamente todos los delitos ocurridos.
- No se dispone de población por colonia para calcular tasas.
- El año 2024 está incompleto.
- No se confirmó la zona horaria de las fechas.
- Existen documentos sin coordenadas.
- Algunas coordenadas parecen representar puntos generales compartidos.
- Las concentraciones observadas no demuestran relaciones causales.

## Uso académico

Este repositorio fue elaborado con fines educativos para demostrar la preparación, modelado, consulta, validación y optimización de una base documental con MongoDB.
