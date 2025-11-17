import { llamarAPI } from './api.js';
import {
    prepararContenedor,
    obtenerElemento,
    mostrarElemento,
    ocultarElemento,
    vaciarContenedor
} from './dom.js';
import { inicializarModales, abrirModal, cerrarModal, mostrarModalConfirmacion } from './modal.js';
import {
    mostrarAlertaExito,
    mostrarAlertaError,
    mostrarAlertaAdvertencia,
    mostrarAlertaInfo
} from './notificaciones.js';
import {
    cargarHistorialGabinete, crearReporteCambioEstado, crearAvisoInformativo,
    configurarBotonesEstado, configurarModalCambioEstado,
    configurarModalAviso
} from './reportes.js';

const rolUsuario = document.body.dataset.rolUsuario;
const idAula = document.body.dataset.aulaId;
const usuarioId = document.body.dataset.usuarioId;
let computadoraActual = null;
let accionModalCompletada = false;
let estadoActualizadoEnTiempoReal = null;
let ultimoCambioPeriferico = 0;
const COOLDOWN_PERIFERICO = 5000;

async function cargarComputadoras(idDelAula) {
    prepararContenedor("contenedorBdr", "Cargando computadoras...", 'info');
    try {
        const computadoras = await llamarAPI(`/obtener_computadoras_aula/${idDelAula}`);
        if (!computadoras || computadoras.length === 0) {
            prepararContenedor("contenedorBdr", "No hay computadoras registradas en esta aula.", 'warning');
            return;
        }
        mostrarComputadoras(computadoras);
    } catch (error) {
        prepararContenedor("contenedorBdr", `No se pudieron cargar las computadoras: ${error.message}`, 'error');
        mostrarAlertaError(`Error al cargar computadoras: ${error.message}`);
    }
}

function obtenerImagenEstadoBDR(estado) {
    const estadoNormalizado = (estado || "").toLowerCase();
    switch (estadoNormalizado) {
        case "funcionando":
            return '/static/img/bdr_funcionando.png';
        case "en revision":
            return '/static/img/bdr_revision.png';
        case "no disponible":
        default:
            return '/static/img/bdr_nodisponible.png';
    }
}

function mostrarComputadoras(computadoras) {
    const contenedor = prepararContenedor("contenedorBdr");
    if (!contenedor) return;
    computadoras.sort((a, b) => a.id_bdr - b.id_bdr);
    computadoras.forEach(compu => {
        const clon = document.getElementById("plantillaCompu").content.cloneNode(true);
        const tarjeta = clon.querySelector('.card');
        tarjeta.dataset.bdrId = compu.id_bdr;
        clon.querySelector('[data-compu="titulo"]').textContent = `BDR ${String(compu.id_bdr).slice(-2)}`;
        clon.querySelector('[data-compu="estado_actual"]').textContent = compu.estado_actual || "Desconocido";
        const img = clon.querySelector('[data-compu="imagen"]');
        img.src = obtenerImagenEstadoBDR(compu.estado_actual);

        const indicadorGabinete = clon.querySelector('[data-compu="indicador-gabinete"]');
        const textoGabinete = clon.querySelector('[data-compu="texto-gabinete"]');
        if (compu.id_gabinete) {
            indicadorGabinete.style.backgroundColor = '#4caf50';
            indicadorGabinete.title = `Gabinete ${compu.id_gabinete} asignado`;
            textoGabinete.textContent = 'Gabinete';
        } else {
            indicadorGabinete.style.backgroundColor = '#f44336';
            indicadorGabinete.title = 'Sin gabinete asignado';
            textoGabinete.textContent = 'Gabinete';
        }

        const indicadorMonitor = clon.querySelector('[data-compu="indicador-monitor"]');
        const textoMonitor = clon.querySelector('[data-compu="texto-monitor"]');
        if (compu.id_monitor) {
            indicadorMonitor.style.backgroundColor = '#4caf50';
            indicadorMonitor.title = `Monitor ${compu.id_monitor} asignado`;
            textoMonitor.textContent = 'Monitor';
        } else {
            indicadorMonitor.style.backgroundColor = '#f44336';
            indicadorMonitor.title = 'Sin monitor asignado';
            textoMonitor.textContent = 'Monitor';
        }

        const indicadorMouse = clon.querySelector('[data-compu="indicador-mouse"]');
        const textoMouse = clon.querySelector('[data-compu="texto-mouse"]');
        const estadoMouse = parseInt(compu.estado_mouse);
        if (estadoMouse === 3) {
            indicadorMouse.style.backgroundColor = '#4caf50';
            indicadorMouse.title = 'Mouse funciona';
        } else if (estadoMouse === 2) {
            indicadorMouse.style.backgroundColor = '#ff9800';
            indicadorMouse.title = 'Mouse funciona con problemas';
        } else if (estadoMouse === 1) {
            indicadorMouse.style.backgroundColor = '#f44336';
            indicadorMouse.title = 'Mouse no funciona';
        } else {
            indicadorMouse.style.backgroundColor = '#9e9e9e';
            indicadorMouse.title = 'Sin mouse';
        }
        textoMouse.textContent = 'Mouse';

        const indicadorTeclado = clon.querySelector('[data-compu="indicador-teclado"]');
        const textoTeclado = clon.querySelector('[data-compu="texto-teclado"]');
        const estadoTeclado = parseInt(compu.estado_teclado);
        if (estadoTeclado === 3) {
            indicadorTeclado.style.backgroundColor = '#4caf50';
            indicadorTeclado.title = 'Teclado funciona';
        } else if (estadoTeclado === 2) {
            indicadorTeclado.style.backgroundColor = '#ff9800';
            indicadorTeclado.title = 'Teclado funciona con problemas';
        } else if (estadoTeclado === 1) {
            indicadorTeclado.style.backgroundColor = '#f44336';
            indicadorTeclado.title = 'Teclado no funciona';
        } else {
            indicadorTeclado.style.backgroundColor = '#9e9e9e';
            indicadorTeclado.title = 'Sin teclado';
        }
        textoTeclado.textContent = 'Teclado';

        tarjeta.addEventListener('click', () => abrirModalComputadora(compu));
        contenedor.appendChild(clon);
    });
}

async function refrescarEstadosTarjetas() {
    if (document.hidden || document.querySelector('.modal.show')) {
        return;
    }
    try {
        const computadoras = await llamarAPI(`/obtener_computadoras_aula/${idAula}`);
        if (!computadoras) return;
        computadoras.forEach(compu => {
            const tarjeta = document.querySelector(`.card[data-bdr-id="${compu.id_bdr}"]`);
            if (!tarjeta) {
                return;
            }
            const textoEstado = tarjeta.querySelector('[data-compu="estado_actual"]');
            if (textoEstado && textoEstado.textContent !== compu.estado_actual) {
                textoEstado.textContent = compu.estado_actual || "Desconocido";
            }
            const img = tarjeta.querySelector('[data-compu="imagen"]');
            const nuevaImgSrc = obtenerImagenEstadoBDR(compu.estado_actual);
            if (img && img.src.endsWith(nuevaImgSrc) === false) {
                img.src = nuevaImgSrc;
            }
            const indicadorGabinete = tarjeta.querySelector('[data-compu="indicador-gabinete"]');
            const nuevoColorGabinete = compu.id_gabinete ? '#4caf50' : '#f44336';
            if (indicadorGabinete && indicadorGabinete.style.backgroundColor !== nuevoColorGabinete) {
                indicadorGabinete.style.backgroundColor = nuevoColorGabinete;
                indicadorGabinete.title = compu.id_gabinete ? `Gabinete ${compu.id_gabinete} asignado` : 'Sin gabinete asignado';
            }
            const indicadorMonitor = tarjeta.querySelector('[data-compu="indicador-monitor"]');
            const nuevoColorMonitor = compu.id_monitor ? '#4caf50' : '#f44336';
            if (indicadorMonitor && indicadorMonitor.style.backgroundColor !== nuevoColorMonitor) {
                indicadorMonitor.style.backgroundColor = nuevoColorMonitor;
                indicadorMonitor.title = compu.id_monitor ? `Monitor ${compu.id_monitor} asignado` : 'Sin monitor asignado';
            }

            const indicadorMouse = tarjeta.querySelector('[data-compu="indicador-mouse"]');
            const estadoMouse = parseInt(compu.estado_mouse);
            let nuevoColorMouse = '#9e9e9e';
            let nuevoTituloMouse = 'Sin mouse';
            if (estadoMouse === 3) {
                nuevoColorMouse = '#4caf50';
                nuevoTituloMouse = 'Mouse funciona';
            } else if (estadoMouse === 2) {
                nuevoColorMouse = '#ff9800';
                nuevoTituloMouse = 'Mouse funciona con problemas';
            } else if (estadoMouse === 1) {
                nuevoColorMouse = '#f44336';
                nuevoTituloMouse = 'Mouse no funciona';
            }
            if (indicadorMouse && indicadorMouse.style.backgroundColor !== nuevoColorMouse) {
                indicadorMouse.style.backgroundColor = nuevoColorMouse;
                indicadorMouse.title = nuevoTituloMouse;
            }

            const indicadorTeclado = tarjeta.querySelector('[data-compu="indicador-teclado"]');
            const estadoTeclado = parseInt(compu.estado_teclado);
            let nuevoColorTeclado = '#9e9e9e';
            let nuevoTituloTeclado = 'Sin teclado';
            if (estadoTeclado === 3) {
                nuevoColorTeclado = '#4caf50';
                nuevoTituloTeclado = 'Teclado funciona';
            } else if (estadoTeclado === 2) {
                nuevoColorTeclado = '#ff9800';
                nuevoTituloTeclado = 'Teclado funciona con problemas';
            } else if (estadoTeclado === 1) {
                nuevoColorTeclado = '#f44336';
                nuevoTituloTeclado = 'Teclado no funciona';
            }
            if (indicadorTeclado && indicadorTeclado.style.backgroundColor !== nuevoColorTeclado) {
                indicadorTeclado.style.backgroundColor = nuevoColorTeclado;
                indicadorTeclado.title = nuevoTituloTeclado;
            }
        });
    } catch (error) {
        console.warn("Fallo el refresco silencioso de tarjetas:", error.message);
    }
}

async function refrescarContenidoModalPrincipal() {
    if (!computadoraActual || !computadoraActual.id_bdr) return;
    try {
        const compuActualizada = await llamarAPI(`/obtener_computadora/${computadoraActual.id_bdr}`);
        computadoraActual = compuActualizada;
        rellenarDatosModal(computadoraActual);
        configurarBotonesModal(computadoraActual);
        await cargarHistorialGabinete(computadoraActual.id_gabinete);
        const tarjetaBDR = document.querySelector(`.card[data-bdr-id="${computadoraActual.id_bdr}"]`);
        if (tarjetaBDR) {
            tarjetaBDR.querySelector('[data-compu="estado_actual"]').textContent = computadoraActual.estado_actual;
            tarjetaBDR.querySelector('[data-compu="imagen"]').src = obtenerImagenEstadoBDR(computadoraActual.estado_actual);
        }
        mostrarAlertaInfo('Información actualizada', { duracion: 2000 });
    } catch (error) {
        mostrarAlertaError(`No se pudo actualizar la información de la BDR: ${error.message}`);
        cerrarModal('modalInfoBdr');
    }
}

async function actualizarEstadoPeriferico(selectElement) {
    const ahora = Date.now();
    
    if (ahora - ultimoCambioPeriferico < COOLDOWN_PERIFERICO) {
        mostrarAlertaError("Espera 5 segundos antes de modificar nuevamente");
        selectElement.value = selectElement.dataset.valorPrevio;
        return;
    }
    ultimoCambioPeriferico = ahora;

    const tipo = selectElement.dataset.periferico;
    const nuevoEstado = selectElement.value;
    const valorAntiguo = selectElement.dataset.valorPrevio;
    
    const tarjeta = document.querySelector(`.card[data-bdr-id="${computadoraActual.id_bdr}"]`);
    const indicador = tarjeta ? tarjeta.querySelector(`[data-compu="indicador-${tipo}"]`) : null;
    let nuevoColor = '#9e9e9e';

    if (parseInt(nuevoEstado) === 3) nuevoColor = '#4caf50';
    else if (parseInt(nuevoEstado) === 2) nuevoColor = '#ff9800';
    else if (parseInt(nuevoEstado) === 1) nuevoColor = '#f44336';
    
    if (indicador) {
        indicador.style.backgroundColor = nuevoColor;
    }
    
    selectElement.dataset.valorPrevio = nuevoEstado;

    const datos = {
        id_usuario: usuarioId,
        estado_mouse: (tipo === 'mouse') ? nuevoEstado : computadoraActual.estado_mouse,
        estado_teclado: (tipo === 'teclado') ? nuevoEstado : computadoraActual.estado_teclado
    };

    try {
        const endpoint = `/actualizar_perifericos/${computadoraActual.id_bdr}/${computadoraActual.id_aula}`;
        
        await llamarAPI(endpoint, 'PUT', datos); 
        mostrarAlertaExito(`${tipo === 'mouse' ? 'Mouse' : 'Teclado'} actualizado.`);

        const refrescoTarjetasPromise = refrescarEstadosTarjetas();
        const refrescoModalPromise = refrescarContenidoModalPrincipal();
        await Promise.all([refrescoTarjetasPromise, refrescoModalPromise]);
        
    } catch (error) {
        mostrarAlertaError(error.message || `No se pudo guardar el cambio.`);
        
        selectElement.value = valorAntiguo;
        selectElement.dataset.valorPrevio = valorAntiguo;
        
        if (indicador) {
             let colorRevertido = '#9e9e9e';
             if (parseInt(valorAntiguo) === 3) colorRevertido = '#4caf50';
             else if (parseInt(valorAntiguo) === 2) colorRevertido = '#ff9800';
             else if (parseInt(valorAntiguo) === 1) colorRevertido = '#f44336';
             indicador.style.backgroundColor = colorRevertido;
        }
    }
}

function rellenarDatosModal(compu) {
    obtenerElemento("modalInfoBdrLabel").textContent = `Detalles de la BDR ${String(compu.id_bdr).slice(-2)}`;
    const imgEstado = obtenerElemento("modalEstadoImagen");
    imgEstado.src = obtenerImagenEstadoBDR(compu.estado_actual);
    obtenerElemento("modalEstadoTexto").textContent = compu.estado_actual || "Desconocido";

    const selectMouse = obtenerElemento("selectEstadoMouse");
    const selectTeclado = obtenerElemento("selectEstadoTeclado");
    selectMouse.value = compu.estado_mouse;
    selectTeclado.value = compu.estado_teclado;
    selectMouse.dataset.valorPrevio = compu.estado_mouse;
    selectTeclado.dataset.valorPrevio = compu.estado_teclado;

    const puedeEditarPerifericos = ['admin', 'soporte', 'profesor-tecnica'].includes(rolUsuario);
    selectMouse.disabled = !puedeEditarPerifericos;
    selectTeclado.disabled = !puedeEditarPerifericos;

    const tieneGabinete = !!compu.id_gabinete;
    const infoGabinete = obtenerElemento("infoGabinete");
    const noGabinete = obtenerElemento("noGabineteAsignado");
    if (tieneGabinete) {
        mostrarElemento(infoGabinete);
        ocultarElemento(noGabinete);
        obtenerElemento("gabineteId").textContent = compu.id_gabinete || "-";
        obtenerElemento("gabineteMotherboard").textContent = compu.motherboard || "-";
        obtenerElemento("gabineteProcesador").textContent = compu.procesador || "-";
        obtenerElemento("gabineteRam").textContent = compu.ram || "-";
        obtenerElemento("gabineteAlmacenamiento").textContent = compu.disco || "-";
        obtenerElemento("gabineteSo").textContent = compu.so || "-";
        obtenerElemento("gabineteFuente").textContent = compu.fuenteAlimen || "-";
    } else {
        ocultarElemento(infoGabinete);
        mostrarElemento(noGabinete);
    }

    const tieneMonitor = !!compu.id_monitor;
    const infoMonitor = obtenerElemento("infoMonitor");
    const noMonitor = obtenerElemento("noMonitorAsignado");
    if (tieneMonitor) {
        mostrarElemento(infoMonitor);
        ocultarElemento(noMonitor);
        obtenerElemento("monitorId").textContent = compu.id_monitor || "-";
        obtenerElemento("monitorMarca").textContent = compu.marca_monitor || "-";
        obtenerElemento("monitorModelo").textContent = compu.modelo_monitor || "-";
        obtenerElemento("monitorSalidaVideo").textContent = compu.salida_video || "-";
    } else {
        ocultarElemento(infoMonitor);
        mostrarElemento(noMonitor);
    }
}

function configurarBotonesModal(compu) {
    const botonesHardware = [
        'botonAsignarGabinete', 'botonMoverGabinete', 'botonQuitarGabinete',
        'botonAsignarMonitor', 'botonMoverMonitor', 'botonQuitarMonitor'
    ];
    botonesHardware.forEach(id => {
        const boton = obtenerElemento(id);
        if (boton) {
            const botonClonado = boton.cloneNode(true);
            boton.parentNode.replaceChild(botonClonado, boton);

            if (id === 'botonAsignarGabinete') botonClonado.onclick = () => abrirModalAsignar('gabinete');
            if (id === 'botonMoverGabinete') botonClonado.onclick = () => abrirModalMover('gabinete');
            if (id === 'botonAsignarMonitor') botonClonado.onclick = () => abrirModalAsignar('monitor');
            if (id === 'botonMoverMonitor') botonClonado.onclick = () => abrirModalMover('monitor');

            if (id === 'botonQuitarGabinete') {
                botonClonado.onclick = async () => {

                    cerrarModal('modalInfoBdr');

                    const confirmado = await mostrarModalConfirmacion(
                        `¿Estás seguro de que quieres quitar el gabinete ID ${compu.id_gabinete} de esta BDR? El gabinete volverá a estar disponible.`,
                        'Confirmar Quitar Gabinete',
                        'danger'
                    );

                    abrirModal('modalInfoBdr');

                    if (confirmado) {
                        const exito = await ejecutarAccion('/computadora/quitar_gabinete', {
                            id_gabinete: compu.id_gabinete
                        });
                        if (exito) await refrescarContenidoModalPrincipal();
                    }
                };
            }
            if (id === 'botonQuitarMonitor') {
                botonClonado.onclick = async () => {

                    cerrarModal('modalInfoBdr');

                    const confirmado = await mostrarModalConfirmacion(
                        `¿Estás seguro de que quieres quitar el monitor ID ${compu.id_monitor} de esta BDR? El monitor volverá a estar disponible.`,
                        'Confirmar Quitar Monitor',
                        'danger'
                    );

                    abrirModal('modalInfoBdr');

                    if (confirmado) {
                        const exito = await ejecutarAccion('/computadora/quitar_monitor', {
                            id_monitor: compu.id_monitor
                        });
                        if (exito) await refrescarContenidoModalPrincipal();
                    }
                };
            }
        }
    });

    const contenedorAcciones = obtenerElemento('accionesReporteDinamicas');
    configurarBotonesEstado(compu, rolUsuario, contenedorAcciones);

    const contenedorAccionesClonado = contenedorAcciones.cloneNode(true);
    contenedorAcciones.parentNode.replaceChild(contenedorAccionesClonado, contenedorAcciones);

    contenedorAccionesClonado.addEventListener('click', (e) => {
        const boton = e.target.closest('button');
        if (!boton) return;
        if (boton.dataset.estado) {
            abrirModalCambiarEstado(boton.dataset.estado);
        } else if (boton.dataset.accion === 'aviso') {
            abrirModalAviso();
        }
    });
}

async function abrirModalComputadora(compu) {
    const bdrId = compu.id_bdr;
    obtenerElemento("modalInfoBdrLabel").textContent = `Detalles de la BDR ${String(bdrId).slice(-2)}`;
    obtenerElemento("modalEstadoTexto").textContent = "Cargando...";
    obtenerElemento("modalEstadoImagen").src = obtenerImagenEstadoBDR("cargando");
    ocultarElemento(obtenerElemento("infoGabinete"));
    ocultarElemento(obtenerElemento("noGabineteAsignado"));
    ocultarElemento(obtenerElemento("infoMonitor"));
    ocultarElemento(obtenerElemento("noMonitorAsignado"));
    obtenerElemento("selectEstadoMouse").disabled = true;
    obtenerElemento("selectEstadoTeclado").disabled = true;
    vaciarContenedor(obtenerElemento('historialGabineteContenido'));
    abrirModal('modalInfoBdr');

    try {
        const compuActualizada = await llamarAPI(`/obtener_computadora/${bdrId}`);
        computadoraActual = compuActualizada;
        rellenarDatosModal(compuActualizada);
        configurarBotonesModal(compuActualizada);
        await cargarHistorialGabinete(compuActualizada.id_gabinete);
    } catch (error) {
        mostrarAlertaError(`No se pudo cargar la información de la BDR: ${error.message}`);
        cerrarModal('modalInfoBdr');
    }
}

function abrirModalCambiarEstado(nuevoEstado) {
    cerrarModal('modalInfoBdr');
    configurarModalCambioEstado(nuevoEstado);
    abrirModal('modalCambiarEstado');
}

function abrirModalAviso() {
    cerrarModal('modalInfoBdr');
    configurarModalAviso();
    abrirModal('modalCrearAviso');
}

async function abrirModalAsignar(tipo) {
    cerrarModal('modalInfoBdr');
    const esGabinete = tipo === 'gabinete';
    const idModal = esGabinete ? 'modalAsignarGabinete' : 'modalAsignarMonitor';
    const idContenido = esGabinete ? 'contenidoModalGabinete' : 'contenidoModalMonitor';
    const endpoint = esGabinete ? '/gabinetes_disponibles' : '/monitores_disponibles';
    const plantillald = 'plantillaItemAsignable';

    prepararContenedor(idContenido, 'Cargando...', 'info');
    abrirModal(idModal);

    try {
        const items = await llamarAPI(endpoint);
        const contenedor = obtenerElemento(idContenido);
        vaciarContenedor(contenedor);
        if (items.length === 0) {
            contenedor.innerHTML = `<p class="text-muted p-3">No hay ${tipo}s disponibles.</p>`;
            mostrarAlertaAdvertencia(`No hay ${tipo}s disponibles en este momento`, { duracion: 3000 });
            return;
        }

        items.forEach(item => {
            const plantillaltem = obtenerElemento(plantillald);
            const clon = plantillaltem.content.cloneNode(true);
            const texto = clon.querySelector('[data-item="texto"]');
            const idItem = esGabinete ? item.id_gabinete : item.id_monitor;
            texto.textContent = esGabinete
                ? `ID: ${idItem} (${item.procesador || 'N/A'}, ${item.ram || 'N/A'})`
                : `ID: ${idItem} (${item.marca || 'N/A'} ${item.modelo || 'N/A'})`;
            clon.querySelector('li').onclick = async () => {
                const cuerpo = {
                    id_bdr: computadoraActual.id_bdr,
                    id_aula: computadoraActual.id_aula
                };
                if (esGabinete) cuerpo.id_gabinete = idItem;
                else cuerpo.id_monitor = idItem;

                await ejecutarAccion(`/computadora/asignar_${tipo}`, cuerpo);
                cerrarModal(idModal);
            };
            contenedor.appendChild(clon);
        });
    } catch (error) {
        mostrarAlertaError(error.message);
        cerrarModal(idModal);
    }
}

async function abrirModalMover(tipo) {
    cerrarModal('modalInfoBdr');
    const esGabinete = tipo === 'gabinete';
    const idModal = esGabinete ? 'modalMoverGabinete' : 'modalMoverMonitor';
    const selectAula = obtenerElemento(esGabinete ? 'selectAulaDestino' : 'selectAulaDestinoMonitor');
    const selectBdr = obtenerElemento(esGabinete ? 'selectBdrDestino' : 'selectBdrDestinoMonitor');
    const btnConfirmar = obtenerElemento(esGabinete ? 'btnConfirmarMovimiento' : 'btnConfirmarMovimientoMonitor');

    selectAula.innerHTML = '<option selected disabled value="">Cargando aulas...</option>';
    selectBdr.innerHTML = '<option selected disabled value="">Seleccione un aula primero</option>';
    selectBdr.disabled = true;
    btnConfirmar.disabled = true;
    abrirModal(idModal);

    try {
        const aulas = await llamarAPI('/obtener_aulas');
        selectAula.innerHTML = '<option selected disabled value="">Seleccione un aula...</option>';
        const aulasOrdenadas = aulas.sort((a, b) => {
            return a.nombre.localeCompare(b.nombre, 'es', { numeric: true });
        });

        if (aulasOrdenadas.length === 0) {
            mostrarAlertaAdvertencia('No hay aulas disponibles para mover el componente');
            cerrarModal(idModal);
            return;
        }

        aulasOrdenadas.forEach(aula => {
            const textoAula = aula.id_aula === computadoraActual.id_aula
                ? `${aula.nombre} (Aula actual)`
                : aula.nombre;
            selectAula.add(new Option(textoAula, aula.id_aula));
        });
    } catch (error) {
        mostrarAlertaError('No se pudieron cargar las aulas.');
        selectAula.innerHTML = '<option selected disabled value="">Error al cargar</option>';
        return;
    }

    selectAula.onchange = async () => {
        const idAulaSeleccionada = selectAula.value;
        selectBdr.innerHTML = '<option selected disabled value="">Cargando BDRs...</option>';
        selectBdr.disabled = true;
        btnConfirmar.disabled = true;
        if (!idAulaSeleccionada) return;

        try {
            const computadoras = await llamarAPI(`/obtener_computadoras_aula/${idAulaSeleccionada}`);

            const bdrDisponibles = computadoras.filter(compu => {
                if (compu.id_bdr === computadoraActual.id_bdr) {
                    return false;
                }
                if (esGabinete) {
                    return !compu.id_gabinete;
                } else {
                    return !compu.id_monitor;
                }
            });

            selectBdr.innerHTML = '<option selected disabled value="">Seleccione una BDR...</option>';

            if (bdrDisponibles.length > 0) {
                bdrDisponibles.sort((a, b) => a.id_bdr - b.id_bdr);

                bdrDisponibles.forEach(compu => {
                    const numeroBDR = String(compu.id_bdr).slice(-2);
                    const infoGabinete = compu.id_gabinete ? `Gabinete ${compu.id_gabinete}` : 'Sin gabinete';
                    const infoMonitor = compu.id_monitor ? `Monitor ${compu.id_monitor}` : 'Sin monitor';
                    const textoOpcion = `BDR ${numeroBDR} (${infoGabinete} | ${infoMonitor})`;
                    selectBdr.add(new Option(textoOpcion, compu.id_bdr));
                });
                selectBdr.disabled = false;
            } else {
                selectBdr.innerHTML = '<option selected disabled value="">No hay BDRS disponibles</option>';
                mostrarAlertaAdvertencia('No hay BDRs disponibles en el aula seleccionada');
            }
        } catch (error) {
            mostrarAlertaError('No se pudieron cargar las BDRS.');
            selectBdr.innerHTML = '<option selected disabled value="">Error al cargar</option>';
        }
    };

    selectBdr.onchange = () => { btnConfirmar.disabled = !selectBdr.value; };

    btnConfirmar.onclick = async () => {
        const cuerpo = { id_bdr_nuevo: selectBdr.value, id_aula_nueva: selectAula.value };
        if (esGabinete) cuerpo.id_gabinete = computadoraActual.id_gabinete;
        else cuerpo.id_monitor = computadoraActual.id_monitor;

        const exito = await ejecutarAccion(`/computadora/mover_${tipo}`, cuerpo);
        if (exito) {
            accionModalCompletada = true;
            cerrarModal(idModal);
            setTimeout(async () => {
                await cargarComputadoras(idAula);
                try {
                    const compuActualizada = await llamarAPI(`/obtener_computadora/${computadoraActual.id_bdr}`);
                    computadoraActual = compuActualizada;
                    abrirModalComputadora(computadoraActual);
                } catch (error) {
                    mostrarAlertaError('No se pudo recargar la información de la BDR');
                }
            }, 300);
        }
    };
}

async function ejecutarAccion(endpoint, cuerpo, metodo = 'PUT') {
    try {
        cuerpo.id_usuario = usuarioId;
        const resultado = await llamarAPI(endpoint, metodo, cuerpo);
        mostrarAlertaExito(resultado.mensaje);
        accionModalCompletada = true;
        return true;
    } catch (error) {
        mostrarAlertaError(error.message);
        accionModalCompletada = false;
        return false;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    if (!idAula) {
        console.error("ID de aula no definido.");
        const contenedor = obtenerElemento('contenedorBdr');
        if (contenedor) contenedor.innerHTML = '<p class="text-danger text-center">Error crítico: No se pudo identificar el aula. Por favor, vuelva a la página anterior e intente de nuevo.</p>';
        mostrarAlertaError('Error crítico: No se pudo identificar el aula');
        return;
    }

    inicializarModales([
        'modalInfoBdr',
        'modalAsignarGabinete',
        'modalAsignarMonitor',
        'modalMoverGabinete',
        'modalMoverMonitor',
        'modalCambiarEstado',
        'modalCrearAviso',
        'modalConfirmacionGeneral'
    ], {
        backdrop: true,
        keyboard: true
    });

    const selectMouse = obtenerElemento("selectEstadoMouse");
    const selectTeclado = obtenerElemento("selectEstadoTeclado");

    if (selectMouse) {
        selectMouse.addEventListener('change', () => {
            actualizarEstadoPeriferico(selectMouse);
        });
    }
    if (selectTeclado) {
        selectTeclado.addEventListener('change', () => {
            actualizarEstadoPeriferico(selectTeclado);
        });
    }

    obtenerElemento('btnConfirmarCambioEstado').onclick = async () => {
        const descripcion = obtenerElemento('descripcionCambioEstado').value.trim();
        const estadoReportado = obtenerElemento('campoOcultoNuevoEstado').value;
        const datosCompu = {
            id_bdr: computadoraActual.id_bdr,
            id_aula: computadoraActual.id_aula,
            id_gabinete: computadoraActual.id_gabinete,
            id_usuario: usuarioId
        };
        const resultado = await crearReporteCambioEstado(datosCompu, estadoReportado, descripcion);
        if (resultado !== false) {
            estadoActualizadoEnTiempoReal = resultado;
            accionModalCompletada = true;
            cerrarModal('modalCambiarEstado');
        }
    };

    obtenerElemento('btnConfirmarAviso').onclick = async () => {
        const descripcion = obtenerElemento('descripcionAviso').value.trim();
        const datosCompu = {
            id_bdr: computadoraActual.id_bdr,
            id_aula: computadoraActual.id_aula,
            id_gabinete: computadoraActual.id_gabinete,
            id_usuario: usuarioId
        };
        const exito = await crearAvisoInformativo(datosCompu, descripcion);
        if (exito) {
            accionModalCompletada = true;
            cerrarModal('modalCrearAviso');
        }
    };

    const idsModalesSecundarios = [
        'modalMoverGabinete', 'modalMoverMonitor', 'modalCambiarEstado',
        'modalAsignarGabinete', 'modalAsignarMonitor', 'modalCrearAviso'
    ];

    idsModalesSecundarios.forEach(id => {
        const modalElemento = document.getElementById(id);
        if (modalElemento) {
            modalElemento.addEventListener('hidden.bs.modal', async () => {
                await new Promise(resolve => setTimeout(resolve, 150));
                if (accionModalCompletada) {
                    const refrescoTarjetasPromise = refrescarEstadosTarjetas();
                    const refrescoModalPromise = refrescarContenidoModalPrincipal();
                    await Promise.all([refrescoTarjetasPromise, refrescoModalPromise]);
                    accionModalCompletada = false;
                    estadoActualizadoEnTiempoReal = null;
                    abrirModal('modalInfoBdr');
                } else {
                    abrirModal('modalInfoBdr');
                }
            });
        }
    });

    cargarComputadoras(idAula);
    setInterval(refrescarEstadosTarjetas, 10000);
});