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

print("=== CASO 1: PREFIJO ANCLADO (PUEDE USAR EL ÍNDICE) ===");

// Un patrón anclado al inicio ("^") sobre el primer campo de
// idx_lugar_fecha_id puede aprovechar el índice como si fuera una
// búsqueda por rango de cadenas, porque MongoDB puede acotar el
// recorrido del árbol B a las entradas que comienzan con ese prefijo.
var prefijoExplain = delitos
  .find({ "lugar.nombre": /^VALLE/i })
  .explain("executionStats");

printjson({
  patron: "/^VALLE/i",
  etapaPrincipal:
    prefijoExplain.queryPlanner.winningPlan.inputStage
      ? prefijoExplain.queryPlanner.winningPlan.inputStage.stage
      : prefijoExplain.queryPlanner.winningPlan.stage,
  totalKeysExamined: prefijoExplain.executionStats.totalKeysExamined,
  totalDocsExamined: prefijoExplain.executionStats.totalDocsExamined,
  nReturned: prefijoExplain.executionStats.nReturned
});

print("Lugares distintos que coinciden con /^VALLE/i:");
printjson(delitos.distinct("lugar.nombre", { "lugar.nombre": /^VALLE/i }));

print("=== CASO 2: SUBCADENA SIN ANCLAR (NO USA EL ÍNDICE, RECORRE TODO) ===");

// Un patrón sin anclar no puede acotarse a un rango del índice: MongoDB
// debe revisar cada entrada para decidir si la subcadena aparece en
// cualquier posición. Se documenta el costo, no se oculta.
var subcadenaExplain = delitos
  .find({ "lugar.nombre": /PEDREGAL/i })
  .explain("executionStats");

printjson({
  patron: "/PEDREGAL/i",
  etapaPrincipal:
    subcadenaExplain.queryPlanner.winningPlan.inputStage
      ? subcadenaExplain.queryPlanner.winningPlan.inputStage.stage
      : subcadenaExplain.queryPlanner.winningPlan.stage,
  totalKeysExamined: subcadenaExplain.executionStats.totalKeysExamined,
  totalDocsExamined: subcadenaExplain.executionStats.totalDocsExamined,
  nReturned: subcadenaExplain.executionStats.nReturned
});

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
