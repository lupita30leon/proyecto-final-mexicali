#!/usr/bin/env python3
"""Genera el reporte final del proyecto en PDF a partir de la evidencia
conservada en documentacion/ y resultados/.

Este script no inventa cifras: toda métrica citada aquí ya existe en la
documentación del repositorio y debe coincidir con ella.

Capturas de pantalla reales: el reporte necesita tres capturas (ver la
lista de verificación de la guía). Mientras no existan, cada una se
muestra como un recuadro amarillo con instrucciones de qué capturar.
Para insertar la captura real, guarda la imagen en
`capturas_reporte/figura_1.png` (o .jpg), `capturas_reporte/figura_2.png`
y `capturas_reporte/figura_3.png` en la raíz del proyecto, y vuelve a
ejecutar este script: lo detecta automáticamente y sustituye el
recuadro por la imagen, conservando la leyenda de la figura.

Uso:
    python scripts/generar_reporte_final.py
"""

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import (
    HRFlowable,
    Image,
    KeepTogether,
    ListFlowable,
    ListItem,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

RAIZ_PROYECTO = Path(__file__).resolve().parent.parent
SALIDA_PDF = RAIZ_PROYECTO / "monkeydata_proyecto_nosql.pdf"
CARPETA_CAPTURAS = RAIZ_PROYECTO / "capturas_reporte"

# ---------------------------------------------------------------------------
# Datos de portada.
# ---------------------------------------------------------------------------
NOMBRE_EQUIPO = "Monkeydata"
INTEGRANTES = [
    "Guadalupe León Morales",
    "Silvia Alexa Gaona Amaya",
    "Martha Lucía Miranda Arteaga",
]

TITULO_PROYECTO = (
    "Análisis documental, temporal y geoespacial de registros "
    "delictivos de Mexicali mediante MongoDB"
)

# ---------------------------------------------------------------------------
# Estilos
# ---------------------------------------------------------------------------
estilos = getSampleStyleSheet()

estilos.add(
    ParagraphStyle(
        name="TituloPortada",
        parent=estilos["Title"],
        fontSize=20,
        leading=25,
        alignment=TA_CENTER,
        spaceAfter=18,
    )
)

estilos.add(
    ParagraphStyle(
        name="SubtituloPortada",
        parent=estilos["Normal"],
        fontSize=13,
        leading=17,
        alignment=TA_CENTER,
        spaceAfter=8,
    )
)

estilos.add(
    ParagraphStyle(
        name="H1Reporte",
        parent=estilos["Heading1"],
        fontSize=15,
        spaceBefore=14,
        spaceAfter=8,
        textColor=colors.HexColor("#1f3b57"),
    )
)

estilos.add(
    ParagraphStyle(
        name="H2Reporte",
        parent=estilos["Heading2"],
        fontSize=12,
        spaceBefore=10,
        spaceAfter=6,
        textColor=colors.HexColor("#2f5773"),
    )
)

estilos.add(
    ParagraphStyle(
        name="CuerpoReporte",
        parent=estilos["BodyText"],
        fontSize=9.5,
        leading=13,
        alignment=TA_JUSTIFY,
        spaceAfter=6,
    )
)

estilos.add(
    ParagraphStyle(
        name="CuerpoPequeno",
        parent=estilos["BodyText"],
        fontSize=8,
        leading=10.5,
        alignment=TA_JUSTIFY,
    )
)

estilos.add(
    ParagraphStyle(
        name="LeyendaFigura",
        parent=estilos["BodyText"],
        fontSize=8.5,
        leading=11,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#444444"),
        spaceAfter=10,
    )
)

estilos.add(
    ParagraphStyle(
        name="AvisoCaptura",
        parent=estilos["BodyText"],
        fontSize=9,
        leading=12,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#8a6d00"),
    )
)

ESTILO_TABLA_BASE = TableStyle(
    [
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1f3b57")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 7.5),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#b9b9b9")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f2f5f8")]),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
    ]
)


def tabla(encabezados, filas, anchos):
    datos = [encabezados] + filas
    datos_envueltos = [
        [Paragraph(str(c), estilos["CuerpoPequeno"]) for c in fila]
        for fila in datos
    ]
    t = Table(datos_envueltos, colWidths=anchos, repeatRows=1)
    t.setStyle(ESTILO_TABLA_BASE)
    return t


def imagen_captura_real(numero):
    """Busca capturas_reporte/figura_N.(png|jpg|jpeg) y la devuelve como
    Image si existe, o None si aún no se ha agregado."""
    for extension in ("png", "jpg", "jpeg"):
        ruta = CARPETA_CAPTURAS / f"figura_{numero}.{extension}"
        if ruta.exists():
            img = Image(str(ruta))
            ancho_maximo = 16 * cm
            if img.imageWidth > 0:
                escala = min(1.0, ancho_maximo / img.imageWidth)
                img.drawWidth = img.imageWidth * escala
                img.drawHeight = img.imageHeight * escala
            return img
    return None


def marcador_captura(numero, titulo, contenido_sugerido):
    """Inserta la captura real si ya se agregó a capturas_reporte/; si no,
    muestra una caja de aviso con instrucciones de qué capturar."""
    imagen = imagen_captura_real(numero)

    if imagen is not None:
        leyenda = Paragraph(f"Figura {numero}. {titulo}", estilos["LeyendaFigura"])
        return KeepTogether([imagen, Spacer(1, 3), leyenda, Spacer(1, 6)])

    cuerpo = Paragraph(
        f"<b>[Figura {numero} — pendiente de captura real]</b><br/>"
        f"{contenido_sugerido}",
        estilos["AvisoCaptura"],
    )
    caja = Table([[cuerpo]], colWidths=[16 * cm])
    caja.setStyle(
        TableStyle(
            [
                ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#c9a227")),
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#fbf3d9")),
                ("TOPPADDING", (0, 0), (-1, -1), 10),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("RIGHTPADDING", (0, 0), (-1, -1), 10),
            ]
        )
    )
    leyenda = Paragraph(f"Figura {numero}. {titulo}", estilos["LeyendaFigura"])
    return KeepTogether([caja, Spacer(1, 3), leyenda, Spacer(1, 6)])


def lista(items):
    return ListFlowable(
        [ListItem(Paragraph(i, estilos["CuerpoReporte"])) for i in items],
        bulletType="bullet",
        leftIndent=14,
    )


def separador():
    return HRFlowable(width="100%", thickness=0.6, color=colors.HexColor("#c9c9c9"), spaceBefore=4, spaceAfter=10)


# ---------------------------------------------------------------------------
# Construcción del documento
# ---------------------------------------------------------------------------
elementos = []

# --- Portada -----------------------------------------------------------
elementos.append(Spacer(1, 5 * cm))
elementos.append(Paragraph(TITULO_PROYECTO, estilos["TituloPortada"]))
elementos.append(Spacer(1, 0.6 * cm))
elementos.append(Paragraph("Reporte final del proyecto", estilos["SubtituloPortada"]))
elementos.append(Spacer(1, 1.5 * cm))
elementos.append(Paragraph(f"Equipo: {NOMBRE_EQUIPO}", estilos["SubtituloPortada"]))
elementos.append(Paragraph("Integrantes:", estilos["SubtituloPortada"]))
for nombre in INTEGRANTES:
    elementos.append(Paragraph(nombre, estilos["SubtituloPortada"]))
elementos.append(Spacer(1, 2 * cm))
elementos.append(
    Paragraph(
        "Conceptos avanzados de bases de datos NoSQL<br/>"
        "Manejo de bases de datos SQL y NoSQL en un entorno de nube<br/>"
        "Facultad de Ciencias e IIMAS, UNAM",
        estilos["SubtituloPortada"],
    )
)
elementos.append(Spacer(1, 1 * cm))
elementos.append(
    Paragraph(
        "Repositorio: github.com/lupita30leon/proyecto-final-mexicali",
        estilos["SubtituloPortada"],
    )
)
elementos.append(PageBreak())

# --- 1. Problema y datos ------------------------------------------------
elementos.append(Paragraph("1. Problema y datos", estilos["H1Reporte"]))

elementos.append(Paragraph(
    "El proyecto atiende el análisis de 175,482 registros delictivos del "
    "municipio de Mexicali (enero de 2014 a septiembre de 2024), obtenidos "
    "del conjunto público <b>Mexicali Crimes</b> en Kaggle. El volumen de "
    "información y sus atributos categóricos, temporales y geográficos "
    "requieren una estructura documental que permita consultarlos de forma "
    "organizada y eficiente.", estilos["CuerpoReporte"]))

elementos.append(Paragraph("Personas usuarias y decisiones que apoya", estilos["H2Reporte"]))
elementos.append(lista([
    "Personal de análisis de datos municipales y planeación de seguridad pública.",
    "Investigadoras e investigadores de fenómenos urbanos y delictivos.",
    "Analistas que exploran patrones temporales o territoriales.",
    "Personal técnico responsable de mantener el sistema de consulta.",
]))
elementos.append(Paragraph(
    "Los resultados son exploratorios y agregados: no se usan para estimar "
    "el riesgo individual de una persona, vivienda o establecimiento, ni "
    "para recomendar operativos o predecir delitos.", estilos["CuerpoReporte"]))

elementos.append(Paragraph("Preguntas del proyecto", estilos["H2Reporte"]))
elementos.append(lista([
    "¿Cuáles son las clasificaciones delictivas con mayor número de registros?",
    "¿Cómo se distribuyen los registros por año, mes, día de la semana y hora?",
    "¿Cuáles son los 20 registros más recientes de robo de vehículo ocurridos durante 2023?",
    "¿Cuáles son los 20 registros más recientes de Valle del Pedregal entre 2020 y 2024?",
    "¿Cuántos registros de robo de vehículo se encuentran dentro de cinco kilómetros de una ubicación de referencia registrada en Mirasol?",
]))

elementos.append(Paragraph("Procedencia y protección de los datos", estilos["H2Reporte"]))
elementos.append(Paragraph(
    "Fuente: Kaggle, conjunto <i>Mexicali Crimes</i>, archivo "
    "<font face='Courier'>crimes_mxl.csv</font>, incorporado el 14 de agosto "
    "de 2026. El archivo original se conserva sin modificaciones; la "
    "limpieza y transformación se hacen mediante scripts reproducibles. La "
    "fuente no contiene nombres, correos ni teléfonos; las coordenadas se "
    "tratan como información potencialmente sensible (ver sección 5).",
    estilos["CuerpoReporte"]))

elementos.append(Paragraph("Modelo documental (resumen)", estilos["H2Reporte"]))
elementos.append(Paragraph(
    "Un documento por registro, con fechas <font face='Courier'>BSON Date</font>, "
    "un objeto anidado <font face='Courier'>lugar</font> (municipio, nombre, "
    "tipo) y una ubicación <font face='Courier'>GeoJSON Point</font> opcional "
    "(35,019 registros no tienen coordenadas utilizables):",
    estilos["CuerpoReporte"]))

elementos.append(Paragraph(
    "<font face='Courier' size=7.5>"
    "{ clasificacionDelito: \"HOME ROBBERY\", fechaRegistro: ISODate(...), "
    "fechaOcurrencia: ISODate(...), lugar: { municipio: \"MEXICALI\", "
    "nombre: \"MIRASOL\", tipo: \"SUBDIVISION\" }, ubicacion: { type: "
    "\"Point\", coordinates: [-115.3862048, 32.60621895] } }</font>",
    estilos["CuerpoReporte"]))

elementos.append(PageBreak())

# --- 2. Implementación ---------------------------------------------------
elementos.append(Paragraph("2. Implementación", estilos["H1Reporte"]))

elementos.append(Paragraph("Consultas y pipelines principales", estilos["H2Reporte"]))
elementos.append(tabla(
    ["Consulta", "Resultado principal"],
    [
        ["Clasificaciones más frecuentes", "VEHICLE THEFT: 37,331 registros (1er lugar)"],
        ["Registros por año", "24,480 en 2014 a 8,764 en 2024 (parcial, hasta septiembre)"],
        ["Registros por hora", "12:00 es la hora con más registros: 11,895"],
        ["Lugares con más robo de vehículo", "INDEPENDENCIA: 968 registros (1er lugar)"],
        ["A: robo de vehículo en 2023 (20 más recientes)", "Filtro de igualdad + rango de fecha [inicio, fin)"],
        ["B: Valle del Pedregal 2020-2024 (20 más recientes)", "Filtro de igualdad + rango de fecha [inicio, fin)"],
    ],
    [7 * cm, 9 * cm],
))

elementos.append(Paragraph("Índices y rendimiento", estilos["H2Reporte"]))
elementos.append(Paragraph(
    "Se crearon dos índices compuestos y un índice geoespacial, derivados "
    "de patrones de consulta concretos, no de un campo por índice:",
    estilos["CuerpoReporte"]))
elementos.append(tabla(
    ["Consulta", "Plan antes", "nReturned", "Keys antes", "Docs antes",
     "Plan después", "Keys después", "Docs después"],
    [
        ["A. Robo de vehículo 2023", "COLLSCAN + SORT", "20", "0", "175,482",
         "IXSCAN cubierto", "20", "0"],
        ["B. Valle del Pedregal", "COLLSCAN + SORT", "20", "0", "175,482",
         "IXSCAN + FETCH", "20", "20"],
    ],
    [3.3 * cm, 2.3 * cm, 1.5 * cm, 1.5 * cm, 1.5 * cm, 2.6 * cm, 1.6 * cm, 1.6 * cm],
))
elementos.append(Paragraph(
    "<b>¿Por qué la consulta A llega a 0 documentos y 20 llaves examinadas?</b> "
    "Los tres campos que la consulta A devuelve "
    "(<font face='Courier'>_id</font>, <font face='Courier'>clasificacionDelito</font>, "
    "<font face='Courier'>fechaOcurrencia</font>) ya forman parte de las llaves del "
    "índice <font face='Courier'>idx_clasificacion_fecha_id</font>. MongoDB resuelve toda la "
    "consulta leyendo sólo el índice (20 llaves, una por resultado) sin abrir "
    "ningún documento de la colección: es un índice cubierto "
    "(<font face='Courier'>PROJECTION_COVERED</font>). La consulta B necesita "
    "<font face='Courier'>lugar.nombre</font>, que no es un valor devuelto por su índice, "
    "así que sí abre los 20 documentos (<font face='Courier'>FETCH</font>) después de "
    "ubicar las 20 llaves. Detalle completo en "
    "<font face='Courier'>documentacion/03_indices_rendimiento.md</font>.",
    estilos["CuerpoReporte"]))

elementos.append(marcador_captura(
    1,
    "Consulta principal: salida de explain(\"executionStats\") de la consulta A "
    "antes (COLLSCAN, 175,482 docs examinados) y después (IXSCAN cubierto, 0 "
    "docs examinados) de crear el índice idx_clasificacion_fecha_id. "
    "Fuente sugerida: resultados/medicion_antes_indices.txt y "
    "resultados/medicion_despues_indices.txt.",
    "Tomar dos capturas del shell de mongosh mostrando el bloque "
    "'CONSULTA A' de cada archivo de resultados, con las etapas del plan "
    "y las tres métricas visibles.",
))

elementos.append(Paragraph("Validación y calidad", estilos["H2Reporte"]))
elementos.append(Paragraph(
    "Validador <font face='Courier'>$jsonSchema</font> aplicado mediante "
    "<font face='Courier'>collMod</font>, con "
    "<font face='Courier'>validationLevel: \"strict\"</font> y "
    "<font face='Courier'>validationAction: \"error\"</font>. Controla campos "
    "obligatorios, tipos BSON, dominios permitidos (16 clasificaciones, "
    "municipio único, 3 tipos de lugar), estructura GeoJSON y los "
    "intervalos de longitud/latitud mediante una regla de consulta "
    "complementaria.", estilos["CuerpoReporte"]))
elementos.append(tabla(
    ["Resultado", "Casos"],
    [
        ["Documentos válidos aceptados", "2"],
        ["Documentos inválidos rechazados (estructura, dominio y GeoJSON)", "9"],
        ["Resultados diferentes de lo esperado", "0"],
    ],
    [12 * cm, 4 * cm],
))

elementos.append(PageBreak())

# --- 3. Análisis especializado -------------------------------------------
elementos.append(Paragraph("3. Análisis especializado", estilos["H1Reporte"]))

elementos.append(Paragraph("Componente elegido: análisis geoespacial", estilos["H2Reporte"]))
elementos.append(Paragraph(
    "El componente geoespacial se eligió porque la pregunta 5 del proyecto "
    "requiere explícitamente una relación de <b>proximidad</b>, algo que ni "
    "el análisis temporal ni la búsqueda textual pueden resolver por sí "
    "solos. Se usó <font face='Courier'>$geoNear</font> como primera etapa del "
    "pipeline sobre un índice <font face='Courier'>2dsphere</font>.",
    estilos["CuerpoReporte"]))

elementos.append(tabla(
    ["Indicador", "Resultado"],
    [
        ["Punto de referencia", "MIRASOL: [-115.3862048, 32.60621895]"],
        ["Radio de búsqueda", "5,000 metros"],
        ["Robos de vehículo dentro del radio", "9,513"],
        ["Distancia promedio", "2,721.06 metros"],
        ["Distancia máxima observada", "4,989.75 metros"],
    ],
    [8 * cm, 8 * cm],
))

elementos.append(Paragraph(
    "<b>¿Qué pregunta responde?</b> Dimensiona cuántos reportes de robo de "
    "vehículo caen dentro de un radio operativo fijo alrededor de un punto, "
    "útil por ejemplo para explorar cobertura de un radio de patrullaje o "
    "atención — no para calificar la zona.", estilos["CuerpoReporte"]))

elementos.append(Paragraph(
    "<b>¿Por qué Mirasol?</b> Es la misma referencia usada en el modelo "
    "documental desde el planteamiento del problema (trazabilidad); varios "
    "eventos comparten esa coordenada exacta, lo que permite construir un "
    "caso de control verificable a mano; y es una ubicación real dentro del "
    "municipio, no un caso extremo. <b>No</b> se eligió por ser la colonia "
    "con más incidencia: esa comparación entre zonas no se realizó.",
    estilos["CuerpoReporte"]))

elementos.append(Paragraph(
    "<b>Por qué esto no es \"mayor riesgo\":</b> no existe un denominador de "
    "población, vehículos registrados o exposición por zona; no se comparó "
    "el mismo indicador contra otros puntos de referencia; y el punto se "
    "eligió por reproducibilidad, no por un análisis previo de incidencia. "
    "El resultado se limita a un conteo absoluto dentro de un radio fijo.",
    estilos["CuerpoReporte"]))

elementos.append(marcador_captura(
    2,
    "Análisis especializado: salida de scripts/analisis_geoespacial.js "
    "mostrando el pipeline $geoNear + $group con el resultado de 9,513 "
    "registros, distancia promedio y máxima. "
    "Fuente sugerida: resultados/analisis_geoespacial.txt.",
    "Capturar el bloque 'ROBOS DE VEHÍCULO DENTRO DE 5 KM' del archivo de "
    "resultados, junto con el punto de referencia usado.",
))

elementos.append(Paragraph("Técnicas complementarias y descartadas", estilos["H2Reporte"]))
elementos.append(tabla(
    ["Técnica", "Decisión", "Justificación"],
    [
        ["Análisis temporal", "Integrado como complemento",
         "Las fechas BSON permiten intervalos [inicio, fin), pipelines por mes/día/hora e índices que ya se necesitaban para las consultas A y B; se documenta en documentacion/06_analisis_temporal.md."],
        ["Búsqueda con $text", "Descartada",
         "lugar.nombre es un nombre propio corto, no texto libre; $text tokeniza y puntúa por relevancia, algo pensado para prosa, no para nombres de colonias."],
        ["Búsqueda con $regex", "Integrada",
         "Resuelve directamente la coincidencia parcial o de mayúsculas/minúsculas que necesita el caso de uso real (documentacion/10_busqueda.md)."],
        ["$geoWithin / $geoIntersects", "Descartadas para esta pregunta",
         "La pregunta 5 requiere proximidad a un punto, no pertenencia a un polígono ni intersección de geometrías."],
    ],
    [3.2 * cm, 3.3 * cm, 9.5 * cm],
))

elementos.append(PageBreak())

# --- 4. Seguridad y cierre ------------------------------------------------
elementos.append(Paragraph("4. Seguridad y cierre", estilos["H1Reporte"]))

elementos.append(Paragraph("Clasificación de datos", estilos["H2Reporte"]))
elementos.append(tabla(
    ["Campo", "Individual", "Agregado", "Motivo"],
    [
        ["_id", "Interno", "Se excluye", "Identificador técnico; permite rastrear un documento entre consultas."],
        ["clasificacionDelito", "Interno", "Público", "Sola es genérica; combinada con fecha y lugar exactos reconstruye un evento."],
        ["fechaOcurrencia", "Sensible", "Público (año-mes)", "La marca exacta facilita correlacionar con fuentes externas."],
        ["lugar.nombre", "Interno", "Público", "Cruzado con fecha exacta aumenta el riesgo de reidentificación indirecta."],
        ["ubicacion.coordinates", "Sensible", "Sensible salvo generalizar", "Cuasi-identificador espacial de un evento."],
    ],
    [3.3 * cm, 2.2 * cm, 3 * cm, 7.5 * cm],
))

elementos.append(Paragraph("Minimización, generalización y enmascaramiento", estilos["H2Reporte"]))
elementos.append(Paragraph(
    "La vista <font face='Courier'>vista_publica_delitos</font> "
    "(<font face='Courier'>scripts/salida_protegida_rol_consulta.js</font>) excluye "
    "<font face='Courier'>_id</font> y <font face='Courier'>ubicacion</font>, generaliza la "
    "fecha a año-mes y entrega sólo conteos agregados por clasificación, "
    "colonia y periodo. Es la salida que consume el rol de sólo lectura "
    "pública.", estilos["CuerpoReporte"]))

elementos.append(Paragraph("Matriz de roles y privilegio mínimo", estilos["H2Reporte"]))
elementos.append(tabla(
    ["Rol", "Recurso", "Operaciones", "Lee datos crudos", "Escribe", "Administra"],
    [
        ["rol_lectura_publica", "vista_publica_delitos", "find", "No", "No", "No"],
        ["rol_analista_interno", "delitos_mexicali", "find", "Sí", "No", "No"],
        ["rol_carga_datos", "delitos_mexicali", "find, insert", "Sí", "Sólo insertar", "No"],
        ["rol_administrador_indices", "delitos_mexicali", "createIndex, dropIndex, collMod", "No", "No", "Sí"],
    ],
    [3.6 * cm, 3.6 * cm, 3.6 * cm, 1.9 * cm, 1.9 * cm, 1.6 * cm],
))

elementos.append(marcador_captura(
    3,
    "Evidencia de índice, validación o protección: salida de "
    "scripts/salida_protegida_rol_consulta.js comparando un documento crudo "
    "de MIRASOL contra su fila equivalente en vista_publica_delitos, y/o "
    "la salida de curso.getRoles({showPrivileges:true}) de "
    "scripts/seguridad_roles_acceso.js. "
    "Fuente sugerida: resultados/salida_protegida_rol_consulta.txt y "
    "resultados/seguridad_roles_acceso.txt.",
    "Capturar el bloque de comparación campo por campo (paso 4 del "
    "script) y el diagnóstico de autenticación del script de roles.",
))

elementos.append(Paragraph("Credenciales y cifrado", estilos["H2Reporte"]))
elementos.append(Paragraph(
    "Ningún script contiene usuarios ni contraseñas. La conexión de "
    "desarrollo es local y sin credenciales "
    "(<font face='Courier'>mongodb://127.0.0.1:27017</font>); las contraseñas de "
    "prueba se leen de variables de entorno "
    "(<font face='Courier'>PASSWORD_ANALISTA</font>, "
    "<font face='Courier'>PASSWORD_LECTURA</font>) definidas fuera del repositorio. "
    "El laboratorio no cifra tránsito ni almacenamiento porque es un "
    "entorno local de un solo usuario; un entorno objetivo en AWS (por "
    "ejemplo, Amazon DocumentDB) requeriría TLS obligatorio, cifrado en "
    "reposo administrado por el proveedor y un gestor de secretos.",
    estilos["CuerpoReporte"]))

elementos.append(Paragraph("Rol diseñado frente a denegación comprobada", estilos["H2Reporte"]))
elementos.append(Paragraph(
    "El servidor usado en el desarrollo no tiene "
    "<font face='Courier'>security.authorization: enabled</font>. Los cuatro roles "
    "están <b>diseñados y son verificables</b>, pero la <b>denegación real</b> "
    "de una operación fuera de privilegio sólo se reporta como comprobada "
    "si el script detecta autenticación activa y captura el error "
    "<font face='Courier'>not authorized</font> correspondiente; si no la detecta, lo "
    "documenta en vez de asumirlo.", estilos["CuerpoReporte"]))

elementos.append(Paragraph("Resultados principales", estilos["H2Reporte"]))
elementos.append(lista([
    "VEHICLE THEFT es la clasificación más frecuente, con 37,331 registros.",
    "Los índices redujeron los documentos examinados de 175,482 a 0 (consulta A, índice cubierto) y a 20 (consulta B).",
    "9,513 robos de vehículo se ubican dentro de 5 km del punto de referencia en Mirasol, sin que esto implique mayor riesgo relativo.",
    "El validador aceptó 2 documentos correctos y rechazó 9 inconsistentes, incluyendo violaciones geográficas.",
    "La vista vista_publica_delitos entrega salida agregada y minimizada para el rol de consulta pública.",
]))

elementos.append(Paragraph("Límites", estilos["H2Reporte"]))
elementos.append(lista([
    "No hay denominador poblacional ni de exposición para calcular tasas por colonia.",
    "El año 2024 está incompleto (hasta septiembre).",
    "No se confirmó la zona horaria de las fechas contra una fuente oficial.",
    "35,019 registros no tienen coordenadas y quedan fuera del análisis geoespacial.",
    "La autenticación no estuvo activa en el entorno de desarrollo, por lo que la denegación de privilegios se diseñó pero no siempre pudo comprobarse en ejecución.",
]))

elementos.append(Paragraph("Una mejora posible", estilos["H2Reporte"]))
elementos.append(Paragraph(
    "Incorporar un denominador de exposición por colonia (por ejemplo, "
    "número de vehículos registrados o población estimada) permitiría "
    "convertir los conteos geoespaciales y territoriales en tasas "
    "comparables entre zonas, en lugar de conteos absolutos que sólo "
    "describen el volumen de registros de la fuente.",
    estilos["CuerpoReporte"]))

doc = SimpleDocTemplate(
    str(SALIDA_PDF),
    pagesize=letter,
    leftMargin=1.8 * cm,
    rightMargin=1.8 * cm,
    topMargin=1.6 * cm,
    bottomMargin=1.6 * cm,
    title=TITULO_PROYECTO,
    author=NOMBRE_EQUIPO,
)

doc.build(elementos)

print(f"Reporte generado en: {SALIDA_PDF}")
