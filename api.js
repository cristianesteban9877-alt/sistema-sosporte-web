import { mostrarCargando } from './notificaciones.js';

const API_BASE = "https://soporte2025.pythonanywhere.com";

export async function llamarAPI(endpoint, metodo = 'GET', cuerpo = null, mostrarCarga = false) {
	const opciones = {
		method: metodo,
		headers: { 'Content-Type': 'application/json' },
		cache: 'reload',
	};

	if (cuerpo) {
		opciones.body = JSON.stringify(cuerpo);
	}

	let indicadorCarga = null;
	if (mostrarCarga) {
		indicadorCarga = mostrarCargando('Procesando solicitud...');
	}

	try {
		const respuesta = await fetch(`${API_BASE}${endpoint}`, opciones);
		const resultado = await respuesta.json().catch(() => ({}));

		if (indicadorCarga) {
			indicadorCarga.cerrar();
		}

		if (!respuesta.ok) {
			const mensaje = resultado.error || resultado.mensaje || `Error en la solicitud a ${endpoint}`;
			throw new Error(mensaje);
		}

		return resultado;
	} catch (error) {
		if (indicadorCarga) {
			indicadorCarga.cerrar();
		}
		console.error("Error en llamarAPI:", error);
		throw error;
	}
}