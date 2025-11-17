import { llamarAPI } from './api.js';
import { obtenerElemento, vaciarContenedor, crearElemento } from './dom.js';
import { abrirModal, cerrarModal, mostrarModalConfirmacion } from './modal.js';
import { mostrarAlertaExito, mostrarAlertaError } from './notificaciones.js';

export async function cargarHistorialGabinete(id_gabinete) {
    const contenedor = obtenerElemento('historialGabineteContenido');
    if (!id_gabinete) {
        contenedor.innerHTML = '<p class="text-muted p-3">No hay un gabinete asignado para mostrar un historial.</p>';
        return;
    }
    contenedor.innerHTML = '<p class="text-muted p-3">Cargando historial...</p>';
    try {
        const reportes = await llamarAPI(`/reportes_por_gabinete/${id_gabinete}`);
        vaciarContenedor(contenedor);
        if (!reportes || reportes.length === 0) {
            contenedor.innerHTML = '<p class="text-muted p-3">No hay reportes para este gabinete.</p>';
            return;
        }

        const rolUsuario = document.body.dataset.rolUsuario;
        const usuarioId = document.body.dataset.usuarioId;
        reportes.forEach(reporte => {
            const datos = {
                id_reporte: reporte.id_reportes,
                fecha: reporte.fec_aviso,
                aula: reporte.nombre_aula,
                bdr: reporte.id_bdr ? `${String(reporte.id_bdr).slice(-2)}` : null,
                estado: reporte.estado_nuevo,
                mensajeCompleto: reporte.info_problema || "",
                usuario: reporte.email || "Usuario no identificado"
            };
            const elementoReporte = formatearReporteCambioEstado(datos);

            if (rolUsuario === 'admin') {
                const botonEliminar = elementoReporte.querySelector('.boton-eliminar-reporte');
                if (botonEliminar) {
                    botonEliminar.style.display = 'block';
                    botonEliminar.dataset.idReporte = datos.id_reporte;
                    botonEliminar.addEventListener('click', async (e) => {
                        e.stopPropagation();

                        cerrarModal('modalInfoBdr');

                        const confirmado = await mostrarModalConfirmacion(
                            '¿Estás seguro de que deseas eliminar este reporte? Esta acción no se puede deshacer.',
                            'Confirmar Eliminación',
                            'danger'
                        );

                        abrirModal('modalInfoBdr');

                        if (confirmado) {
                            await eliminarReporte(datos.id_reporte, usuarioId, id_gabinete);
                        }
                    });
                }
            }
            contenedor.appendChild(elementoReporte);
        });
    } catch (error) {
        contenedor.innerHTML = `<p class="text-danger p-3">Error al cargar el historial: ${error.message}</p>`;
    }
}

export async function crearReporteCambioEstado(datosComputadora, nuevoEstado, descripcion) {
    const reporte = {
        info_problema: descripcion,
        estado_nuevo: nuevoEstado,
        id_bdr: datosComputadora.id_bdr,
        id_aula: datosComputadora.id_aula,
        id_gabinete: datosComputadora.id_gabinete,
        id_usuario: datosComputadora.id_usuario
    };
    try {
        const resultado = await llamarAPI('/crear_reporte', 'POST', reporte);
        mostrarAlertaExito(resultado.mensaje);
        return nuevoEstado;
    } catch (error) {
        mostrarAlertaError(error.message);
        return false;
    }
}

export async function crearAvisoInformativo(datosComputadora, descripcion) {
    if (!descripcion || !descripcion.trim()) {
        mostrarAlertaError('Por favor, escribe el mensaje del aviso.');
        return false;
    }
    const reporte = {
        info_problema: descripcion,
        estado_nuevo: null,
        id_bdr: datosComputadora.id_bdr,
        id_aula: datosComputadora.id_aula,
        id_gabinete: datosComputadora.id_gabinete,
        id_usuario: datosComputadora.id_usuario
    };
    try {
        const resultado = await llamarAPI('/crear_reporte', 'POST', reporte);
        mostrarAlertaExito(resultado.mensaje);
        return true;
    } catch (error) {
        mostrarAlertaError(error.message);
        return false;
    }
}

export function configurarBotonesEstado(computadora, rolUsuario, contenedorAcciones) {
    vaciarContenedor(contenedorAcciones);
    const acciones = {
        funcionando: { texto: 'Marcar como Funcionando', clase: 'btn-success', icono: 'bi-check-circle', estado: 'Funcionando' },
        revision: { texto: 'Marcar en Revisión', clase: 'btn-warning', icono: 'bi-tools', estado: 'En revision' },
        noDisponible: { texto: 'Marcar No Disponible', clase: 'btn-danger', icono: 'bi-x-octagon', estado: 'No disponible' },
        aviso: { texto: 'Crear Aviso', clase: 'btn-info', icono: 'bi-info-circle', accion: 'aviso' }
    };

    if (!computadora.id_gabinete) {
        contenedorAcciones.innerHTML = '<p class="text-muted text-center small">No se pueden reportar BDRs sin gabinete asignado.</p>';
        return;
    }

    const crearBotonAccion = (accion) => {
        const boton = crearElemento('button', { clases: ['btn', accion.clase] });
        if (accion.estado && computadora.estado_actual === accion.estado) {
            boton.disabled = true;
        }
        boton.innerHTML = `<i class="bi ${accion.icono}"></i> ${accion.texto}`;
        if (accion.estado) {
            boton.dataset.estado = accion.estado;
        } else if (accion.accion) {
            boton.dataset.accion = accion.accion;
        }
        contenedorAcciones.appendChild(boton);
    };

    if (['admin', 'soporte', 'profesor-tecnica'].includes(rolUsuario)) {
        crearBotonAccion(acciones.funcionando);
        crearBotonAccion(acciones.revision);
        crearBotonAccion(acciones.noDisponible);
        crearBotonAccion(acciones.aviso);
    } else if (['alumno', 'profesor'].includes(rolUsuario)) {
        crearBotonAccion(acciones.noDisponible);
        crearBotonAccion(acciones.aviso);
    }
}

export function configurarModalCambioEstado(nuevoEstado) {
    obtenerElemento('campoOcultoNuevoEstado').value = nuevoEstado;
    obtenerElemento('modalCambiarEstadoLabel').textContent = `Marcar BDR como "${nuevoEstado}"`;
    obtenerElemento('descripcionCambioEstado').value = "";
}

export function configurarModalAviso() {
    obtenerElemento('descripcionAviso').value = '';
}

export function formatearReporteCambioEstado(reporte) {
    const divReporte = crearElemento('div', {
        clases: ['reporte-item'],
        estilos: {
            border: '2px solid #555',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '15px',
            background: '#f9f9f9',
            fontSize: '1.2rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.15)'
        }
    });

    const fechaObjeto = reporte.fecha ? new Date(reporte.fecha) : null;
    let fecha;

    if (fechaObjeto) {
        fecha = fechaObjeto.toLocaleString('es-AR', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit', 
            minute: '2-digit', 
            //hour12: true,
            hour12: false
        });
    } else {
        fecha = 'Fecha desconocida';
    }
    const usuario = reporte.usuario || "Usuario no identificado";
    let aulaNombre = reporte.aula || "Aula no especificada";
    const bdrNumero = reporte.bdr ? `BDR ${reporte.bdr}` : "BDR no especificada";
    const mensajeCompleto = reporte.mensajeCompleto || "";

    if (aulaNombre === "Aula no especificada" && mensajeCompleto) {
        const regex = /del aula ([\w\d\s]+) \(/;
        const match = mensajeCompleto.match(regex);
        if (match && match[1]) {
            aulaNombre = match[1].trim();
        }
    }

    const estado = reporte.estado || "Aviso Informativo";
    let mensajePrincipal = mensajeCompleto;
    let mensajeAdicional = null;
    const separador = "\nMensaje adicional: ";

    if (mensajePrincipal.includes(separador)) {
        const partes = mensajePrincipal.split(separador);
        mensajePrincipal = partes[0];
        mensajeAdicional = partes[1];
    } else if (estado === 'Aviso Informativo') {
        mensajePrincipal = reporte.mensajeCompleto || "Sin descripción.";
    } else if (!mensajePrincipal && estado !== 'Log') {
        mensajePrincipal = `Cambio de estado: Se marcó como '${estado}'`;
    } else if (!mensajePrincipal && estado === 'Log') {
        mensajePrincipal = "Registro automático del sistema.";
    }

    if (mensajePrincipal.startsWith("AVISO - ")) {
        mensajePrincipal = mensajePrincipal.replace("AVISO", `<span style="background: #bbdefb; border: 1px solid #aaa; padding: 1px 5px; border-radius: 4px; font-weight: bold;">AVISO</span>`);
    }

    let colorFondo = "#f0f0f0";
    let estadoTexto = estado;

    if (estado && estado !== 'Log' && estado !== 'Aviso Informativo') {
        if (estado.toLowerCase() === "funcionando") colorFondo = "#c8e6c9";
        else if (estado.toLowerCase() === "en revision") colorFondo = "#fff9c4";
        else if (estado.toLowerCase() === "no disponible") colorFondo = "#ffcdd2";
        estadoTexto = `<span style="background: ${colorFondo}; border: 1px solid #aaa; padding: 1px 5px; border-radius: 4px; font-weight: bold;">${estado}</span>`;
    } else if (estado === 'Aviso Informativo') {
        estadoTexto = `<span style="background: #bbdefb; border: 1px solid #aaa; padding: 1px 5px; border-radius: 4px; font-weight: bold;">Aviso</span>`;
    } else {
        estadoTexto = estado;
    }

    divReporte.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
      <div>
        <p style="margin-bottom: 4px;"><small><i class="bi bi-calendar-event"></i> ${fecha}</small></p>
      </div>
      <button 
        type="button" 
        class="btn-close boton-eliminar-reporte" 
        aria-label="Eliminar reporte"
        title="Eliminar reporte"
        style="display: none;"
        data-id-reporte="${reporte.id_reporte || ''}"
      ></button>
    </div>
    <p style="margin-bottom: 4px;"><strong><i class="bi bi-person"></i> Reportado por:</strong> ${usuario}</p>
    <p style="margin-bottom: 4px;"><strong><i class="bi bi-geo-alt"></i> Ubicación:</strong> ${aulaNombre} - ${bdrNumero}</p>
    <p style="margin-bottom: 4px;"><strong>Mensaje:</strong> ${mensajePrincipal.replace(`Se marcó como '${reporte.estado}'`, `Se marcó como ${estadoTexto}`)}</p>
    ${mensajeAdicional ?
            `<p style="margin-bottom: 4px; padding-left: 15px; border-left: 3px solid #ccc;"><em>Adicional: ${mensajeAdicional}</em></p>` : ''}
  `;
    return divReporte;
}

async function eliminarReporte(idReporte, idUsuario, idGabinete) {
    try {
        const resultado = await llamarAPI(`/eliminar_reporte/${idReporte}`, 'DELETE', {
            id_usuario: idUsuario
        });
        mostrarAlertaExito(resultado.mensaje || 'Reporte eliminado correctamente');
        await cargarHistorialGabinete(idGabinete);
    } catch (error) {
        mostrarAlertaError(error.message || 'No se pudo eliminar el reporte');
    }
}