#!/usr/bin/env python3

import csv
from datetime import datetime
from pathlib import Path

from pymongo import MongoClient


RAIZ_PROYECTO = Path(__file__).resolve().parent.parent
ARCHIVO_CSV = RAIZ_PROYECTO / "datos" / "crimes_mxl_limpio.csv"

URI_MONGODB = "mongodb://127.0.0.1:27017"
BASE_DATOS = "m6_nosql"
COLECCION = "delitos_mexicali"
TAMANO_LOTE = 1000


def texto_o_none(valor):
    valor = (valor or "").strip()
    return valor if valor else None


def transformar_registro(registro):
    fecha_registro = datetime.strptime(
        registro["REGISTRATION_DATE"], "%d/%m/%Y"
    )

    fecha_hora_ocurrencia = datetime.strptime(
        registro["OCCURRED_DATE"] + " " + registro["CRIME_TIME"],
        "%d/%m/%Y %H:%M"
    )

    documento = {
        "clasificacionDelito": registro["CRIME_CLASSIFICATION"].strip(),
        "fechaRegistro": fecha_registro,
        "fechaOcurrencia": fecha_hora_ocurrencia,
        "lugar": {
            "municipio": registro["MUNICIPALITY"].strip()
        }
    }

    nombre_lugar = texto_o_none(registro["CRIME_SCENE"])
    tipo_lugar = texto_o_none(registro["TYPE"])

    if nombre_lugar is not None:
        documento["lugar"]["nombre"] = nombre_lugar

    if tipo_lugar is not None:
        documento["lugar"]["tipo"] = tipo_lugar

    longitud = texto_o_none(registro["X"])
    latitud = texto_o_none(registro["Y"])

    if longitud is not None and latitud is not None:
        longitud = float(longitud)
        latitud = float(latitud)

        if -180 <= longitud <= 180 and -90 <= latitud <= 90:
            documento["ubicacion"] = {
                "type": "Point",
                "coordinates": [longitud, latitud]
            }

    return documento


def insertar_lote(coleccion, lote):
    if lote:
        coleccion.insert_many(lote, ordered=False)


def main():
    if not ARCHIVO_CSV.exists():
        raise FileNotFoundError(
            "No se encontró el CSV limpio. "
            "Ejecuta primero: bash scripts/preparar_csv.sh"
        )

    cliente = MongoClient(
        URI_MONGODB,
        serverSelectionTimeoutMS=5000
    )

    cliente.admin.command("ping")

    base = cliente[BASE_DATOS]
    coleccion = base[COLECCION]

    coleccion.drop()

    lote = []
    total = 0
    con_ubicacion = 0
    sin_ubicacion = 0
    sin_nombre_lugar = 0

    with ARCHIVO_CSV.open(
        "r",
        encoding="utf-8",
        newline=""
    ) as archivo:
        lector = csv.DictReader(archivo)

        for registro in lector:
            documento = transformar_registro(registro)
            lote.append(documento)

            total += 1

            if "ubicacion" in documento:
                con_ubicacion += 1
            else:
                sin_ubicacion += 1

            if "nombre" not in documento["lugar"]:
                sin_nombre_lugar += 1

            if len(lote) == TAMANO_LOTE:
                insertar_lote(coleccion, lote)
                lote = []

                if total % 10000 == 0:
                    print(f"Registros procesados: {total}")

        insertar_lote(coleccion, lote)

    print()
    print("Carga terminada correctamente.")
    print(f"Base de datos: {BASE_DATOS}")
    print(f"Colección: {COLECCION}")
    print(f"Total de documentos: {total}")
    print(f"Con ubicación: {con_ubicacion}")
    print(f"Sin ubicación: {sin_ubicacion}")
    print(f"Sin nombre de lugar: {sin_nombre_lugar}")

    cliente.close()


if __name__ == "__main__":
    main()
