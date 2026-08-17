var curso = db.getSiblingDB("m6_nosql");
var nombreColeccion = "delitos_mexicali";
var coleccion = curso.getCollection(nombreColeccion);

var informacion = curso.getCollectionInfos({
  name: nombreColeccion
});

if (informacion.length !== 1) {
  throw new Error("No existe la colección delitos_mexicali.");
}

function encontrarJsonSchema(validador) {
  if (validador && validador.$jsonSchema) {
    return validador.$jsonSchema;
  }

  if (validador && Array.isArray(validador.$and)) {
    for (var posicion = 0; posicion < validador.$and.length; posicion++) {
      if (validador.$and[posicion].$jsonSchema) {
        return validador.$and[posicion].$jsonSchema;
      }
    }
  }

  return null;
}

var jsonSchema = encontrarJsonSchema(
  informacion[0].options.validator
);

if (!jsonSchema) {
  throw new Error(
    "No se encontró el JSON Schema existente. Ejecuta primero aplicar_validador.js."
  );
}

var reglaIntervalosGeograficos = {
  $or: [
    {
      ubicacion: {
        $exists: false
      }
    },
    {
      $and: [
        {
          "ubicacion.coordinates.0": {
            $gte: -180,
            $lte: 180
          }
        },
        {
          "ubicacion.coordinates.1": {
            $gte: -90,
            $lte: 90
          }
        }
      ]
    }
  ]
};

var documentosFueraDeIntervalo = coleccion.countDocuments({
  ubicacion: {
    $exists: true
  },
  $or: [
    {
      "ubicacion.coordinates.0": {
        $lt: -180
      }
    },
    {
      "ubicacion.coordinates.0": {
        $gt: 180
      }
    },
    {
      "ubicacion.coordinates.1": {
        $lt: -90
      }
    },
    {
      "ubicacion.coordinates.1": {
        $gt: 90
      }
    }
  ]
});

print("=== REVISIÓN PREVIA ===");
printjson({
  documentosFueraDeIntervalo: documentosFueraDeIntervalo,
  resultadoEsperado: 0
});

if (documentosFueraDeIntervalo !== 0) {
  throw new Error(
    "Existen documentos actuales fuera de los intervalos geográficos."
  );
}

var resultado = curso.runCommand({
  collMod: nombreColeccion,
  validator: {
    $and: [
      {
        $jsonSchema: jsonSchema
      },
      reglaIntervalosGeograficos
    ]
  },
  validationLevel: "strict",
  validationAction: "error"
});

print("=== RESULTADO DE COLLMOD ===");
printjson(resultado);

var configuracionFinal = curso.getCollectionInfos({
  name: nombreColeccion
})[0].options;

print("=== REGLAS GEOGRÁFICAS AGREGADAS ===");
printjson({
  longitudMinima: -180,
  longitudMaxima: 180,
  latitudMinima: -90,
  latitudMaxima: 90,
  validationLevel: configuracionFinal.validationLevel,
  validationAction: configuracionFinal.validationAction,
  validadorCombinado: Boolean(
    configuracionFinal.validator &&
    configuracionFinal.validator.$and
  )
});
