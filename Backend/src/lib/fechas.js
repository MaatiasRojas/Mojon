const FECHA_REGEX = /^\d{4}-\d{2}-\d{2}$/

function esFechaValida(fecha) {
    return typeof fecha == 'string' && FECHA_REGEX.test(fecha)
}

function parseFecha(fecha) {
    const [y, m, d] = fecha.split('-').map(Number)
    return new Date(y, m - 1, d)
}

function formatearFecha(fecha) {
    const y = fecha.getFullYear()
    const m = String(fecha.getMonth() + 1).padStart(2, '0')
    const d = String(fecha.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
}

//Devuelve cada dia "YYYY-MM-DD" entre inicio y fin
function expandirRango(fechaInicio, fechaFin) {
    const dias = []
    let actual = parseFecha(fechaInicio)
    const final = parseFecha(fechaFin)

    while (actual <= final) {
        dias.push(formatearFecha(actual))
        actual = new Date(actual.getFullYear(), actual.getMonth(), actual.getDate() + 1)
    }

    return dias
}

//Dos rangos [aInicio, aFin] y [bInicio, bFin] se solapan si no están. Entonces
//comparamos strings para que funcione directo porque el formato es cronologico.
function rangosSeSolapan(aInicio, aFin, bInicio, bFin) {
    return aInicio <= bFin && aFin >= bInicio
}

module.exports = {
    esFechaValida,
    parseFecha,
    formatearFecha,
    expandirRango,
    rangosSeSolapan,
}