#!/usr/bin/env bash
set -eu

ROOT_DIR=$(CDPATH='' cd -- "$(dirname -- "$0")/.." && pwd)

ARCHIVO_ORIGINAL="$ROOT_DIR/datos/crimes_mxl.csv"
ARCHIVO_LIMPIO="$ROOT_DIR/datos/crimes_mxl_limpio.csv"

if [ ! -f "$ARCHIVO_ORIGINAL" ]; then
  echo "ERROR: No se encontró $ARCHIVO_ORIGINAL"
  exit 1
fi

sed '1s/^\xEF\xBB\xBF//' "$ARCHIVO_ORIGINAL" > "$ARCHIVO_LIMPIO"

echo "Archivo limpio creado correctamente:"
echo "$ARCHIVO_LIMPIO"

echo "Cantidad de líneas:"
wc -l "$ARCHIVO_LIMPIO"

echo "Encabezado:"
head -n 1 "$ARCHIVO_LIMPIO"
