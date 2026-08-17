var curso = db.getSiblingDB("m6_nosql");
var delitos = curso.delitos_mexicali;

if (delitos.countDocuments({}) !== 175482) {
  throw new Error(
    "La colección no contiene los 175482 documentos esperados."
  );
}

print("=== ÍNDICES ANTES DE LA CREACIÓN ===");
printjson(delitos.getIndexes());

print("=== CREACIÓN DEL ÍNDICE A ===");

print(
  delitos.createIndex(
    {
      clasificacionDelito: 1,
      fechaOcurrencia: -1,
      _id: 1
    },
    {
      name: "idx_clasificacion_fecha_id"
    }
  )
);

print("=== CREACIÓN DEL ÍNDICE B ===");

print(
  delitos.createIndex(
    {
      "lugar.nombre": 1,
      fechaOcurrencia: -1,
      _id: 1
    },
    {
      name: "idx_lugar_fecha_id"
    }
  )
);

print("=== ÍNDICES DESPUÉS DE LA CREACIÓN ===");
printjson(delitos.getIndexes());
