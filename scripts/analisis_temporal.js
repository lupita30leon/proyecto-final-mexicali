var curso = db.getSiblingDB("m6_nosql");
var delitos = curso.delitos_mexicali;

if (delitos.countDocuments({}) !== 175482) {
  throw new Error(
    "La colección no contiene los 175482 documentos esperados."
  );
}

print("=== COBERTURA TEMPORAL ===");

printjson(
  delitos.aggregate([
    {
      $group: {
        _id: null,
        primeraFecha: {
          $min: "$fechaOcurrencia"
        },
        ultimaFecha: {
          $max: "$fechaOcurrencia"
        },
        totalDocumentos: {
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

print("=== REGISTROS POR MES DURANTE 2023 ===");

printjson(
  delitos.aggregate([
    {
      $match: {
        fechaOcurrencia: {
          $gte:
            ISODate("2023-01-01T00:00:00Z"),
          $lt:
            ISODate("2024-01-01T00:00:00Z")
        }
      }
    },
    {
      $group: {
        _id: {
          $month: "$fechaOcurrencia"
        },
        totalRegistros: {
          $sum: 1
        }
      }
    },
    {
      $sort: {
        _id: 1
      }
    },
    {
      $project: {
        _id: 0,
        mes: "$_id",
        totalRegistros: 1
      }
    }
  ]).toArray()
);

print("=== REGISTROS POR DÍA DE LA SEMANA ===");

printjson(
  delitos.aggregate([
    {
      $group: {
        _id: {
          $dayOfWeek:
            "$fechaOcurrencia"
        },
        totalRegistros: {
          $sum: 1
        }
      }
    },
    {
      $sort: {
        _id: 1
      }
    },
    {
      $project: {
        _id: 0,
        numeroDiaMongo: "$_id",
        nombreDia: {
          $arrayElemAt: [
            [
              "",
              "DOMINGO",
              "LUNES",
              "MARTES",
              "MIERCOLES",
              "JUEVES",
              "VIERNES",
              "SABADO"
            ],
            "$_id"
          ]
        },
        totalRegistros: 1
      }
    }
  ]).toArray()
);

print("=== COBERTURA MENSUAL DE 2024 ===");

printjson(
  delitos.aggregate([
    {
      $match: {
        fechaOcurrencia: {
          $gte:
            ISODate("2024-01-01T00:00:00Z"),
          $lt:
            ISODate("2025-01-01T00:00:00Z")
        }
      }
    },
    {
      $group: {
        _id: {
          $month: "$fechaOcurrencia"
        },
        totalRegistros: {
          $sum: 1
        }
      }
    },
    {
      $sort: {
        _id: 1
      }
    },
    {
      $project: {
        _id: 0,
        mes: "$_id",
        totalRegistros: 1
      }
    }
  ]).toArray()
);

print(
  "Nota: MongoDB numera domingo como 1 y sábado como 7."
);
