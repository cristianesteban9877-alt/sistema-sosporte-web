import { obtenerElemento } from './dom.js';

const modales = {};

export function inicializarModales(ids, opciones = {}) {
	const listalds = Array.isArray(ids) ? ids : [ids];
	const configuracionPorDefecto = {
		backdrop: true,
		keyboard: true,
		focus: true
	};
	const config = { ...configuracionPorDefecto, ...opciones };
	listalds.forEach(id => {
		const elemento = obtenerElemento(id);
		if (!elemento) {
			return;
		}
		if (modales[id]) {
			return;
		}
		modales[id] = new bootstrap.Modal(elemento, config);
		elemento.addEventListener('hidden.bs.modal', () => {
			limpiarBackdropsHuerfanos();
		});
	});
}

export function abrirModal(id) {
	if (modales[id]) {
		modales[id].show();
		return;
	}
	const elemento = obtenerElemento(id);
	if (elemento) {
		const modalTemporal = new bootstrap.Modal(elemento, {
			backdrop: true,
			keyboard: true
		});
		modalTemporal.show();
	} else {
	}
}

export function cerrarModal(id) {
	if (modales[id]) {
		modales[id].hide();
	} else {
		const elemento = obtenerElemento(id);
		if (elemento) {
			const instancia = bootstrap.Modal.getInstance(elemento);
			if (instancia) {
				instancia.hide();
			} else {
			}
		}
	}
}

export function estaAbierto(id) {
	const elemento = obtenerElemento(id);
	if (!elemento) return false;
	return elemento.classList.contains('show');
}

export function alternarModal(id) {
	if (estaAbierto(id)) {
		cerrarModal(id);
	} else {
		abrirModal(id);
	}
}

export function destruirModal(id) {
	if (modales[id]) {
		modales[id].dispose();
		delete modales[id];
	}
	limpiarBackdropsHuerfanos();
}

export function cerrarTodos() {
	Object.keys(modales).forEach(id => cerrarModal(id));
	setTimeout(limpiarBackdropsHuerfanos, 300);
}

export function obtenerInstancia(id) {
	return modales[id] || null;
}

export function alAbrir(id, callback) {
	const elemento = obtenerElemento(id);
	if (elemento) {
		elemento.addEventListener('shown.bs.modal', callback);
	}
}

export function alCerrar(id, callback) {
	const elemento = obtenerElemento(id);
	if (elemento) {
		elemento.addEventListener('hidden.bs.modal', callback);
	}
}

function limpiarBackdropsHuerfanos() {
	const backdrops = document.querySelectorAll('.modal-backdrop');
	const modalesAbiertos = document.querySelectorAll('.modal.show');
	if (modalesAbiertos.length === 0) {
		backdrops.forEach(backdrop => {
			if (backdrop && backdrop.parentNode) {
				backdrop.remove();
			}
		});
		document.body.classList.remove('modal-open');
		document.body.style.removeProperty('overflow');
		document.body.style.removeProperty('padding-right');
	} else if (backdrops.length > modalesAbiertos.length) {
		const extras = backdrops.length - modalesAbiertos.length;
		for (let i = 0; i < extras; i++) {
			if (backdrops[i] && backdrops[i].parentNode) {
				backdrops[i].remove();
			}
		}
	}
}

export { limpiarBackdropsHuerfanos };

export function mostrarModalConfirmacion(mensaje, titulo = 'Confirmar Acción', tipo = 'danger') {
	const modal = obtenerElemento('modalConfirmacionGeneral');
	const modalTitulo = obtenerElemento('modalConfirmacionGeneralLabel');
	const modalHeader = obtenerElemento('modalConfirmacionGeneralHeader');
	const modalBody = obtenerElemento('modalConfirmacionGeneralBody');
	const btnConfirmar = obtenerElemento('btnConfirmarGeneral');

	if (!modal || !modalTitulo || !modalHeader || !modalBody || !btnConfirmar) {
		return Promise.resolve(confirm(mensaje));
	}

	modalTitulo.innerHTML = `<i class="bi bi-exclamation-triangle-fill"></i> ${titulo}`;
	modalBody.textContent = mensaje;

	modalHeader.classList.remove('bg-danger', 'bg-warning', 'text-white');
	btnConfirmar.classList.remove('btn-danger', 'btn-warning');

	if (tipo === 'danger') {
		modalHeader.classList.add('bg-danger', 'text-white');
		btnConfirmar.classList.add('btn-danger');
	} else {
		modalHeader.classList.add('bg-warning');
		btnConfirmar.classList.add('btn-warning');
	}

	return new Promise((resolve) => {
		const btnConfirmarClon = btnConfirmar.cloneNode(true);
		btnConfirmar.parentNode.replaceChild(btnConfirmarClon, btnConfirmar);

		const btnCancelar = modal.querySelector('button[data-bs-dismiss="modal"]');
		const modalElement = obtenerElemento('modalConfirmacionGeneral');

		let resuelto = false;

		const alConfirmar = () => {
			if (resuelto) return;
			resuelto = true;
			cerrarModal('modalConfirmacionGeneral');
			resolve(true);
		};

		const alCancelar = () => {
			if (resuelto) return;
			resuelto = true;
			cerrarModal('modalConfirmacionGeneral');
			resolve(false);
		};

		const alOcultar = () => {
			if (resuelto) return;
			resuelto = true;
			resolve(false);
			btnConfirmarClon.removeEventListener('click', alConfirmar);
			btnCancelar.removeEventListener('click', alCancelar);
		};

		btnConfirmarClon.addEventListener('click', alConfirmar, { once: true });
		btnCancelar.addEventListener('click', alCancelar, { once: true });
		modalElement.addEventListener('hidden.bs.modal', alOcultar, { once: true });

		btnConfirmarClon.addEventListener('click', () => modalElement.removeEventListener('hidden.bs.modal', alOcultar), { once: true });
		btnCancelar.addEventListener('click', () => modalElement.removeEventListener('hidden.bs.modal', alOcultar), { once: true });

		abrirModal('modalConfirmacionGeneral');
	});
}