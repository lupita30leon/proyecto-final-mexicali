// Este script NO contiene contraseñas ni cadenas de conexión con
// credenciales. Las contraseñas de los usuarios de prueba se leen desde
// variables de entorno del sistema operativo, nunca desde el código:
//
//   export PASSWORD_ANALISTA="valor-temporal-solo-para-la-prueba"
//   export PASSWORD_LECTURA="valor-temporal-solo-para-la-prueba"
//
// Si las variables no están definidas, el script diseña los roles pero
// no crea usuarios, para no dejar cuentas con contraseñas vacías o
// previsibles.

var curso = db.getSiblingDB("m6_nosql");
var admin = db.getSiblingDB("admin");

print("=== 1. DIAGNÓSTICO DEL ENTORNO ===");

var opcionesServidor = admin.runCommand({ getCmdLineOpts: 1 });
var seguridad = (opcionesServidor.parsed || {}).security || {};

var autenticacionActiva =
  seguridad.authorization === "enabled";

printjson({
  authorizationConfigurado: seguridad.authorization || "no definido",
  autenticacionActiva: autenticacionActiva
});

if (!autenticacionActiva) {
  print(
    "AVISO: este servidor MongoDB Community del Learner Lab no tiene " +
    "'security.authorization: enabled'. Por lo tanto, cualquier rol que " +
    "se cree a continuación queda DISEÑADO pero NO EXIGIBLE: el motor no " +
    "rechazará ninguna operación aunque un usuario real esté vinculado a " +
    "un rol de sólo lectura. Esta distinción se documenta explícitamente " +
    "en documentacion/07_seguridad_privacidad.md."
  );
}

print("=== 2. DEFINICIÓN DE ROLES CON PRIVILEGIO MÍNIMO ===");

function definirRol(nombre, privilegios) {
  var rolesExistentes = curso.getRoles().map(function (rol) {
    return rol.role;
  });

  if (rolesExistentes.indexOf(nombre) !== -1) {
    curso.dropRole(nombre);
  }

  var resultado = curso.createRole({
    role: nombre,
    privileges: privilegios,
    roles: []
  });

  print("Rol creado: " + nombre);
  printjson(resultado);

  return resultado;
}

// Rol 1: lectura pública. Sólo puede ejecutar find() sobre una vista
// agregada y minimizada; nunca sobre la colección con documentos crudos.
definirRol("rol_lectura_publica", [
  {
    resource: {
      db: "m6_nosql",
      collection: "vista_publica_delitos"
    },
    actions: ["find"]
  }
]);

// Rol 2: analista interno. Puede leer los documentos completos para
// análisis, pero no puede insertar, modificar ni eliminar nada.
definirRol("rol_analista_interno", [
  {
    resource: {
      db: "m6_nosql",
      collection: "delitos_mexicali"
    },
    actions: ["find"]
  }
]);

// Rol 3: carga de datos (ETL). Sólo puede insertar documentos nuevos y
// leer para comprobar la carga; no puede modificar ni borrar lo existente
// ni administrar índices o el validador.
definirRol("rol_carga_datos", [
  {
    resource: {
      db: "m6_nosql",
      collection: "delitos_mexicali"
    },
    actions: ["find", "insert"]
  }
]);

// Rol 4: administración de índices y validador. No puede leer, insertar
// ni modificar los datos, sólo la definición estructural de la colección.
definirRol("rol_administrador_indices", [
  {
    resource: {
      db: "m6_nosql",
      collection: "delitos_mexicali"
    },
    actions: [
      "createIndex",
      "dropIndex",
      "collMod",
      "listIndexes"
    ]
  }
]);

print("=== 3. ROLES DISPONIBLES EN m6_nosql ===");
printjson(curso.getRoles({ showPrivileges: true }));

print("=== 4. CREACIÓN DE USUARIOS DE PRUEBA (SÓLO SI HAY CREDENCIALES) ===");

var passwordAnalista = process.env.PASSWORD_ANALISTA;
var passwordLectura = process.env.PASSWORD_LECTURA;

if (!passwordAnalista || !passwordLectura) {
  print(
    "No se definieron PASSWORD_ANALISTA / PASSWORD_LECTURA como " +
    "variables de entorno. No se crearán usuarios de prueba. Los roles " +
    "quedan diseñados y verificables mediante curso.getRoles(), pero la " +
    "denegación de privilegios NO se comprobó en esta ejecución."
  );
} else {
  var usuariosExistentes = curso.getUsers().map(function (usuario) {
    return usuario.user;
  });

  if (usuariosExistentes.indexOf("usuario_analista_prueba") !== -1) {
    curso.dropUser("usuario_analista_prueba");
  }

  if (usuariosExistentes.indexOf("usuario_lectura_prueba") !== -1) {
    curso.dropUser("usuario_lectura_prueba");
  }

  curso.createUser({
    user: "usuario_analista_prueba",
    pwd: passwordAnalista,
    roles: [{ role: "rol_analista_interno", db: "m6_nosql" }]
  });

  curso.createUser({
    user: "usuario_lectura_prueba",
    pwd: passwordLectura,
    roles: [{ role: "rol_lectura_publica", db: "m6_nosql" }]
  });

  print("Usuarios de prueba creados: usuario_analista_prueba, usuario_lectura_prueba");

  if (!autenticacionActiva) {
    print(
      "Los usuarios existen en system.users, pero como 'authorization' " +
      "no está en 'enabled', CUALQUIER conexión (incluida la de estos " +
      "usuarios) conserva acceso completo. No es posible demostrar aquí " +
      "una denegación real; hacerlo requeriría reiniciar mongod con " +
      "'security.authorization: enabled', lo cual excede el alcance de " +
      "este script porque interrumpiría el servidor compartido del " +
      "Learner Lab. El procedimiento manual para hacerlo, fuera de este " +
      "script, se documenta en documentacion/07_seguridad_privacidad.md."
    );
  } else {
    print("=== 5. PRUEBA DE DENEGACIÓN REAL (AUTENTICACIÓN ACTIVA) ===");

    var conexionLectura = new Mongo(db.getMongo().host);
    var dbLectura = conexionLectura.getDB("m6_nosql");

    dbLectura.auth("usuario_lectura_prueba", passwordLectura);

    var resultadoPermitido = dbLectura.vista_publica_delitos.findOne();
    print("Operación permitida (find sobre vista_publica_delitos):");
    printjson({ ejecutoSinError: resultadoPermitido !== null || true });

    var denegado = false;
    var mensajeError = null;

    try {
      dbLectura.delitos_mexicali.insertOne({
        clasificacionDelito: "PRUEBA_NO_AUTORIZADA"
      });
    } catch (error) {
      denegado = true;
      mensajeError = error.message;
    }

    print("Operación fuera de privilegio (insertOne sobre delitos_mexicali):");
    printjson({
      fueDenegada: denegado,
      mensaje: mensajeError
    });

    if (!denegado) {
      throw new Error(
        "El usuario de sólo lectura pudo insertar un documento. " +
        "El control de privilegio mínimo no se cumplió."
      );
    }

    print(
      "DENEGACIÓN COMPROBADA: el servidor rechazó la operación fuera " +
      "del privilegio del rol, con autenticación activa."
    );
  }
}

print("=== 6. LIMPIEZA DE ROLES DE PRUEBA (OPCIONAL) ===");
print(
  "Los roles y usuarios creados en esta ejecución son de prueba y " +
  "pueden eliminarse con curso.dropRole(nombre) / curso.dropUser(nombre) " +
  "una vez capturada la evidencia para el reporte."
);
