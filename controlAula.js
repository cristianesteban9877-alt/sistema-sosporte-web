import { llamarAPI } from './api.js';
import { mostrarAlertaError, mostrarAlertaExito } from './notificaciones.js';
import { obtenerElementos } from './dom.js';

const idUsuario = document.body.dataset.usuarioId;
const idDelAula = document.body.dataset.aulaId;

// Objeto para almacenar el último cambio de cada dispositivo
const ultimosCambios = {
    proyector: 0,
    splitter: 0,
    audio: 0
};

const COOLDOWN = 5000;

async function actualizarDispositivo(idAulaActual, datosParaActualizar, interruptor, nombreDispositivo) {
    const ahora = Date.now();
    
    // Verificar el cooldown específico de ESTE dispositivo
    if (ahora - ultimosCambios[nombreDispositivo] < COOLDOWN) {
        const segundosRestantes = Math.ceil((COOLDOWN - (ahora - ultimosCambios[nombreDispositivo])) / 1000);
        mostrarAlertaError(`Espera ${segundosRestantes} segundos antes de modificar el ${nombreDispositivo} nuevamente`);
        interruptor.checked = !interruptor.checked;
        return;
    }

    // Actualizar el timestamp de este dispositivo específico
    ultimosCambios[nombreDispositivo] = ahora;

    try {
        datosParaActualizar.id_usuario = idUsuario;
        await llamarAPI(`/actualizar_aula/${idAulaActual}`, 'PUT', datosParaActualizar);
        mostrarAlertaExito(`${nombreDispositivo.charAt(0).toUpperCase() + nombreDispositivo.slice(1)} actualizado correctamente`);
    } catch (error) {
        console.error(`Error al actualizar el ${nombreDispositivo}:`, error);
        mostrarAlertaError(error.message || 'No se pudo guardar el cambio.');
        interruptor.checked = !interruptor.checked;
        // Revertir el timestamp ya que falló
        ultimosCambios[nombreDispositivo] = 0;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const switches = obtenerElementos('.switch-dispositivos-aula');
    
    switches.forEach(interruptor => {
        interruptor.addEventListener('change', () => {
            const dispositivo = interruptor.dataset.dispositivo; // 'proyector', 'splitter' o 'audio'
            const nuevoEstado = interruptor.checked ? 1 : 0;
            
            const datos = {
                [dispositivo]: nuevoEstado
            };
            
            // Pasar el nombre del dispositivo para el cooldown individual
            actualizarDispositivo(idDelAula, datos, interruptor, dispositivo);
        });
    });
});