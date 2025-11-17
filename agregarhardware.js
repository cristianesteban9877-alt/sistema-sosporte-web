import { llamarAPI } from './api.js';
import { mostrarAlertaExito, mostrarAlertaError } from './notificaciones.js';
import { obtenerElemento, limpiarFormulario } from './dom.js';

async function manejarSubmitGabinete(evento) {
    evento.preventDefault();
    const formulario = evento.target;
    const datos = {
        ram: formulario.ram.value,
        disco: formulario.disco.value,
        so: formulario.so.value,
        procesador: formulario.procesador.value,
        motherboard: formulario.motherboard.value,
        fuenteAlimen: formulario.fuenteAlimen.value,
    };
    try {
        const resultado = await llamarAPI('/crear_gabinete', 'POST', datos);
        mostrarAlertaExito(resultado.mensaje || "Gabinete registrado correctamente");
        limpiarFormulario(formulario);

        document.dispatchEvent(new CustomEvent('hardwareAgregado'));
        
        const modalElemento = formulario.closest('.modal');
        if (modalElemento) {
            const modal = bootstrap.Modal.getInstance(modalElemento);
            if (modal) modal.hide();
        }

    } catch (error) {
        mostrarAlertaError(error.message);
    }
}

async function manejarSubmitMonitor(evento) {
    evento.preventDefault();
    const formulario = evento.target;
    const datos = {
        marca: formulario.marca.value,
        modelo: formulario.modelo.value,
        salida_video: formulario['salida-video'].value,
    };
    try {
        const resultado = await llamarAPI('/crear_monitor', 'POST', datos);
        mostrarAlertaExito(resultado.mensaje || "Monitor registrado correctamente");
        limpiarFormulario(formulario);

        document.dispatchEvent(new CustomEvent('hardwareAgregado'));

        const modalElemento = formulario.closest('.modal');
        if (modalElemento) {
            const modal = bootstrap.Modal.getInstance(modalElemento);
            if (modal) modal.hide();
        }

    } catch (error) {
        mostrarAlertaError(error.message);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const formGabinete = obtenerElemento("formularioGabinete");
    const formMonitor = obtenerElemento("formularioMonitor");

    if (formGabinete) {
        formGabinete.addEventListener("submit", manejarSubmitGabinete);
    }
    if (formMonitor) {
        formMonitor.addEventListener("submit", manejarSubmitMonitor);
    }
});