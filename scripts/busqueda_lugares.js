// Búsqueda estructurada por patrones sobre lugar.nombre.
//
// Se eligió $regex en lugar de $text porque lugar.nombre no es texto
// libre (una oración, una descripción, una nota): es un nombre propio
// corto y categórico (colonia, fraccionamiento). $text tokeniza por
// palabras y ordena por relevancia, algo pensado para buscar dentro de
// prosa; aquí el caso de uso real es que una persona analista recuerde
// sólo una parte del nombre de la colonia (o lo escriba con mayúsculas
// o minúsculas distintas) y necesite encontrar coincidencias exactas de
// ese patrón, no una puntuación de relevancia semántica.

var curso = db.getSiblingDB("m6_nosql");
var delitos = curso.delitos_mexicali;

if (delitos.countDocuments({}) !== 175482) {
  throw new Error(
    "La colección no contiene los 175482 documentos esperados."
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

function resumenExplain(patron, explicacion) {
  var etapas = [];
  obtenerEtapas(explicacion.queryPlanner.winningPlan, etapas);

  return {
    patron: patron,
    etapas: etapas,
    totalKeysExamined: explicacion.executionStats.totalKeysExamined,
    totalDocsExamined: explicacion.executionStats.totalDocsExamined,
    nReturned: explicacion.executionStats.nReturned
  };
}

print("=== CASO 1: PREFIJO ANCLADO, INSENSIBLE A MAYÚSCULAS ===");

// Un patrón anclado al inicio ("^") podría, en teoría, acotar el
// recorrido del índice idx_lugar_fecha_id a un rango de cadenas. En la
// práctica, la bandera "i" (insensible a mayúsculas) le impide a
// MongoDB calcular ese rango acotado: el motor sigue eligiendo el
// índice (IXSCAN, evita un COLLSCAN sobre 175,482 documentos), pero
// recorre casi todas sus entradas para evaluar el patrón contra cada
// valor indexado. Esto se comprueba con la evidencia real más abajo:
// totalKeysExamined queda cerca del total de la colección, no acotado
// a las entradas que empiezan con "VALLE".
var prefijoExplain = delitos
  .find({ "lugar.nombre": /^VALLE/i })
  .explain("executionStats");

printjson(resumenExplain("/^VALLE/i", prefijoExplain));

print("Lugares distintos que coinciden con /^VALLE/i:");
printjson(delitos.distinct("lugar.nombre", { "lugar.nombre": /^VALLE/i }));

print("=== CASO 2: SUBCADENA SIN ANCLAR ===");

// Un patrón sin anclar tampoco puede acotarse a un rango del índice:
// la coincidencia puede estar en cualquier posición del nombre. Aun
// así, MongoDB puede resolverlo con IXSCAN en vez de COLLSCAN, porque
// evalúa el patrón directamente contra el valor indexado (sin abrir el
// documento) y sólo ejecuta FETCH sobre los documentos que sí
// coinciden. Por eso totalDocsExamined puede ser mucho menor que
// totalKeysExamined: el índice sigue evitando fetches innecesarios,
// aunque no evite recorrer casi todas sus entradas.
var subcadenaExplain = delitos
  .find({ "lugar.nombre": /PEDREGAL/i })
  .explain("executionStats");

printjson(resumenExplain("/PEDREGAL/i", subcadenaExplain));

print("Lugares distintos que coinciden con /PEDREGAL/i:");
printjson(delitos.distinct("lugar.nombre", { "lugar.nombre": /PEDREGAL/i }));

print("=== CASO 3: BÚSQUEDA COMBINADA CON FILTRO TEMÁTICO ===");

printjson(
  delitos
    .find(
      {
        "lugar.nombre": /PEDREGAL/i,
        clasificacionDelito: "VEHICLE THEFT"
      },
      {
        _id: 0,
        clasificacionDelito: 1,
        "lugar.nombre": 1,
        fechaOcurrencia: 1
      }
    )
    .sort({ fechaOcurrencia: -1 })
    .limit(5)
    .toArray()
);

print("=== CASO 4: PATRÓN SIN COINCIDENCIAS (CASO DE EXCLUSIÓN) ===");

var sinCoincidencias = delitos
  .find({ "lugar.nombre": /ZZZZ_COLONIA_INEXISTENTE/i })
  .toArray();

printjson({
  patron: "/ZZZZ_COLONIA_INEXISTENTE/i",
  coincidencias: sinCoincidencias.length
});

if (sinCoincidencias.length !== 0) {
  throw new Error(
    "El caso de control de exclusión debía devolver cero coincidencias."
  );
}

print("Caso de exclusión correcto: 0 coincidencias, como se esperaba.");
