var curso = db.getSiblingDB("m6_nosql");
var delitos = curso.delitos_mexicali;

if (delitos.countDocuments({}) !== 175482) {
  throw new Error(
    "La colección delitos_mexicali no contiene los 175482 documentos esperados."
  );
}

print("=== CONSULTA 1: CLASIFICACIONES MÁS FRECUENTES ===");

printjson(
  delitos.aggregate([
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
      $limit: 10
    },
    {
      $project: {
        _id: 0,
        clasificacionDelito: "$_id",
        totalRegistros: 1
      }
    }
  ]).toArray()
);

print("=== CONSULTA 2: REGISTROS POR AÑO ===");

printjson(
  delitos.aggregate([
    {
      $group: {
        _id: { $year: "$fechaOcurrencia" },
        totalRegistros: { $sum: 1 }
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
        anio: "$_id",
        totalRegistros: 1
      }
    }
  ]).toArray()
);

print("=== CONSULTA 3: REGISTROS POR HORA ===");

printjson(
  delitos.aggregate([
    {
      $group: {
        _id: { $hour: "$fechaOcurrencia" },
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
      $project: {
        _id: 0,
        hora: "$_id",
        totalRegistros: 1
      }
    }
  ]).toArray()
);

print("=== CONSULTA 4: LUGARES CON MÁS ROBOS DE VEHÍCULO ===");

printjson(
  delitos.aggregate([
    {
      $match: {
        clasificacionDelito: "VEHICLE THEFT",
        "lugar.nombre": { $exists: true }
      }
    },
    {
      $group: {
        _id: "$lugar.nombre",
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
      $limit: 10
    },
    {
      $project: {
        _id: 0,
        lugar: "$_id",
        totalRegistros: 1
      }
    }
  ]).toArray()
);
