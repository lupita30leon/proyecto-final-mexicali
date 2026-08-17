var curso = db.getSiblingDB("m6_nosql");
var delitos = curso.delitos_mexicali;

if (delitos.countDocuments({}) !== 175482) {
  throw new Error(
    "La colección no contiene los 175482 documentos esperados."
  );
}

var referencia = {
  type: "Point",
  coordinates: [
    -115.3862048,
    32.60621895
  ]
};

print("=== CREACIÓN DEL ÍNDICE GEOESPACIAL ===");

delitos.createIndex(
  {
    ubicacion: "2dsphere"
  },
  {
    name: "idx_ubicacion_2dsphere"
  }
);

print("=== ÍNDICES DISPONIBLES ===");
printjson(delitos.getIndexes());

var indiceGeoespacial =
  delitos.getIndexes().filter(function (indice) {
    return indice.name ===
      "idx_ubicacion_2dsphere";
  });

if (indiceGeoespacial.length !== 1) {
  throw new Error(
    "No se encontró el índice geoespacial."
  );
}

print("=== DIEZ REGISTROS MÁS CERCANOS ===");

var cercanos = delitos.aggregate([
  {
    $geoNear: {
      near: referencia,
      key: "ubicacion",
      distanceField: "distanciaMetros",
      maxDistance: 5000,
      spherical: true
    }
  },
  {
    $limit: 10
  },
  {
    $project: {
      _id: 1,
      clasificacionDelito: 1,
      fechaOcurrencia: 1,
      lugar: 1,
      ubicacion: 1,
      distanciaMetros: 1
    }
  }
]).toArray();

printjson(cercanos);

var ordenCorrecto = true;
var dentroDelLimite = true;

for (
  var posicion = 0;
  posicion < cercanos.length;
  posicion += 1
) {
  if (
    cercanos[posicion].distanciaMetros >
    5000
  ) {
    dentroDelLimite = false;
  }

  if (
    posicion > 0 &&
    cercanos[posicion].distanciaMetros <
    cercanos[posicion - 1].distanciaMetros
  ) {
    ordenCorrecto = false;
  }
}

print("=== COMPROBACIÓN DE PROXIMIDAD ===");

printjson({
  referencia: referencia,
  distanciaMaximaMetros: 5000,
  resultadosMostrados: cercanos.length,
  ordenAscendentePorDistancia:
    ordenCorrecto,
  todosDentroDelLimite:
    dentroDelLimite
});

if (
  !ordenCorrecto ||
  !dentroDelLimite
) {
  throw new Error(
    "La consulta de proximidad no produjo el resultado esperado."
  );
}

print("=== ROBOS DE VEHÍCULO DENTRO DE 5 KM ===");

printjson(
  delitos.aggregate([
    {
      $geoNear: {
        near: referencia,
        key: "ubicacion",
        distanceField:
          "distanciaMetros",
        maxDistance: 5000,
        spherical: true,
        query: {
          clasificacionDelito:
            "VEHICLE THEFT"
        }
      }
    },
    {
      $group: {
        _id: null,
        totalRegistros: {
          $sum: 1
        },
        distanciaPromedioMetros: {
          $avg: "$distanciaMetros"
        },
        distanciaMaximaObservada: {
          $max: "$distanciaMetros"
        }
      }
    },
    {
      $project: {
        _id: 0,
        totalRegistros: 1,
        distanciaPromedioMetros: {
          $round: [
            "$distanciaPromedioMetros",
            2
          ]
        },
        distanciaMaximaObservada: {
          $round: [
            "$distanciaMaximaObservada",
            2
          ]
        }
      }
    }
  ]).toArray()
);

print("=== CASO DE CONTROL FUERA DE 5 KM ===");

printjson(
  delitos.aggregate([
    {
      $geoNear: {
        near: referencia,
        key: "ubicacion",
        distanceField:
          "distanciaMetros",
        minDistance: 5000,
        maxDistance: 10000,
        spherical: true
      }
    },
    {
      $limit: 1
    },
    {
      $project: {
        _id: 1,
        clasificacionDelito: 1,
        lugar: 1,
        ubicacion: 1,
        distanciaMetros: 1
      }
    }
  ]).toArray()
);
