#!/usr/bin/env bash

set -euo pipefail

PROJECT_DIR=$(CDPATH='' cd -- "$(dirname -- "$0")/.." && pwd)
M6_NOSQL_DIR="${M6_NOSQL_DIR:-$HOME/m6-nosql}"

if [ "${1:-}" != "--confirmar" ]; then
  echo "Este proceso reconstruye la colección delitos_mexicali."
  echo "Para ejecutarlo utiliza:"
  echo "bash scripts/ejecutar_proyecto.sh --confirmar"
  exit 0
fi

if [ ! -f "$M6_NOSQL_DIR/setup/lib/mongodb_local.sh" ]; then
  echo "ERROR: No se encontró la configuración de MongoDB."
  echo "Ruta esperada: $M6_NOSQL_DIR/setup/lib/mongodb_local.sh"
  exit 1
fi

if [ ! -f "$PROJECT_DIR/datos/crimes_mxl.csv" ]; then
  echo "ERROR: No se encontró datos/crimes_mxl.csv"
  exit 1
fi

cd "$PROJECT_DIR"

source "$M6_NOSQL_DIR/setup/lib/mongodb_local.sh"
mongodb_iniciar

ejecutar_mongo() {
  local archivo_script="$1"
  local archivo_resultado="$2"

  echo
  echo "Ejecutando: $archivo_script"

  "$MONGOSH_BIN" "$(mongodb_database_url)" \
    --quiet \
    "$archivo_script" \
    | tee "$archivo_resultado"
}

echo "========================================"
echo "RECONSTRUCCIÓN DEL PROYECTO"
echo "========================================"

echo
echo "1. Preparando el archivo CSV"
bash scripts/preparar_csv.sh \
  | tee resultados/preparacion_csv.txt

echo
echo "2. Cargando y transformando los datos"
python3 scripts/cargar_mongodb.py \
  | tee resultados/carga_mongodb.txt

echo
echo "3. Ejecutando consultas funcionales"
ejecutar_mongo \
  scripts/consultas_funcionales.js \
  resultados/consultas_funcionales.txt

echo
echo "4. Midiendo el rendimiento antes de crear índices"
ejecutar_mongo \
  scripts/medicion_antes_indices.js \
  resultados/medicion_antes_indices.txt

echo
echo "5. Creando índices compuestos"
ejecutar_mongo \
  scripts/crear_indices.js \
  resultados/creacion_indices.txt

echo
echo "6. Midiendo el rendimiento después de crear índices"
ejecutar_mongo \
  scripts/medicion_despues_indices.js \
  resultados/medicion_despues_indices.txt

echo
echo "7. Generando el perfil de calidad"
ejecutar_mongo \
  scripts/perfil_calidad.js \
  resultados/perfil_calidad.txt

echo
echo "8. Aplicando el validador"
ejecutar_mongo \
  scripts/aplicar_validador.js \
  resultados/aplicacion_validador.txt

echo
echo "9. Reforzando los intervalos geográficos"
ejecutar_mongo \
  scripts/reforzar_validador_geografico.js \
  resultados/refuerzo_validador_geografico.txt

echo
echo "10. Probando las reglas de validación"
ejecutar_mongo \
  scripts/probar_validador.js \
  resultados/pruebas_validador.txt

echo
echo "11. Generando el perfil geoespacial"
ejecutar_mongo \
  scripts/perfil_geoespacial.js \
  resultados/perfil_geoespacial.txt

echo
echo "12. Ejecutando el análisis geoespacial"
ejecutar_mongo \
  scripts/analisis_geoespacial.js \
  resultados/analisis_geoespacial.txt

echo
echo "13. Ejecutando las pruebas geográficas adicionales"
ejecutar_mongo \
  scripts/pruebas_geograficas_adicionales.js \
  resultados/pruebas_geograficas_adicionales.txt

echo
echo "14. Ejecutando el análisis temporal"
ejecutar_mongo \
  scripts/analisis_temporal.js \
  resultados/analisis_temporal.txt

echo
echo "15. Ejecutando la comprobación final"
ejecutar_mongo \
  scripts/evidencia_final.js \
  resultados/evidencia_final.txt

echo
echo "========================================"
echo "PROCESO TERMINADO CORRECTAMENTE"
echo "========================================"
echo "Base de datos: m6_nosql"
echo "Colección: delitos_mexicali"
echo "Resultados: $PROJECT_DIR/resultados"
