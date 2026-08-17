var curso = db.getSiblingDB("m6_nosql");

var principal = curso.delitos_mexicali;
var nombrePruebas =
  "delitos_mexicali_pruebas_validacion";

if (principal.countDocuments({}) !== 175482) {
  throw new Error(
    "La colección principal no contiene los documentos esperados."
  );
}

var informacion = curso.getCollectionInfos({
  name: "delitos_mexicali"
})[0];

if (
  !informacion ||
  !informacion.options ||
  !informacion.options.validator
) {
  throw new Error(
    "La colección principal no tiene validador."
  );
}

curso[nombrePruebas].drop();

var creacion = curso.createCollection(
  nombrePruebas,
  {
    validator:
      informacion.options.validator,
    validationLevel: "strict",
    validationAction: "error"
  }
);

print("=== CREACIÓN DE LA COLECCIÓN DE PRUEBAS ===");
printjson(creacion);

var pruebas = curso[nombrePruebas];
var fallas = 0;

function probar(
  numero,
  nombre,
  documento,
  resultadoEsperado,
  regla
) {
  var resultadoObtenido;
  var mensaje;

  try {
    pruebas.insertOne(documento);
    resultadoObtenido = "ACEPTADO";
    mensaje = "El documento se insertó.";
  } catch (error) {
    resultadoObtenido = "RECHAZADO";
    mensaje =
      error.errmsg ||
      error.message ||
      "Error de validación";
  }

  var coincide =
    resultadoObtenido === resultadoEsperado;

  if (!coincide) {
    fallas += 1;
  }

  printjson({
    caso: numero,
    nombre: nombre,
    resultadoEsperado:
      resultadoEsperado,
    resultadoObtenido:
      resultadoObtenido,
    coincide: coincide,
    reglaEvaluada: regla,
    mensaje: mensaje
  });
}

print("=== CASOS DE PRUEBA ===");

probar(
  1,
  "Documento completo",
  {
    clasificacionDelito:
      "VEHICLE THEFT",
    fechaRegistro:
      ISODate("2024-08-01T00:00:00Z"),
    fechaOcurrencia:
      ISODate("2024-07-31T20:30:00Z"),
    lugar: {
      municipio: "MEXICALI",
      nombre: "CENTRO",
      tipo: "COLONY"
    },
    ubicacion: {
      type: "Point",
      coordinates: [
        -115.4756,
        32.6245
      ]
    }
  },
  "ACEPTADO",
  "Cumple campos, tipos, dominios y GeoJSON."
);

probar(
  2,
  "Documento válido sin opcionales",
  {
    clasificacionDelito:
      "HOME ROBBERY",
    fechaRegistro:
      ISODate("2024-08-01T00:00:00Z"),
    fechaOcurrencia:
      ISODate("2024-07-31T21:00:00Z"),
    lugar: {
      municipio: "MEXICALI"
    }
  },
  "ACEPTADO",
  "nombre, tipo y ubicacion son opcionales."
);

probar(
  3,
  "Falta clasificacionDelito",
  {
    fechaRegistro:
      ISODate("2024-08-01T00:00:00Z"),
    fechaOcurrencia:
      ISODate("2024-07-31T21:00:00Z"),
    lugar: {
      municipio: "MEXICALI"
    }
  },
  "RECHAZADO",
  "clasificacionDelito está en required."
);

probar(
  4,
  "Fecha de registro como texto",
  {
    clasificacionDelito:
      "HOME ROBBERY",
    fechaRegistro:
      "01/08/2024",
    fechaOcurrencia:
      ISODate("2024-07-31T21:00:00Z"),
    lugar: {
      municipio: "MEXICALI"
    }
  },
  "RECHAZADO",
  "fechaRegistro debe ser BSON Date."
);

probar(
  5,
  "Clasificación fuera del dominio",
  {
    clasificacionDelito:
      "DELITO INVENTADO",
    fechaRegistro:
      ISODate("2024-08-01T00:00:00Z"),
    fechaOcurrencia:
      ISODate("2024-07-31T21:00:00Z"),
    lugar: {
      municipio: "MEXICALI"
    }
  },
  "RECHAZADO",
  "La clasificación debe pertenecer al enum."
);

probar(
  6,
  "Falta municipio",
  {
    clasificacionDelito:
      "HOME ROBBERY",
    fechaRegistro:
      ISODate("2024-08-01T00:00:00Z"),
    fechaOcurrencia:
      ISODate("2024-07-31T21:00:00Z"),
    lugar: {
      nombre: "CENTRO"
    }
  },
  "RECHAZADO",
  "lugar.municipio está en required."
);

probar(
  7,
  "Tipo de lugar fuera del dominio",
  {
    clasificacionDelito:
      "HOME ROBBERY",
    fechaRegistro:
      ISODate("2024-08-01T00:00:00Z"),
    fechaOcurrencia:
      ISODate("2024-07-31T21:00:00Z"),
    lugar: {
      municipio: "MEXICALI",
      tipo: "BARRIO"
    }
  },
  "RECHAZADO",
  "lugar.tipo sólo admite tres valores."
);

probar(
  8,
  "Tipo geométrico incorrecto",
  {
    clasificacionDelito:
      "HOME ROBBERY",
    fechaRegistro:
      ISODate("2024-08-01T00:00:00Z"),
    fechaOcurrencia:
      ISODate("2024-07-31T21:00:00Z"),
    lugar: {
      municipio: "MEXICALI"
    },
    ubicacion: {
      type: "LineString",
      coordinates: [
        -115.4756,
        32.6245
      ]
    }
  },
  "RECHAZADO",
  "ubicacion.type sólo admite Point."
);

probar(
  9,
  "Coordenadas incompletas",
  {
    clasificacionDelito:
      "HOME ROBBERY",
    fechaRegistro:
      ISODate("2024-08-01T00:00:00Z"),
    fechaOcurrencia:
      ISODate("2024-07-31T21:00:00Z"),
    lugar: {
      municipio: "MEXICALI"
    },
    ubicacion: {
      type: "Point",
      coordinates: [
        -115.4756
      ]
    }
  },
  "RECHAZADO",
  "coordinates debe contener dos números."
);

print("=== RESUMEN ===");

printjson({
  totalCasos: 9,
  casosCorrectos: 9 - fallas,
  fallas: fallas,
  documentosAceptados:
    pruebas.countDocuments({})
});

if (fallas > 0) {
  throw new Error(
    "Al menos una prueba no produjo el resultado esperado."
  );
}
