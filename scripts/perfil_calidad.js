var curso = db.getSiblingDB("m6_nosql");
var delitos = curso.delitos_mexicali;

if (delitos.countDocuments({}) !== 175482) {
  throw new Error(
    "La colección no contiene los 175482 documentos esperados."
  );
}

print("=== PRESENCIA Y TIPOS DE CAMPOS ===");

printjson({
  totalDocumentos: delitos.countDocuments({}),

  sinClasificacionDelito: delitos.countDocuments({
    clasificacionDelito: { $exists: false }
  }),

  clasificacionesString: delitos.countDocuments({
    clasificacionDelito: { $type: "string" }
  }),

  sinFechaRegistro: delitos.countDocuments({
    fechaRegistro: { $exists: false }
  }),

  fechasRegistroDate: delitos.countDocuments({
    fechaRegistro: { $type: "date" }
  }),

  sinFechaOcurrencia: delitos.countDocuments({
    fechaOcurrencia: { $exists: false }
  }),

  fechasOcurrenciaDate: delitos.countDocuments({
    fechaOcurrencia: { $type: "date" }
  }),

  sinLugar: delitos.countDocuments({
    lugar: { $exists: false }
  }),

  sinMunicipio: delitos.countDocuments({
    "lugar.municipio": { $exists: false }
  }),

  sinNombreLugar: delitos.countDocuments({
    "lugar.nombre": { $exists: false }
  }),

  sinTipoLugar: delitos.countDocuments({
    "lugar.tipo": { $exists: false }
  }),

  conUbicacion: delitos.countDocuments({
    ubicacion: { $exists: true }
  }),

  sinUbicacion: delitos.countDocuments({
    ubicacion: { $exists: false }
  }),

  ubicacionesPoint: delitos.countDocuments({
    "ubicacion.type": "Point"
  })
});

print("=== DOMINIO DE MUNICIPIO ===");

printjson(
  delitos.distinct("lugar.municipio").sort()
);

print("=== DOMINIO DE TIPO DE LUGAR ===");

printjson(
  delitos.distinct("lugar.tipo").sort()
);

print("=== CLASIFICACIONES DELICTIVAS ===");

printjson(
  delitos.distinct("clasificacionDelito").sort()
);

print("=== CANTIDAD DE CLASIFICACIONES ===");

print(
  delitos.distinct("clasificacionDelito").length
);
