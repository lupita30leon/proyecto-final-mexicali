# Análisis temporal

## Pertinencia

El análisis temporal es pertinente porque los registros incluyen fecha y hora de ocurrencia. Esto permite estudiar cambios anuales, mensuales, semanales y horarios.

Las fechas fueron transformadas desde texto y almacenadas como BSON `Date`, lo cual permite utilizar operadores temporales de MongoDB.

## Cobertura

| Comprobación | Resultado |
|---|---|
| Primera fecha | 1 de enero de 2014, 00:00 |
| Última fecha | 30 de septiembre de 2024, 18:30 |
| Total de documentos | 175,482 |

El periodo cubre aproximadamente diez años y nueve meses. El año 2024 es incompleto y no debe compararse directamente con años de doce meses.

## Distribución mensual durante 2023

| Mes | Registros |
|---:|---:|
| Enero | 917 |
| Febrero | 790 |
| Marzo | 888 |
| Abril | 837 |
| Mayo | 885 |
| Junio | 871 |
| Julio | 889 |
| Agosto | 755 |
| Septiembre | 905 |
| Octubre | 856 |
| Noviembre | 863 |
| Diciembre | 892 |

Enero presentó la mayor cantidad mensual de 2023, con 917 registros. Septiembre ocupó la segunda posición, con 905. Agosto tuvo el menor conteo, con 755.

Las diferencias mensuales describen la fuente, pero no demuestran estacionalidad estadística ni causalidad.

## Distribución por día de la semana

| Día | Registros |
|---|---:|
| Domingo | 26,052 |
| Lunes | 27,260 |
| Martes | 24,563 |
| Miércoles | 24,642 |
| Jueves | 24,458 |
| Viernes | 24,647 |
| Sábado | 23,860 |

El lunes presentó el mayor conteo acumulado, con 27,260 registros. El sábado tuvo el menor, con 23,860.

En MongoDB, `$dayOfWeek` asigna el número 1 al domingo y el número 7 al sábado.

## Distribución por hora

La consulta inicial mostró que las horas con más registros fueron:

| Hora | Registros |
|---:|---:|
| 12:00 | 11,895 |
| 08:00 | 11,533 |
| 10:00 | 9,140 |
| 00:00 | 8,725 |
| 20:00 | 8,510 |
| 21:00 | 8,426 |

Las 12:00 presentaron el mayor conteo. El valor de las 00:00 debe interpretarse con precaución, porque podría representar una hora real o un valor utilizado cuando la hora exacta no estaba disponible.

## Cobertura mensual de 2024

| Mes | Registros |
|---:|---:|
| Enero | 1,120 |
| Febrero | 993 |
| Marzo | 1,109 |
| Abril | 1,021 |
| Mayo | 1,065 |
| Junio | 929 |
| Julio | 868 |
| Agosto | 944 |
| Septiembre | 715 |

La ausencia de octubre, noviembre y diciembre confirma que 2024 es un periodo incompleto.

## Consideraciones de fecha y hora

Las marcas temporales conservan la fecha y hora textual de la fuente. Python las interpretó sin aplicar una conversión adicional de zona horaria y PyMongo las almacenó como BSON `Date`.

Por ello, el análisis horario representa los valores de reloj contenidos en el dataset y no una conversión comprobada entre zonas horarias.

## Limitaciones

- Los conteos no son tasas temporales de riesgo.
- Los cambios pueden estar relacionados con cobertura, denuncia o captura.
- El año 2024 sólo incluye enero a septiembre.
- Una concentración horaria no demuestra causalidad.
- No se realizó una prueba estadística de estacionalidad.
- La hora 00:00 puede requerir una revisión adicional de calidad.
