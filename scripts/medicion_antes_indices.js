var curso = db.getSiblingDB("m6_nosql");
var delitos = curso.delitos_mexicali;

if (delitos.countDocuments({}) !== 175482) {
  throw new Error(
    "La colección no contiene los 175482 documentos esperados."
  );
}

var indicesActuales = delitos.getIndexes();

if (
  indicesActuales.length !== 1 ||
  indicesActuales[0].name !== "_id_"
) {
  throw new Error(
    "La medición inicial requiere únicamente el índice _id_."
  );
}

function obtenerEtapas(plan, resultado) {
  if (!plan || typeof plan !== "object") {
    return;
  }

  if (plan.stage) {
    resultado.push(plan.stage);
  }

  Object.keys(plan).forEach(function (clave) {
    var valor = plan[clave];

    if (valor && typeof valor === "object") {
      if (Array.isArray(valor)) {
        valor.forEach(function (elemento) {
          obtenerEtapas(elemento, resultado);
        });
      } else {
        obtenerEtapas(valor, resultado);
      }
    }
  });
}

function mostrarResumen(nombre, explicacion, resultados) {
  var etapas = [];

  obtenerEtapas(
    explicacion.queryPlanner.winningPlan,
    etapas
  );

  print(nombre);

  printjson({
    etapas: etapas,
    nReturned: explicacion.executionStats.nReturned,
    totalKeysExamined:
      explicacion.executionStats.totalKeysExamined,
    totalDocsExamined:
      explicacion.executionStats.totalDocsExamined,
    executionTimeMillis:
      explicacion.executionStats.executionTimeMillis,
    cantidadResultadosGuardados: resultados.length,
    primeraFecha:
      resultados.length > 0
        ? resultados[0].fechaOcurrencia
        : null,
    ultimaFecha:
      resultados.length > 0
        ? resultados[resultados.length - 1].fechaOcurrencia
        : null,
    idsResultados: resultados.map(function (documento) {
      return documento._id.valueOf();
    })
  });
}

var filtroA = {
  clasificacionDelito: "VEHICLE THEFT",
  fechaOcurrencia: {
    $gte: ISODate("2023-01-01T00:00:00Z"),
    $lt: ISODate("2024-01-01T00:00:00Z")
  }
};

var ordenA = {
  fechaOcurrencia: -1,
  _id: 1
};

var resultadosA = delitos.find(
  filtroA,
  {
    _id: 1,
    clasificacionDelito: 1,
    fechaOcurrencia: 1
  }
).sort(ordenA).limit(20).toArray();

var explicacionA = delitos.find(
  filtroA,
  {
    _id: 1,
    clasificacionDelito: 1,
    fechaOcurrencia: 1
  }
).sort(ordenA).limit(20).explain("executionStats");

var filtroB = {
  "lugar.nombre": "VALLE DEL PEDREGAL",
  fechaOcurrencia: {
    $gte: ISODate("2020-01-01T00:00:00Z"),
    $lt: ISODate("2025-01-01T00:00:00Z")
  }
};

var ordenB = {
  fechaOcurrencia: -1,
  _id: 1
};

var resultadosB = delitos.find(
  filtroB,
  {
    _id: 1,
    clasificacionDelito: 1,
    fechaOcurrencia: 1,
    "lugar.nombre": 1
  }
).sort(ordenB).limit(20).toArray();

var explicacionB = delitos.find(
  filtroB,
  {
    _id: 1,
    clasificacionDelito: 1,
    fechaOcurrencia: 1,
    "lugar.nombre": 1
  }
).sort(ordenB).limit(20).explain("executionStats");

print("=== MEDICIÓN ANTES DE CREAR ÍNDICES ===");

mostrarResumen(
  "CONSULTA A: VEHICLE THEFT DURANTE 2023",
  explicacionA,
  resultadosA
);

mostrarResumen(
  "CONSULTA B: VALLE DEL PEDREGAL ENTRE 2020 Y 2024",
  explicacionB,
  resultadosB
);

print("=== ÍNDICES DISPONIBLES ===");
printjson(delitos.getIndexes());
