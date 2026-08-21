var curso = db.getSiblingDB("m6_nosql");
var coleccion = curso.getCollection("delitos_mexicali");

var informacionColeccion = curso.getCollectionInfos({
  name: "delitos_mexicali"
});

if (informacionColeccion.length !== 1) {
  throw new Error("No existe la colección delitos_mexicali.");
}

var opciones = informacionColeccion[0].options || {};
var indices = coleccion.getIndexes();
var nombresIndices = indices.map(function (indice) {
  return indice.name;
});

function existeIndice(nombre) {
  return nombresIndices.indexOf(nombre) !== -1;
}

var perfil = {
  totalDocumentos: coleccion.countDocuments({}),
  fechasRegistroBsonDate: coleccion.countDocuments({
    fechaRegistro: { $type: "date" }
  }),
  fechasOcurrenciaBsonDate: coleccion.countDocuments({
    fechaOcurrencia: { $type: "date" }
  }),
  conUbicacion: coleccion.countDocuments({
    ubicacion: { $exists: true }
  }),
  sinUbicacion: coleccion.countDocuments({
    ubicacion: { $exists: false }
  }),
  sinNombreLugar: coleccion.countDocuments({
    "lugar.nombre": { $exists: false }
  })
};

var coberturaTemporal = coleccion.aggregate([
  {
    $group: {
      _id: null,
      primeraFecha: { $min: "$fechaOcurrencia" },
      ultimaFecha: { $max: "$fechaOcurrencia" }
    }
  },
  {
    $project: {
      _id: 0,
      primeraFecha: 1,
      ultimaFecha: 1
    }
  }
]).toArray()[0];

var clasificacionPrincipal = coleccion.aggregate([
  {
    $group: {
      _id: "$clasificacionDelito",
      totalRegistros: { $sum: 1 }
    }
  },
  {
    $sort: {
      totalRegistros: -1,
      _id: 1
    }
  },
  {
    $limit: 1
  },
  {
    $project: {
      _id: 0,
      clasificacionDelito: "$_id",
      totalRegistros: 1
    }
  }
]).toArray()[0];

var robosVehiculoCincoKm = coleccion.aggregate([
  {
    $geoNear: {
      near: {
        type: "Point",
        coordinates: [-115.3862048, 32.60621895]
      },
      distanceField: "distanciaMetros",
      maxDistance: 5000,
      spherical: true,
      query: {
        clasificacionDelito: "VEHICLE THEFT"
      }
    }
  },
  {
    $count: "totalRegistros"
  }
]).toArray();

var totalRobosVehiculoCincoKm =
  robosVehiculoCincoKm.length === 1
    ? robosVehiculoCincoKm[0].totalRegistros
    : 0;

var vistaProtegidaExiste =
  curso.getCollectionInfos({ name: "vista_publica_delitos" }).length === 1;

var nombresRoles = curso.getRoles().map(function (rol) {
  return rol.role;
});

var rolesEsperados = [
  "rol_lectura_publica",
  "rol_analista_interno",
  "rol_carga_datos",
  "rol_administrador_indices"
];

var todosLosRolesDefinidos = rolesEsperados.every(function (rol) {
  return nombresRoles.indexOf(rol) !== -1;
});

function contieneJsonSchema(validador) {
  if (!validador) {
    return false;
  }

  if (validador.$jsonSchema) {
    return true;
  }

  if (Array.isArray(validador.$and)) {
    return validador.$and.some(function (regla) {
      return contieneJsonSchema(regla);
    });
  }

  return false;
}

var validadorConfigurado = contieneJsonSchema(
  opciones.validator
);;

var comprobaciones = [
  {
    comprobacion: "La colección contiene 175482 documentos",
    cumple: perfil.totalDocumentos === 175482
  },
  {
    comprobacion: "Todas las fechas de registro son BSON Date",
    cumple: perfil.fechasRegistroBsonDate === perfil.totalDocumentos
  },
  {
    comprobacion: "Todas las fechas de ocurrencia son BSON Date",
    cumple: perfil.fechasOcurrenciaBsonDate === perfil.totalDocumentos
  },
  {
    comprobacion: "La cobertura geográfica suma el total de documentos",
    cumple:
      perfil.conUbicacion + perfil.sinUbicacion ===
      perfil.totalDocumentos
  },
  {
    comprobacion: "Existe el índice de clasificación y fecha",
    cumple: existeIndice("idx_clasificacion_fecha_id")
  },
  {
    comprobacion: "Existe el índice de lugar y fecha",
    cumple: existeIndice("idx_lugar_fecha_id")
  },
  {
    comprobacion: "Existe el índice geoespacial 2dsphere",
    cumple: existeIndice("idx_ubicacion_2dsphere")
  },
  {
    comprobacion: "La colección tiene un validador JSON Schema",
    cumple: validadorConfigurado
  },
  {
    comprobacion: "La validación está configurada como strict y error",
    cumple:
      opciones.validationLevel === "strict" &&
      opciones.validationAction === "error"
  },
  {
    comprobacion: "VEHICLE THEFT es la clasificación más frecuente",
    cumple:
      clasificacionPrincipal.clasificacionDelito === "VEHICLE THEFT" &&
      clasificacionPrincipal.totalRegistros === 37331
  },
  {
    comprobacion: "Hay 9513 robos de vehículo dentro de cinco kilómetros",
    cumple: totalRobosVehiculoCincoKm === 9513
  },
  {
    comprobacion: "Existe la vista protegida vista_publica_delitos",
    cumple: vistaProtegidaExiste
  },
  {
    comprobacion:
      "Los cuatro roles de privilegio mínimo están definidos",
    cumple: todosLosRolesDefinidos
  }
];

var comprobacionesCorrectas = comprobaciones.filter(function (elemento) {
  return elemento.cumple;
}).length;

print("=== EVIDENCIA FINAL DEL PROYECTO ===");

print("=== PERFIL DE LA COLECCIÓN ===");
printjson(perfil);

print("=== COBERTURA TEMPORAL ===");
printjson(coberturaTemporal);

print("=== CLASIFICACIÓN MÁS FRECUENTE ===");
printjson(clasificacionPrincipal);

print("=== ÍNDICES DISPONIBLES ===");
printjson(indices);

print("=== CONFIGURACIÓN DEL VALIDADOR ===");
printjson({
  jsonSchemaConfigurado: validadorConfigurado,
  validationLevel: opciones.validationLevel,
  validationAction: opciones.validationAction
});

print("=== RESULTADO GEOESPACIAL ===");
printjson({
  puntoReferencia: {
    type: "Point",
    coordinates: [-115.3862048, 32.60621895]
  },
  radioMetros: 5000,
  clasificacionDelito: "VEHICLE THEFT",
  totalRegistros: totalRobosVehiculoCincoKm
});

print("=== COMPROBACIONES ===");
comprobaciones.forEach(function (elemento, posicion) {
  printjson({
    numero: posicion + 1,
    comprobacion: elemento.comprobacion,
    resultado: elemento.cumple ? "CORRECTO" : "REVISAR"
  });
});

print("=== RESUMEN FINAL ===");
printjson({
  totalComprobaciones: comprobaciones.length,
  comprobacionesCorrectas: comprobacionesCorrectas,
  comprobacionesConFalla:
    comprobaciones.length - comprobacionesCorrectas,
  resultadoGeneral:
    comprobacionesCorrectas === comprobaciones.length
      ? "PROYECTO VERIFICADO CORRECTAMENTE"
      : "EXISTEN ELEMENTOS QUE DEBEN REVISARSE"
});
