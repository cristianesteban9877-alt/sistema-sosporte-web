// dom.js
export function obtenerElemento(id) {
	const elemento = document.getElementById(id);
	if (!elemento) {
		console.error(`No se encontró el elemento con el ID: ${id}`);
	}
	return elemento;
}

export function obtenerElementos(selector) {
	const elementos = document.querySelectorAll(selector);
	if (elementos.length === 0) {
		console.warn(`No se encontraron elementos con el selector: ${selector}`);
	}
	return Array.from(elementos);
}

export function obtenerElementoPorSelector(selector) {
	const elemento = document.querySelector(selector);
	if (!elemento) {
		console.warn(`No se encontró el elemento con el selector: ${selector}`);
	}
	return elemento;
}

export function vaciarContenedor(elemento) {
	if (elemento) {
		elemento.innerHTML = '';
	} else {
		console.error('Intentaste vaciar un elemento null o undefined');
	}
}

export function mostrarMensaje(contenedor, mensaje, tipo = 'info') {
	if (!contenedor) return;
	const clases = {
		info: 'text-muted',
		error: 'text-danger',
		success: 'text-success',
		warning: 'text-warning'
	};
	contenedor.innerHTML = `<p class="${clases[tipo]} text-center p-4">${mensaje}</p>`;
}

export function prepararContenedor(idContenedor, mensaje = null, tipo = 'info') {
	const contenedor = obtenerElemento(idContenedor);
	if (!contenedor) {
		console.error(`No se encontró el contenedor: ${idContenedor}`);
		return null;
	}
	vaciarContenedor(contenedor);
	if (mensaje) {
		mostrarMensaje(contenedor, mensaje, tipo);
	}
	return contenedor;
}

export function obtenerPlantilla(idPlantilla) {
	const plantilla = obtenerElemento(idPlantilla);
	if (!plantilla) {
		console.error(`No se encontró la plantilla: ${idPlantilla}`);
		return null;
	}
	if (!(plantilla instanceof HTMLTemplateElement)) {
		console.error(`El elemento ${idPlantilla} no es un <template>`);
		return null;
	}
	return plantilla;
}

export function clonarPlantilla(idPlantilla) {
	const plantilla = obtenerPlantilla(idPlantilla);
	if (!plantilla) return null;
	return plantilla.content.cloneNode(true);
}

export function alternarVisibilidad(elemento, debeMostrarse) {
	if (elemento) {
		// ESTA ES LA LÍNEA CORREGIDA
		elemento.classList.toggle('d-none', !debeMostrarse);
	} else {
		console.error('Intentaste alternar visibilidad de un elemento null o undefined');
	}
}

export function mostrarElemento(elemento) {
	if (elemento) {
		elemento.classList.remove('d-none');
	}
}

export function ocultarElemento(elemento) {
	if (elemento) {
		elemento.classList.add('d-none');
	}
}

export function obtenerDatosFormulario(formulario) {
	if (typeof formulario === 'string') {
		formulario = obtenerElemento(formulario);
	}
	if (!formulario) {
		console.error('No se encontró el formulario o el ID proporcionado es inválido:', formulario);
		return null;
	}
	if (!(formulario instanceof HTMLFormElement)) {
		console.error('El elemento proporcionado no es un formulario válido', formulario);
		return null;
	}
	const datosFormulario = new FormData(formulario);
	const datos = Object.fromEntries(datosFormulario.entries());
	return datos;
}

export function crearElemento(etiqueta, opciones = {}) {
    const elemento = document.createElement(etiqueta);

    if (opciones.clases) {
        elemento.classList.add(...opciones.clases);
    }

    if (opciones.atributos) {
        for (const atributo in opciones.atributos) {
            elemento.setAttribute(atributo, opciones.atributos[atributo]);
        }
    }

    if (opciones.texto) {
        elemento.textContent = opciones.texto;
    }

    if (opciones.html) {
        elemento.innerHTML = opciones.html;
    }

    if (opciones.dataset) {
        for (const key in opciones.dataset) {
            elemento.dataset[key] = opciones.dataset[key];
        }
    }

    if (opciones.eventos) {
        for (const evento in opciones.eventos) {
            elemento.addEventListener(evento, opciones.eventos[evento]);
        }
    }

    if (opciones.estilos) {
        Object.assign(elemento.style, opciones.estilos);
    }

    return elemento;
}
export function agregarClases(elemento, clases) {
	if (elemento) {
		elemento.classList.add(...clases);
	}
}

export function removerClases(elemento, clases) {
	if (elemento) {
		elemento.classList.remove(...clases);
	}
}

export function toggleClase(elemento, clase) {
	if (elemento) {
		elemento.classList.toggle(clase);
	}
}

export function on(elementoPadre, selectorHijo, tipoEvento, callback) {
	if (!elementoPadre) {
		console.error('El elemento padre para delegación de eventos no existe');
		return;
	}
	elementoPadre.addEventListener(tipoEvento, (evento) => {
		const hijo = evento.target.closest(selectorHijo);
		if (hijo) {
			callback(evento, hijo);
		}
	});
}

export function limpiarFormulario(selectorOElementoFormulario) {
	const formulario = typeof selectorOElementoFormulario === 'string'
		? obtenerElemento(selectorOElementoFormulario)
		: selectorOElementoFormulario;
	if (formulario) {
		formulario.reset();
	} else {
		console.error('No se pudo limpiar el formulario: no encontrado');
	}
}

export function alternarEstadoFormulario(selectorOElementoFormulario, deshabilitar) {
	const formulario = typeof selectorOElementoFormulario === 'string'
		? obtenerElemento(selectorOElementoFormulario)
		: selectorOElementoFormulario;
	if (formulario) {
		const elementos = formulario.elements;
		for (let i = 0; i < elementos.length; i++) {
			elementos[i].disabled = deshabilitar;
		}
	}
}

export function scrollHaciaElemento(elemento, comportamiento = 'smooth', bloque = 'center') {
	if (elemento) {
		elemento.scrollIntoView({
			behavior: comportamiento,
			block: bloque
		});
	}
}

export function establecerValor(elemento, valor) {
	if (elemento) {
		elemento.value = valor;
	}
}

export function obtenerValor(elemento) {
	return elemento ? elemento.value : null;
}

export function establecerTexto(elemento, texto) {
	if (elemento) {
		elemento.textContent = texto;
	}
}

export function obtenerTexto(elemento) {
	return elemento ? elemento.textContent : null;
}

export function establecerHTML(elemento, html) {
	if (elemento) {
		elemento.innerHTML = html;
	}
}

export function obtenerHTML(elemento) {
	return elemento ? elemento.innerHTML : null;
}

export function removerElemento(elemento) {
	if (elemento && elemento.parentNode) {
		elemento.parentNode.removeChild(elemento);
	}
}

export function insertarAntesDe(nuevoElemento, elementoReferencia) {
	if (nuevoElemento && elementoReferencia && elementoReferencia.parentNode) {
		elementoReferencia.parentNode.insertBefore(nuevoElemento, elementoReferencia);
	}
}

export function insertarDespuesDe(nuevoElemento, elementoReferencia) {
	if (nuevoElemento && elementoReferencia && elementoReferencia.parentNode) {
		elementoReferencia.parentNode.insertBefore(nuevoElemento, elementoReferencia.nextSibling);
	}
}

export function agregarHijo(padre, hijo) {
	if (padre && hijo) {
		padre.appendChild(hijo);
	}
}