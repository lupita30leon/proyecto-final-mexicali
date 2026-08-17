# Consultas iniciales e interpretación

## Objetivo

Las consultas iniciales permiten explorar la distribución de los 175,482 registros delictivos de Mexicali según su clasificación, año, hora de ocurrencia y lugar.

Las salidas completas se encuentran en:

`resultados/consultas_funcionales.txt`

## Consulta 1: clasificaciones más frecuentes

La consulta agrupa los documentos por `clasificacionDelito`, cuenta los registros de cada grupo y muestra las diez clasificaciones con mayor frecuencia.

| Posición | Clasificación | Registros |
|---:|---|---:|
| 1 | VEHICLE THEFT | 37,331 |
| 2 | HOME ROBBERY | 27,816 |
| 3 | OTHER NONVIOLENT ROBBERIES | 26,985 |
| 4 | MALICIOUS INJURY | 20,977 |
| 5 | ROBBERY WITH VIOLENCE TO COMMERCE | 18,277 |
| 6 | SIMPLE THEFT (ON PUBLIC ROADS) | 10,420 |
| 7 | ROBBERY WITH VIOLENCE (IN PUBLIC STREETS) | 9,914 |
| 8 | ROBBERY TO COMMERCE | 7,228 |
| 9 | CULPABLE INJURIES | 5,930 |
| 10 | OTHER ROBBERIES WITH VIOLENCE | 3,790 |

### Interpretación

El robo de vehículo es la clasificación con mayor cantidad de registros, con 37,331 documentos. Le siguen el robo a casa habitación y otros robos sin violencia.

Estos valores permiten describir la composición del conjunto de datos, pero no demuestran por sí mismos la probabilidad individual de sufrir un delito.

## Consulta 2: registros por año

| Año | Registros |
|---:|---:|
| 2014 | 24,480 |
| 2015 | 22,743 |
| 2016 | 20,466 |
| 2017 | 20,030 |
| 2018 | 16,114 |
| 2019 | 14,204 |
| 2020 | 11,749 |
| 2021 | 12,672 |
| 2022 | 13,912 |
| 2023 | 10,348 |
| 2024 | 8,764 |

### Interpretación

Los registros presentan una disminución general entre 2014 y 2023, aunque en 2021 y 2022 se observa un aumento respecto de 2020.

El año 2024 sólo contiene información hasta septiembre, por lo que su conteo no debe compararse directamente con años que tienen doce meses completos.

La reducción de registros no demuestra necesariamente una disminución equivalente de los delitos ocurridos. También podría estar relacionada con cambios de cobertura, denuncia, captura o calidad de la fuente.

## Consulta 3: registros por hora

Las horas con mayor cantidad de registros fueron:

| Posición | Hora | Registros |
|---:|---:|---:|
| 1 | 12:00 | 11,895 |
| 2 | 08:00 | 11,533 |
| 3 | 10:00 | 9,140 |
| 4 | 00:00 | 8,725 |
| 5 | 20:00 | 8,510 |
| 6 | 21:00 | 8,426 |

### Interpretación

Las 12:00 representan la hora con mayor cantidad de registros, seguida de las 08:00 y las 10:00. También se observa una cantidad elevada durante las 20:00 y 21:00.

La consulta identifica la hora almacenada en `fechaOcurrencia`. No permite conocer la duración del evento ni establecer que el horario sea la causa del delito.

El valor de las 00:00 debe interpretarse con cautela, porque en algunas fuentes puede representar una hora real o una hora utilizada cuando el momento exacto no estaba disponible.

## Consulta 4: lugares con más robos de vehículo

| Posición | Lugar | Registros |
|---:|---|---:|
| 1 | INDEPENDENCIA | 968 |
| 2 | GONZALEZ ORTEGA | 899 |
| 3 | NUEVA | 847 |
| 4 | VALLE DEL PEDREGAL | 824 |
| 5 | CENTRO CIVICO | 737 |
| 6 | PRIMERA SECCION | 711 |
| 7 | NUEVO MEXICALI | 618 |
| 8 | VALLE DE PUEBLA | 522 |
| 9 | HIDALGO | 505 |
| 10 | PROHOGAR | 463 |

### Interpretación

INDEPENDENCIA es el lugar con mayor número de registros de robo de vehículo, con 968. Le siguen GONZALEZ ORTEGA, NUEVA y VALLE DEL PEDREGAL.

Estos resultados son conteos y no tasas. No se cuenta con un denominador de población, cantidad de vehículos, extensión territorial o exposición por zona. Por ello, no puede concluirse que una persona tenga mayor riesgo únicamente por este ordenamiento.

## Limitaciones generales

- Los resultados describen los registros incluidos en la fuente.
- Los conteos no representan tasas de incidencia.
- No se analizan causas del delito.
- Puede existir subregistro o cambios en los criterios de captura.
- El año 2024 es un periodo incompleto.
- Las asociaciones temporales o territoriales no demuestran causalidad.
