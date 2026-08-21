// Construye y comprueba la salida protegida que consumiría el
// rol_lectura_publica definido en scripts/seguridad_roles_acceso.js.
//
// La minimización aplicada combina las cuatro técnicas pedidas por la
// guía de la semana 5:
//   - Exclusión:     se elimina _id y el objeto "ubicacion" completo.
//   - Generalización: la fecha exacta se reduce a "año-mes" y la
//                      ubicación puntual se reduce al nombre de colonia.
//   - Minimización:  sólo se conservan los campos necesarios para
//                      describir un patrón agregado, no un evento.
//   - Enmascaramiento: el resultado se entrega como conteo agregado,
//                      nunca como documento identificable de forma
//                      individual.

var curso = db.getSiblingDB("m6_nosql");
var delitos = curso.delitos_mexicali;

if (delitos.countDocuments({}) !== 175482) {
  throw new Error(
    "La colección no contiene los 175482 documentos esperados."
  );
}

print("=== 1. DOCUMENTO CRUDO (NIVEL INTERNO, NO PARA ROL DE CONSULTA) ===");

var documentoCrudo = delitos.findOne({
  "lugar.nombre": "MIRASOL",
  "ubicacion.coordinates": [-115.3862048, 32.60621895]
});

printjson(documentoCrudo);

print("=== 2. VISTA PROTEGIDA vista_publica_delitos ===");

curso.vista_publica_delitos.drop();

curso.createView("vista_publica_delitos", "delitos_mexicali", [
  {
    $match: {
      ubicacion: { $exists: true }
    }
  },
  {
    $group: {
      _id: {
        clasificacionDelito: "$clasificacionDelito",
        colonia: "$lugar.nombre",
        periodo: {
          $dateToString: {
            format: "%Y-%m",
            date: "$fechaOcurrencia"
          }
        }
      },
      totalRegistros: { $sum: 1 }
    }
  },
  {
    $project: {
      _id: 0,
      clasificacionDelito: "$_id.clasificacionDelito",
      colonia: "$_id.colonia",
      periodo: "$_id.periodo",
      totalRegistros: 1
    }
  }
]);

print("Vista creada correctamente.");

print("=== 3. FILA CORRESPONDIENTE EN LA VISTA PROTEGIDA ===");

var filaProtegida = curso.vista_publica_delitos.findOne({
  colonia: "MIRASOL",
  clasificacionDelito: documentoCrudo.clasificacionDelito,
  periodo: documentoCrudo.fechaOcurrencia
    .toISOString()
    .slice(0, 7)
});

printjson(filaProtegida);

print("=== 4. COMPARACIÓN: QUÉ SE EXCLUYÓ, GENERALIZÓ O ENMASCARÓ ===");

printjson({
  _id: {
    documentoCrudo: "presente",
    vistaProtegida: "excluido"
  },
  fechaOcurrencia: {
    documentoCrudo: "marca de tiempo exacta",
    vistaProtegida: "generalizada a año-mes (" + filaProtegida.periodo + ")"
  },
  ubicacion: {
    documentoCrudo: "coordenadas GeoJSON exactas",
    vistaProtegida: "excluida; sólo se conserva el nombre de colonia"
  },
  nivelDeAgregacion: {
    documentoCrudo: "un evento individual",
    vistaProtegida:
      "conteo agregado de " + filaProtegida.totalRegistros +
      " registros que comparten clasificación, colonia y mes"
  }
});

print("=== 5. COMPROBACIÓN: LA VISTA NO EXPONE DOCUMENTOS INDIVIDUALES ===");

var camposExpuestos = Object.keys(filaProtegida);
var camposProhibidos = ["_id", "ubicacion", "fechaOcurrencia", "fechaRegistro"];

var contieneCampoProhibido = camposExpuestos.some(function (campo) {
  return camposProhibidos.indexOf(campo) !== -1;
});

if (contieneCampoProhibido) {
  throw new Error(
    "La vista protegida expone un campo que debía excluirse o generalizarse."
  );
}

print(
  "Correcto: la vista protegida sólo expone " +
  camposExpuestos.join(", ") +
  ", ninguno de ellos identifica un evento individual."
);

print("=== 6. RESULTADO DE MUESTRA PARA UN ROL DE CONSULTA ===");

printjson(
  curso.vista_publica_delitos
    .find({ clasificacionDelito: "VEHICLE THEFT" })
    .sort({ totalRegistros: -1 })
    .limit(5)
    .toArray()
);
