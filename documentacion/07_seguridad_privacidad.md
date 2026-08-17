# Seguridad y protección de datos

## Entorno utilizado

La solución se ejecuta con MongoDB Community dentro de AWS Academy Learner Lab. El servidor MongoDB se encuentra disponible únicamente en la dirección local:

```text
127.0.0.1:27017
```

La base no se expone directamente a Internet. Los scripts y la documentación se almacenan en el repositorio compartido del equipo.

## Información contenida

El conjunto de datos no incluye nombres de personas, correos electrónicos, teléfonos, identificaciones oficiales ni números de cuenta.

Sin embargo, las coordenadas de eventos pueden considerarse información sensible porque una ubicación puede contribuir a identificar o caracterizar un registro. Por esta razón:

- No se agregaron domicilios personales.
- No se generaron trayectorias individuales.
- No se intentó identificar personas.
- Los resultados se interpretan principalmente de forma agregada.
- El punto geoespacial de referencia proviene del conjunto de datos.

## Control de acceso

Durante el desarrollo:

- Sólo las integrantes autorizadas deben tener acceso de escritura al repositorio.
- Cada integrante debe utilizar su propia cuenta de GitHub.
- Las claves SSH privadas no deben compartirse.
- No deben almacenarse tokens o contraseñas dentro de los scripts.
- Los permisos deben seguir el principio de mínimo privilegio.

En un entorno productivo se crearían usuarios separados para administración, carga, consulta y lectura de reportes.

## Credenciales y secretos

El repositorio no debe contener:

- Contraseñas.
- Tokens de GitHub.
- Claves SSH privadas.
- Archivos `.pem`.
- Cadenas de conexión con credenciales.
- Variables de entorno con secretos.
- Copias de configuración personal.

La conexión utilizada en los scripts es local y no contiene usuario ni contraseña:

```text
mongodb://127.0.0.1:27017
```

Esta configuración es adecuada para el laboratorio aislado, pero un entorno productivo debe habilitar autenticación.

## Protección en producción

Una implementación productiva debería incorporar:

- Autenticación obligatoria.
- Roles con mínimo privilegio.
- Cifrado en tránsito mediante TLS.
- Cifrado en reposo.
- Administración segura de secretos.
- Restricciones de red y firewall.
- Copias de seguridad.
- Pruebas periódicas de restauración.
- Registro y auditoría de accesos.
- Monitoreo de cambios y operaciones.
- Política de retención y eliminación de datos.

## Integridad y calidad

El proyecto utiliza:

- Scripts reproducibles de transformación y carga.
- Validación mediante `$jsonSchema`.
- Dominios permitidos.
- Comprobación de tipos BSON.
- Validación de estructura GeoJSON.
- Casos válidos e inválidos.
- Evidencia antes y después de los índices.

Estas medidas reducen el riesgo de cargar documentos incompletos o con estructuras inconsistentes.

## Protección de la fuente original

El archivo `crimes_mxl.csv` se conserva sin modificaciones. La limpieza genera una copia nueva y reproducible.

No se eliminan registros sin documentar el criterio. Los documentos sin coordenadas se conservan y quedan fuera de las consultas geoespaciales.

## Riesgos y limitaciones

- El entorno de laboratorio no representa una arquitectura productiva completa.
- La conexión local no utiliza autenticación.
- La precisión de las coordenadas depende de la fuente.
- Un dato público no deja de requerir un uso responsable.
- La ubicación de un evento no debe interpretarse como ubicación de una persona.
- Los resultados agregados no deben utilizarse para estigmatizar lugares o habitantes.
- La compatibilidad con MongoDB Community no implica compatibilidad automática con Amazon DocumentDB.

## Criterios para compartir resultados

Al compartir resultados deben preferirse tablas agregadas, conteos por periodo y análisis por zona. No deben publicarse coordenadas individuales adicionales cuando no sean necesarias para demostrar el funcionamiento técnico.
