var curso = db.getSiblingDB("m6_nosql");
var coleccion = curso.getCollection("delitos_mexicali");

function probarCoordenadas(nombre, coordenadas) {
  var documento = {
    clasificacionDelito: "VEHICLE THEFT",
    fechaRegistro: new Date("2024-01-01T00:00:00Z"),
    fechaOcurrencia: new Date("2024-01-01T01:00:00Z"),
    lugar: {
      municipio: "MEXICALI",
      nombre: "CONTROL DE VALIDACION",
      tipo: "CITY"
    },
    ubicacion: {
      type: "Point",
      coordinates: coordenadas
    }
  };

  var aceptado = false;
  var mensaje = "";

  try {
    var insercion = coleccion.insertOne(documento);
    aceptado = true;
    mensaje = "El documento fue aceptado inesperadamente.";

    coleccion.deleteOne({
      _id: insercion.insertedId
    });
  } catch (error) {
    mensaje = error.message;
  }

  return {
    nombre: nombre,
    coordenadas: coordenadas,
    resultadoEsperado: "RECHAZADO",
    resultadoObtenido: aceptado ? "ACEPTADO" : "RECHAZADO",
    coincide: !aceptado,
    reglaEvaluada:
      "La longitud debe estar entre -180 y 180 y la latitud entre -90 y 90.",
    mensaje: mensaje
  };
}

var pruebaLongitud = probarCoordenadas(
  "Longitud fuera del intervalo",
  [200, 32.60621895]
);

var pruebaLatitud = probarCoordenadas(
  "Latitud fuera del intervalo",
  [-115.3862048, 95]
);

var referencia = {
  type: "Point",
  coordinates: [-115.3862048, 32.60621895]
};

var controlTematico = coleccion.findOne(
  {
    clasificacionDelito: {
      $ne: "VEHICLE THEFT"
    },
    "ubicacion.coordinates": [
      -115.3862048,
      32.60621895
    ]
  },
  {
    clasificacionDelito: 1,
    fechaOcurrencia: 1,
    lugar: 1,
    ubicacion: 1
  }
);

if (!controlTematico) {
  throw new Error(
    "No se encontró el documento cercano de control temático."
  );
}

var busquedaConFiltro = coleccion.aggregate([
  {
    $geoNear: {
      near: referencia,
      distanceField: "distanciaMetros",
      maxDistance: 5000,
      spherical: true,
      query: {
        clasificacionDelito: "VEHICLE THEFT"
      }
    }
  },
  {
    $match: {
      _id: controlTematico._id
    }
  },
  {
    $count: "totalCoincidencias"
  }
]).toArray();

var coincidenciasControl =
  busquedaConFiltro.length === 1
    ? busquedaConFiltro[0].totalCoincidencias
    : 0;

var pruebaFiltroTematico = {
  nombre: "Registro cercano con clasificación diferente",
  documentoControl: controlTematico,
  resultadoEsperado:
    "EXCLUIDO POR EL FILTRO DE VEHICLE THEFT",
  totalCoincidencias: coincidenciasControl,
  coincide: coincidenciasControl === 0
};

var resultados = [
  pruebaLongitud,
  pruebaLatitud,
  pruebaFiltroTematico
];

var pruebasCorrectas = resultados.filter(function (prueba) {
  return prueba.coincide;
}).length;

print("=== PRUEBA DE LONGITUD ===");
printjson(pruebaLongitud);

print("=== PRUEBA DE LATITUD ===");
printjson(pruebaLatitud);

print("=== CONTROL DEL FILTRO TEMÁTICO ===");
printjson(pruebaFiltroTematico);

print("=== RESUMEN DE PRUEBAS ADICIONALES ===");
printjson({
  totalPruebas: resultados.length,
  pruebasCorrectas: pruebasCorrectas,
  fallas: resultados.length - pruebasCorrectas,
  resultadoGeneral:
    pruebasCorrectas === resultados.length
      ? "TODAS LAS PRUEBAS COINCIDEN"
      : "EXISTEN PRUEBAS QUE DEBEN REVISARSE"
});
