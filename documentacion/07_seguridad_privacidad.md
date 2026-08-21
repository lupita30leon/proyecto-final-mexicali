# Seguridad y protección de datos

## Entorno utilizado

La solución se ejecuta con MongoDB Community dentro de AWS Academy Learner Lab. El servidor MongoDB se encuentra disponible únicamente en la dirección local:

```text
127.0.0.1:27017
```

La base no se expone directamente a Internet. Los scripts y la documentación se almacenan en el repositorio del proyecto.

## Información contenida

El conjunto de datos no incluye nombres de personas, correos electrónicos, teléfonos, identificaciones oficiales ni números de cuenta.

Sin embargo, las coordenadas de eventos pueden considerarse información sensible porque una ubicación puede contribuir a identificar o caracterizar un registro. Por esta razón:

- No se agregaron domicilios personales.
- No se generaron trayectorias individuales.
- No se intentó identificar personas.
- Los resultados se interpretan principalmente de forma agregada.
- El punto geoespacial de referencia proviene del conjunto de datos.

## 1. Clasificación de los datos

Cada campo del documento se clasificó como público, interno o sensible. La clasificación distingue explícitamente entre el **dato a nivel de registro individual** y el **mismo dato ya agregado**, porque la agregación es precisamente una de las técnicas de minimización descritas en la sección 2.

| Campo | Clasificación (registro individual) | Clasificación (agregado) | Justificación |
|---|---|---|---|
| `_id` | Interno | No aplica, se excluye siempre | Identificador técnico de MongoDB. No tiene significado de negocio, pero permite enlazar y rastrear un documento específico entre distintas consultas; no debe exponerse fuera del equipo técnico. |
| `clasificacionDelito` | Interno | Público | Por sí sola es una categoría genérica. Combinada con fecha exacta y lugar de un registro específico ayuda a reconstruir un evento reconocible; agregada por periodo o zona describe un patrón, no un evento. |
| `fechaRegistro` / `fechaOcurrencia` | Sensible | Público (si se generaliza a año-mes o similar) | La marca de tiempo exacta de un evento facilita correlacionarlo con otras fuentes externas (notas de prensa, redes sociales, testigos) y con ello reidentificar indirectamente a las personas involucradas. |
| `lugar.municipio` | Público | Público | Un único valor observado (`MEXICALI`); no añade granularidad. |
| `lugar.nombre` / `lugar.tipo` | Interno | Público | El nombre de colonia o fraccionamiento, cruzado con fecha exacta y clasificación de un registro puntual, aumenta el riesgo de que alguien reconozca un evento del que fue víctima o testigo. Agregado (conteos por colonia) es información de interés público legítimo. |
| `ubicacion.coordinates` | Sensible | Sensible salvo que se generalice o excluya | Cuasi-identificador espacial. Coordenadas repetidas evidencian puntos de referencia o domicilios agrupados; publicar el punto exacto puede facilitar localizar una vivienda o negocio concreto. |

**Regla aplicada en el proyecto:** ningún documento individual con `ubicacion.coordinates` exacta se comparte fuera del entorno técnico. Cualquier salida dirigida a un rol de consulta se entrega agregada y generalizada, según se describe en la sección 2.

## 2. Minimización, exclusión, generalización y enmascaramiento

El script `scripts/salida_protegida_rol_consulta.js` implementa las cuatro técnicas sobre el mismo campo de referencia, para dejar evidencia comparable:

| Técnica | Aplicación concreta en este proyecto |
|---|---|
| Exclusión | El campo `_id` y el objeto `ubicacion` completo se eliminan de cualquier salida destinada a un rol de consulta. |
| Generalización | `fechaOcurrencia` se reduce de marca de tiempo exacta a periodo `"año-mes"`. La ubicación puntual se reduce al nombre de colonia (`lugar.nombre`), sin coordenadas. |
| Minimización | La salida protegida sólo conserva `clasificacionDelito`, `colonia`, `periodo` y `totalRegistros`; ningún otro campo del documento original se propaga. |
| Enmascaramiento | El resultado nunca se entrega como documento individual: se agrupa (`$group`) en un conteo (`totalRegistros`) por clasificación, colonia y mes, de modo que un mismo evento no puede aislarse dentro de la salida. |

La implementación se realizó como una vista de MongoDB (`db.createView`), no como una simple convención de proyección, precisamente para que la minimización sea estructural y no dependa de que cada consulta futura recuerde excluir los campos correctos:

```javascript
curso.createView("vista_publica_delitos", "delitos_mexicali", [
  { $match: { ubicacion: { $exists: true } } },
  {
    $group: {
      _id: {
        clasificacionDelito: "$clasificacionDelito",
        colonia: "$lugar.nombre",
        periodo: { $dateToString: { format: "%Y-%m", date: "$fechaOcurrencia" } }
      },
      totalRegistros: { $sum: 1 }
    }
  },
  {
    $project: {
      _id: 0,
      clasificacionDelito: "$_id.clasificacionDelito",
      colonia: "$_id.colonia",
      periodo: "$_id.periodo",
      totalRegistros: 1
    }
  }
])
```

El rol `rol_lectura_publica` (sección 3) sólo tiene privilegio `find` sobre `vista_publica_delitos`, nunca sobre `delitos_mexicali`. Esto convierte la minimización en un control de acceso, no sólo en una recomendación documental.

La comparación campo por campo entre un documento crudo de MIRASOL y su fila equivalente en la vista protegida queda registrada en `resultados/salida_protegida_rol_consulta.txt`.

## 3. Matriz de roles, operaciones y privilegio mínimo

Los cuatro roles se definen mediante `db.createRole()` en `scripts/seguridad_roles_acceso.js`, cada uno con el conjunto mínimo de `actions` necesario para su función. Ninguno hereda privilegios de otro (`roles: []`), para que el alcance de cada uno sea explícito y auditable.

| Rol | Recurso | Operaciones (`actions`) | Puede leer datos crudos | Puede escribir | Puede administrar | Uso previsto |
|---|---|---|---|---|---|---|
| `rol_lectura_publica` | `vista_publica_delitos` | `find` | No, sólo la vista agregada | No | No | Personas usuarias externas o difusión de resultados agregados |
| `rol_analista_interno` | `delitos_mexicali` | `find` | Sí | No | No | Personal de planeación y análisis interno que necesita registros completos |
| `rol_carga_datos` | `delitos_mexicali` | `find`, `insert` | Sí (para verificar la carga) | Sólo inserción | No | Proceso ETL que transforma el CSV y carga documentos nuevos |
| `rol_administrador_indices` | `delitos_mexicali` | `createIndex`, `dropIndex`, `collMod`, `listIndexes` | No | No | Sólo estructura (índices y validador) | Persona responsable de mantenimiento de índices y del validador |

Ningún rol incluye acciones de administración de usuarios (`createUser`, `grantRole`, etc.). Esa operación se reserva a la cuenta administrativa del propio Learner Lab y no se automatiza en los scripts del proyecto.

**Principio de privilegio mínimo aplicado:**

- El rol más usado en la práctica (`rol_analista_interno`) puede leer, pero no puede insertar, modificar, eliminar ni administrar índices.
- El rol de carga (`rol_carga_datos`) puede insertar, pero no puede modificar ni eliminar lo ya cargado, ni tocar índices o el validador.
- El rol de administración de índices no puede leer ni escribir documentos: su alcance se limita a la estructura de la colección.
- Ningún rol de la tabla tiene privilegios sobre otras bases de datos ni sobre `admin`.

## 4. Credenciales y cifrado

### Credenciales fuera del código

Ningún script del repositorio contiene usuarios ni contraseñas. La conexión usada durante el desarrollo es local y sin credenciales:

```text
mongodb://127.0.0.1:27017
```

Cuando `scripts/seguridad_roles_acceso.js` crea usuarios de prueba, las contraseñas se leen exclusivamente desde variables de entorno del sistema operativo (`PASSWORD_ANALISTA`, `PASSWORD_LECTURA`), definidas por quien ejecuta el script justo antes de correrlo y nunca almacenadas en el repositorio:

```bash
export PASSWORD_ANALISTA="valor-temporal-solo-para-la-prueba"
export PASSWORD_LECTURA="valor-temporal-solo-para-la-prueba"
mongosh "$(mongodb_database_url)" --quiet scripts/seguridad_roles_acceso.js
```

Si esas variables no están definidas —o si el shell utilizado no expone variables de entorno de Node, como ocurre en el shell `mongo` clásico— el script diseña los roles pero **no** crea usuarios, para no dejar cuentas con contraseñas vacías o previsibles como efecto colateral de una ejecución de prueba. En ese caso, los cuatro roles quedan diseñados y verificables, sin usuarios de prueba.

El repositorio no debe contener, bajo ninguna circunstancia:

- Contraseñas.
- Tokens de GitHub.
- Claves SSH privadas.
- Archivos `.pem`.
- Cadenas de conexión con credenciales.
- Variables de entorno con secretos.
- Copias de configuración personal.

### Cifrado en el entorno objetivo

El Learner Lab de MongoDB Community, tal como está configurado para el curso, no cifra el tránsito ni el almacenamiento porque se trata de un entorno local y aislado de un solo usuario. Esa configuración **no** debe trasladarse sin cambios a un entorno objetivo real. Para un despliegue objetivo en AWS (por ejemplo, Amazon DocumentDB o un Atlas gestionado) el proyecto requeriría:

| Aspecto | Estado en el laboratorio | Requisito en el entorno objetivo |
|---|---|---|
| Autenticación | Deshabilitada (`security.authorization` no está en `enabled`) | Obligatoria, con usuarios individuales por integrante o servicio |
| Cifrado en tránsito | No aplica (conexión local) | TLS/SSL obligatorio en la cadena de conexión (`tls=true`) |
| Cifrado en reposo | No aplica | Cifrado en reposo administrado por el proveedor (por ejemplo, cifrado con AWS KMS en DocumentDB) |
| Gestión de secretos | Variables de entorno manuales | Un gestor de secretos (por ejemplo, AWS Secrets Manager o Parameter Store) en lugar de variables de entorno sueltas |
| Acceso de red | Sólo `127.0.0.1` | Grupos de seguridad/firewall que restrinjan el acceso a las subredes y hosts autorizados |

## 5. Rol diseñado frente a denegación comprobada

Esta distinción es explícita porque el servidor usado durante el desarrollo **no tiene autenticación activa**: `scripts/seguridad_roles_acceso.js` comprueba en tiempo de ejecución si `security.authorization` está en `enabled` y documenta cuál de los dos casos aplicó.

- **Rol diseñado.** Los cuatro roles de la sección 3 se crean con `db.createRole()` y son verificables con `curso.getRoles({ showPrivileges: true })`. Esto demuestra que el diseño de privilegio mínimo existe y es consistente, pero **no** demuestra que el servidor vaya a rechazar una operación fuera de ese privilegio.
- **Denegación comprobada.** Sólo se considera comprobada cuando, con `security.authorization: enabled` activo, una conexión autenticada con un rol de sólo lectura intenta una operación fuera de su privilegio (por ejemplo, `insertOne` con el rol `rol_lectura_publica`) y el servidor la rechaza con un error de autorización (`not authorized on m6_nosql to execute command ...`). El script implementa esta prueba, pero sólo se ejecuta si detecta autenticación activa.

En el entorno del Learner Lab usado para este proyecto, la autenticación **no** estuvo activa durante el desarrollo, por lo que los roles se consideran **diseñados pero no exigidos por el motor** en esa ejecución. `resultados/seguridad_roles_acceso.txt` conserva el diagnóstico exacto obtenido al ejecutar el script, incluyendo cuál de los dos casos ocurrió. No se afirma una denegación comprobada sin la evidencia correspondiente en ese archivo.

## Control de acceso durante el desarrollo

- Sólo las integrantes autorizadas deben tener acceso de escritura al repositorio.
- Cada integrante debe utilizar su propia cuenta de GitHub.
- Las claves SSH privadas no deben compartirse.
- No deben almacenarse tokens o contraseñas dentro de los scripts.
- Los permisos deben seguir el principio de mínimo privilegio, tal como se detalla en la sección 3.

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
- La conexión local no utiliza autenticación; la sección 5 documenta esa limitación de forma explícita en lugar de asumir un control que no se comprobó.
- La precisión de las coordenadas depende de la fuente.
- Un dato público no deja de requerir un uso responsable.
- La ubicación de un evento no debe interpretarse como ubicación de una persona.
- Los resultados agregados no deben utilizarse para estigmatizar lugares o habitantes.
- La compatibilidad con MongoDB Community no implica compatibilidad automática con Amazon DocumentDB, incluyendo el comportamiento de `createRole`, `createView` y las opciones de cifrado, que deben revalidarse en el motor objetivo.

## Criterios para compartir resultados

Al compartir resultados deben preferirse tablas agregadas, conteos por periodo y análisis por zona, equivalentes a lo que expone `vista_publica_delitos`. No deben publicarse coordenadas individuales adicionales ni documentos con `_id` o marca de tiempo exacta cuando no sean necesarios para demostrar el funcionamiento técnico.
