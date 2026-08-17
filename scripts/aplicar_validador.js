var curso = db.getSiblingDB("m6_nosql");
var delitos = curso.delitos_mexicali;

if (delitos.countDocuments({}) !== 175482) {
  throw new Error(
    "La colección no contiene los 175482 documentos esperados."
  );
}

var clasificacionesPermitidas = [
  "BANK ROBBERY",
  "CULPABLE INJURIES",
  "HOME ROBBERY",
  "HOME ROBBERY WITH VIOLENCE",
  "HOMICIDE (FEMICIDE)",
  "HOMICIDE (VIOLENT)",
  "KIDNAPPING",
  "MALICIOUS INJURY",
  "OTHER NONVIOLENT ROBBERIES",
  "OTHER ROBBERIES WITH VIOLENCE",
  "ROBBERY TO COMMERCE",
  "ROBBERY WITH VIOLENCE (IN PUBLIC STREETS)",
  "ROBBERY WITH VIOLENCE TO COMMERCE",
  "SIMPLE THEFT (ON PUBLIC ROADS)",
  "VEHICLE THEFT",
  "VEHICLE THEFT WITH VIOLENCE"
];

var esquemaDelito = {
  bsonType: "object",
  required: [
    "clasificacionDelito",
    "fechaRegistro",
    "fechaOcurrencia",
    "lugar"
  ],
  additionalProperties: false,
  properties: {
    _id: {
      bsonType: "objectId",
      description: "Identificador único generado por MongoDB."
    },

    clasificacionDelito: {
      bsonType: "string",
      enum: clasificacionesPermitidas,
      description:
        "Debe ser una de las 16 clasificaciones observadas."
    },

    fechaRegistro: {
      bsonType: "date",
      description: "Debe almacenarse como BSON Date."
    },

    fechaOcurrencia: {
      bsonType: "date",
      description: "Debe almacenarse como BSON Date."
    },

    lugar: {
      bsonType: "object",
      required: ["municipio"],
      additionalProperties: false,
      properties: {
        municipio: {
          bsonType: "string",
          enum: ["MEXICALI"],
          description:
            "El conjunto corresponde al municipio de Mexicali."
        },

        nombre: {
          bsonType: "string",
          minLength: 1,
          description:
            "Es opcional porque falta en 19 documentos."
        },

        tipo: {
          bsonType: "string",
          enum: [
            "CITY",
            "COLONY",
            "SUBDIVISION"
          ],
          description:
            "Es opcional porque falta en 35019 documentos."
        }
      }
    },

    ubicacion: {
      bsonType: "object",
      required: [
        "type",
        "coordinates"
      ],
      additionalProperties: false,
      properties: {
        type: {
          bsonType: "string",
          enum: ["Point"]
        },

        coordinates: {
          bsonType: "array",
          minItems: 2,
          maxItems: 2,
          items: {
            bsonType: "double"
          },
          description:
            "Coordenadas en orden longitud-latitud."
        }
      }
    }
  }
};

var resultado = curso.runCommand({
  collMod: "delitos_mexicali",
  validator: {
    $jsonSchema: esquemaDelito
  },
  validationLevel: "strict",
  validationAction: "error"
});

print("=== RESULTADO DE COLLMOD ===");
printjson(resultado);

if (resultado.ok !== 1) {
  throw new Error(
    "No fue posible aplicar el validador."
  );
}

print("=== VALIDADOR CONFIGURADO ===");

printjson(
  curso.getCollectionInfos({
    name: "delitos_mexicali"
  })[0].options
);
