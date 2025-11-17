// notificaciones.js
import { crearElemento } from './dom.js';
 
const CONFIGURACION_DEFAULT = {
 	posicion: 'bottom-right',
 	duracion: 3000,
 	maxNotificaciones: 5,
 	animacion: true,
 	icono: true,
 	sonido: false
};

let configuracionGlobal = { ...CONFIGURACION_DEFAULT };

const TIPOS_NOTIFICACION = {
	success: {
		clase: 'alert-success',
		icono: 'bi-check-circle-fill',
		titulo: 'Éxito'
	},
	error: {
		clase: 'alert-danger',
		icono: 'bi-x-circle-fill',
		titulo: 'Error'
	},
	warning: {
		clase: 'alert-warning',
		icono: 'bi-exclamation-triangle-fill',
		titulo: 'Advertencia'
	},
	info: {
		clase: 'alert-info',
		icono: 'bi-info-circle-fill',
		titulo: 'Información'
	}
};

const POSICIONES = {
	'top-right': { top: '20px', right: '20px', left: 'auto', bottom: 'auto' },
	'top-left': { top: '20px', left: '20px', right: 'auto', bottom: 'auto' },
	'bottom-right': { bottom: '20px', right: '20px', top: 'auto', left: 'auto' },
	'bottom-left': { bottom: '20px', left: '20px', top: 'auto', right: 'auto' },
	'top-center': { top: '20px', left: '50%', transform: 'translateX(-50%)', right: 'auto',
bottom: 'auto' },
	'bottom-center': { bottom: '20px', left: '50%', transform: 'translateX(-50%)', right:
'auto', top: 'auto' }
};

function crearContenedorNotificaciones() {
	let contenedor = document.getElementById('contenedor-notificaciones');
	if (!contenedor) {
		contenedor = crearElemento('div', { atributos: { id: 'contenedor-notificaciones' } });
		const posicion = POSICIONES[configuracionGlobal.posicion] || POSICIONES['top-right'];
		Object.assign(contenedor.style, {
			position: 'fixed',
			zIndex: '9999',
			width: '350px',
			maxWidth: '90vw',
			pointerEvents: 'none',
			...posicion
		});
		document.body.appendChild(contenedor);
	}
	return contenedor;
}

function limitarNotificaciones(contenedor) {
	const notificaciones = contenedor.querySelectorAll('.alert');
	if (notificaciones.length >= configuracionGlobal.maxNotificaciones) {
		const masAntigua = notificaciones[0];
		if (masAntigua) {
			const instancia = bootstrap.Alert.getInstance(masAntigua);
			if (instancia) {
				instancia.close();
			} else if (masAntigua.parentNode) {
				masAntigua.remove();
			}
		}
	}
}

function mostrarNotificacion(mensaje, tipo = 'info', opciones = {}) {
	const config = { ...configuracionGlobal, ...opciones };
	const tipoConfig = TIPOS_NOTIFICACION[tipo] || TIPOS_NOTIFICACION.info;
	const contenedor = crearContenedorNotificaciones();
	limitarNotificaciones(contenedor);

	const notificacion = crearElemento('div', {
		clases: ['alert', tipoConfig.clase, 'fade', 'd-flex',
'align-items-center', 'mb-2'],
		atributos: { role: 'alert' }
	});

	notificacion.style.pointerEvents = 'auto';
	notificacion.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';

	let contenidoHTML = '';

	if (config.icono) {
		contenidoHTML += `<i class="bi ${tipoConfig.icono} me-2" style="font-size:
1.2rem;"></i>`;
	}
	contenidoHTML += `<div class="flex-grow-1">`;

	if (config.titulo !== false) {
		const tituloFinal = config.titulo || tipoConfig.titulo;
		contenidoHTML += `<strong>${tituloFinal}:</strong> `;
	}
	contenidoHTML += mensaje;
	contenidoHTML += `</div>`;

	notificacion.innerHTML = contenidoHTML;

	contenedor.appendChild(notificacion);

	// --- INICIO DE CAMBIOS ---
	// 1. Creamos manualmente la instancia de la alerta
	const alertaBootstrap = new bootstrap.Alert(notificacion);

	if (config.animacion) {
		setTimeout(() => {
			notificacion.style.opacity = '1';
			notificacion.style.transform = 'translateY(0)';
			notificacion.classList.add('show'); // Añadimos 'show' para que funcione el fade out
		}, 10);
	} else {
		notificacion.classList.add('show');
	}

	if (config.duracion > 0) {
		const temporizador = setTimeout(() => {
			// 2. Usamos la instancia que creamos
			if (alertaBootstrap) {
				alertaBootstrap.close();
			} else {
				// Fallback por si algo falla
				notificacion.remove();
			}
		}, config.duracion);
	}
	// --- FIN DE CAMBIOS ---

	if (config.alCerrar) {
		notificacion.addEventListener('closed.bs.alert', config.alCerrar);
	}

	return notificacion;
}

export function mostrarAlertaExito(mensaje, opciones = {}) {
	return mostrarNotificacion(mensaje, 'success', opciones);
}

export function mostrarAlertaError(mensaje, opciones = {}) {
	return mostrarNotificacion(mensaje, 'error', opciones);
}

export function mostrarAlertaAdvertencia(mensaje, opciones = {}) {
	return mostrarNotificacion(mensaje, 'warning', opciones);
}

export function mostrarAlertaInfo(mensaje, opciones = {}) {
	return mostrarNotificacion(mensaje, 'info', opciones);
}

export function configurarNotificaciones(nuevaConfig) {
	configuracionGlobal = { ...configuracionGlobal, ...nuevaConfig };
}

export function limpiarNotificaciones() {
	const contenedor = document.getElementById('contenedor-notificaciones');
	if (contenedor) {
		const notificaciones = contenedor.querySelectorAll('.alert');
		notificaciones.forEach(notif => {
			if (notif && notif.parentNode) {
				const instancia = bootstrap.Alert.getInstance(notif);
				if (instancia) {
					instancia.close();
				} else {
					notif.remove();
				}
			}
		});
	}
}

export function mostrarNotificacionPermanente(mensaje, tipo = 'info', opciones = {}) {
	return mostrarNotificacion(mensaje, tipo, { ...opciones, duracion: 0 });
}

export function mostrarNotificacionConAccion(mensaje, tipo, textoBoton, accionBoton,
opciones = {}) {
	const notif = mostrarNotificacion(mensaje, tipo, { ...opciones, duracion: 0 });

	const botonAccion = crearElemento('button', {
		clases: ['btn', 'btn-sm', `btn-${tipo === 'success' ? 'success' : tipo === 'error' ?
'danger' : tipo === 'warning' ? 'warning' : 'info'}`, 'ms-2'],
		texto: textoBoton
	});

	botonAccion.addEventListener('click', () => {
		accionBoton();
		const instancia = bootstrap.Alert.getInstance(notif);
		if (instancia) {
			instancia.close();
		}
	});

	const contenido = notif.querySelector('.flex-grow-1');
	if (contenido) {
		contenido.appendChild(botonAccion);
	}
	return notif;
}

export function mostrarCargando(mensaje = 'Cargando...') {
	const notif = mostrarNotificacion(mensaje, 'info', { 
		duracion: 0, 
		icono: false,
		titulo: false
	});

	const spinner = crearElemento('div', {
		clases: ['spinner-border', 'spinner-border-sm', 'me-2'],
		atributos: { role: 'status' }
	});
	spinner.innerHTML = '<span class="visually-hidden">Cargando...</span>';

	const contenido = notif.querySelector('.flex-grow-1');
	if (contenido) {
		contenido.insertBefore(spinner, contenido.firstChild);
	}

	return {
		cerrar: () => {
			const instancia = bootstrap.Alert.getInstance(notif);
			if (instancia) {
				instancia.close();
			}
		}
	};
}

export function mostrarProgreso(mensaje, porcentaje) {
	const notif = mostrarNotificacion('', 'info', { 
		duracion: 0,
		icono: false,
		titulo: false
	});

	const contenido = notif.querySelector('.flex-grow-1');
	if (contenido) {
		contenido.innerHTML = `
			<div class="mb-1">${mensaje}</div>
			<div class="progress" style="height: 5px;">
				<div class="progress-bar" role="progressbar" style="width: ${porcentaje}%"></div>
			</div>
		`;
	}

	return {
		actualizar: (nuevoMensaje, nuevoPorcentaje) => {
			const progressBar = notif.querySelector('.progress-bar');
			const textoMensaje = notif.querySelector('.mb-1');
			if (progressBar) progressBar.style.width = `${nuevoPorcentaje}%`;
			if (textoMensaje) textoMensaje.textContent = nuevoMensaje;
		},
		cerrar: () => {
			const instancia = bootstrap.Alert.getInstance(notif);
			if (instancia) {
				instancia.close();
			}
		}
	};
}