var curso = db.getSiblingDB("m6_nosql");
var delitos = curso.delitos_mexicali;

if (delitos.countDocuments({}) !== 175482) {
  throw new Error(
    "La colección no contiene los 175482 documentos esperados."
  );
}

print("=== COBERTURA GEOGRÁFICA ===");

printjson({
  totalDocumentos:
    delitos.countDocuments({}),

  conUbicacion:
    delitos.countDocuments({
      ubicacion: { $exists: true }
    }),

  sinUbicacion:
    delitos.countDocuments({
      ubicacion: { $exists: false }
    }),

  tipoPoint:
    delitos.countDocuments({
      "ubicacion.type": "Point"
    }),

  coordenadasEnIntervalo:
    delitos.countDocuments({
      "ubicacion.coordinates.0": {
        $gte: -180,
        $lte: 180
      },
      "ubicacion.coordinates.1": {
        $gte: -90,
        $lte: 90
      }
    })
});

print("=== INTERVALOS OBSERVADOS ===");

printjson(
  delitos.aggregate([
    {
      $match: {
        ubicacion: { $exists: true }
      }
    },
    {
      $group: {
        _id: null,
        longitudMinima: {
          $min: {
            $arrayElemAt: [
              "$ubicacion.coordinates",
              0
            ]
          }
        },
        longitudMaxima: {
          $max: {
            $arrayElemAt: [
              "$ubicacion.coordinates",
              0
            ]
          }
        },
        latitudMinima: {
          $min: {
            $arrayElemAt: [
              "$ubicacion.coordinates",
              1
            ]
          }
        },
        latitudMaxima: {
          $max: {
            $arrayElemAt: [
              "$ubicacion.coordinates",
              1
            ]
          }
        },
        documentos: {
          $sum: 1
        }
      }
    },
    {
      $project: {
        _id: 0
      }
    }
  ]).toArray()
);

print("=== DOCUMENTO DE CONTROL EN MIRASOL ===");

printjson(
  delitos.findOne(
    {
      "lugar.nombre": "MIRASOL",
      ubicacion: { $exists: true }
    },
    {
      clasificacionDelito: 1,
      fechaOcurrencia: 1,
      lugar: 1,
      ubicacion: 1
    }
  )
);
