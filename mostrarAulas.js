import { llamarAPI } from './api.js';
import { obtenerElemento, vaciarContenedor, mostrarMensaje } from './dom.js';
import { mostrarAlertaError } from './notificaciones.js';

let aulasGlobal = [];
const rolUsuario = document.body.dataset.rolUsuario;
const idAulaUsuario = document.body.dataset.idaulaUsuario;

function mostrarAulas(aulas) {
	const contenedor = obtenerElemento("contenedorAulas");
	const plantilla = obtenerElemento("plantilla-aula");
	vaciarContenedor(contenedor);

	if (!aulas || aulas.length === 0) {
		mostrarMensaje(contenedor, 'No hay aulas para mostrar', 'info');
		return;
	}

	aulas.forEach(aula => {
		const clon = plantilla.content.cloneNode(true);
		clon.querySelector('[data-aula="nombre"]').textContent = aula.nombre ?? 'Sin nombre';
		clon.querySelector('[data-aula="bdr_disponibles"]').textContent = aula.bdr_disponibles !== undefined ? aula.bdr_disponibles : 'N/A';
		clon.querySelector('[data-aula="bdr_max"]').textContent = aula.bdr_max ?? '?';
		clon.querySelector('[data-aula="proyector"]').textContent = aula.proyector ? "Funciona" : "No disponible";
		clon.querySelector('[data-aula="audio"]').textContent = aula.audio ? "Funciona" : "No disponible";
		clon.querySelector('[data-aula="boton"]').onclick = () => {
			window.location.href = `/controlaula/${aula.nombre.replace(/\s+/g, '_')}`;
		};
		contenedor.appendChild(clon);
	});
}

function filtrarAulas(tipo) {
	const aulas = aulasGlobal;
	let filtradas = aulas.filter(aula => {
		const nombre = (aula.nombre || '').trim().toLowerCase();
		if (tipo === 'todos') return true;
		if (tipo === 'aulas') return /^\d/.test(nombre);
		if (tipo === 'laboratorios') return nombre.startsWith('laboratorio');
		if (tipo === 'preceptoria') return nombre.startsWith('preceptoria');
		if (tipo === 'secretaria') return nombre.startsWith('secretaria');
		return false;
	});

	filtradas.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { numeric: true }));
	mostrarAulas(filtradas);
}

function setActiveButton(tipo) {
	document.querySelectorAll('.boton-filtro').forEach(btn => {
		btn.classList.toggle('activo', btn.dataset.tipo === tipo);
	});
}

async function cargarAulas() {
	try {
		const payload = { rol: rolUsuario, id_aula: idAulaUsuario };
		const aulas = await llamarAPI("/aulas_permitidas", 'POST', payload);
		aulasGlobal = aulas || [];
		filtrarAulas('todos');
		setActiveButton('todos');

	} catch (error) {
		console.error("Error cargando aulas:", error);
		const contenedor = obtenerElemento("contenedorAulas");
		if (contenedor) {
			mostrarMensaje(contenedor, 'No se pudieron cargar las aulas.', 'error');
		}
		mostrarAlertaError('No se pudieron cargar las aulas.');
	}
}

function setupFilterButtons() {
	document.querySelectorAll('.boton-filtro').forEach(btn => {
		btn.addEventListener('click', () => {
			const tipo = btn.dataset.tipo;
			filtrarAulas(tipo);
			setActiveButton(tipo);
		});
	});
}

document.addEventListener("DOMContentLoaded", () => {
	cargarAulas();
	setupFilterButtons();
});