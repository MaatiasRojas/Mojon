export const DIAS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
export const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

export function aFecha(fecha) {
    const y = fecha.getFullYear()
    const m = String(fecha.getMonth() + 1).padStart(2, '0')
    const d = String(fecha.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
}

export function parseFecha(fecha) {
    const [y, m, d] = fecha.split('-').map(Number)
    return new Date(y, m - 1, d)
}

export function generarDiasDelMes(anio, mes) {
    const primerDia = new Date(anio, mes, 1)
    const ultimoDia = new Date(anio, mes + 1, 0)
    //getDay(): 0=Domingo..6=sabado. Se corrio para que la semana arranque el lunes
    const offset = (primerDia.getDay() + 6) % 7

    const dias = []
    for (let i = 0; i < offset; i++) {dias.push(null)}
    for (let d = 0; d <= ultimoDia.getDate(); d++) {
        dias.push(new Date(anio, mes, d))
    }
    return dias
}

//Devuelve cada dia "YYYY-MM-DD" entre inicio y fin
export function expandirRango(inicio, fin) {
    const dias = []
    let actual = parseFecha(inicio)
    const final = parseFecha(fin)

    while (actual <= final) {
        dias.push(aFecha(actual))
        actual = new Date(actual.getFullYear(), actual.getMonth(), actual.getDate() + 1)
    }

    return dias
}

export function conflictoRango(fechaInicio, fechaFin, ocupadas) {
    return expandirRango(fechaInicio, fechaFin).some((dia) => ocupadas.has(dia))
}

// Estado siguiente al clickear un día, estilo Airbnb:
// - Si no había inicio, o ya había un rango completo -> arranca uno nuevo.
// - Si clickeás antes del inicio actual -> ese día pasa a ser el nuevo inicio.
// - Si no -> ese día cierra el rango como fin.
export function calcularNuevoRango({ inicio, fin }, diaClickeado) {
    if (!inicio || fin) {
        return { inicio: diaClickeado, fin: null }
    }
    if (diaClickeado < inicio) {
        return { inicio: diaClickeado, fin: null }
    }
    return { inicio, fin: diaClickeado }
}

export function formatearRangoLegible(inicio, fin) {
    const opciones = { day: 'numeric', month: 'long', year: 'numeric' }
    const textoInicio = parseFecha(inicio).toLocaleDateString('es-AR', opciones)
    if (!fin || fin === inicio) return textoInicio
    
    const textoFin = parseFecha(fin).toLocaleDateString('es-AR', opciones)
    return `del ${textoInicio} - al ${textoFin}`
}

export function formatearRangoCorto(inicio, fin) {
    const opciones = { day: 'numeric', month: 'short', year: 'numeric' }
    const textoInicio = parseFecha(inicio).toLocaleDateString('es-AR', opciones)
    if (!fin || fin === inicio) return textoInicio
    
    const textoFin = parseFecha(fin).toLocaleDateString('es-AR', opciones)
    return `${textoInicio} — ${textoFin}`
}
