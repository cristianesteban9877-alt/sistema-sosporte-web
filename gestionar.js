import { llamarAPI } from "./api.js";
import { abrirModal, cerrarModal, inicializarModales } from "./modal.js";
import { mostrarAlertaExito, mostrarAlertaError } from "./notificaciones.js";
import {
    obtenerElemento,
    obtenerDatosFormulario,
    crearElemento,
    on,
    limpiarFormulario,
    vaciarContenedor,
} from "./dom.js";

const usuarioId = document.body.dataset.usuarioId;

const configuracionFormularios = {
    usuario: [
        {
            name: "rol",
            label: "Rol",
            type: "select",
            required: true,
            options: [
                { value: "alumno", text: "Alumno" },
                { value: "profesor", text: "Profesor" },
                { value: "profesor-tecnica", text: "Profesor de Técnica" },
                { value: "soporte", text: "Soporte" },
                { value: "admin", text: "Admin" },
            ],
        },
        {
            name: "contrasenia",
            label: "Nueva Contraseña",
            type: "password",
            required: false,
            placeholder: "Dejar en blanco para no cambiar",
            help: "Solo completa este campo si deseas cambiar la contraseña",
        },
        {
            name: "id_aula",
            label: "Aula Asignada (si es Alumno)",
            type: "select",
            required: false,
            options: [],
            container_id: "contenedor-aula-edit",
        },
    ],
    aula: [
        {
            name: "nombre",
            label: "Nombre del Aula",
            type: "text",
            required: true,
        },
        {
            name: "bdr_max",
            label: "Cantidad de Computadoras (BDR)",
            type: "number",
            required: true,
            min: 0,
            help: "Si reduces este número, solo se eliminarán BDRs sin hardware asignado.",
        },
    ],
    gabinete: [
        {
            name: "motherboard",
            label: "Motherboard",
            type: "text",
        },
        {
            name: "procesador",
            label: "Procesador",
            type: "text",
        },
        {
            name: "ram",
            label: "RAM",
            type: "text",
        },
        {
            name: "disco",
            label: "Disco",
            type: "text",
        },
        {
            name: "so",
            label: "Sistema Operativo",
            type: "text",
        },
        {
            name: "fuenteAlimen",
            label: "Fuente de Alimentación",
            type: "text",
        },
    ],
    monitor: [
        {
            name: "marca",
            label: "Marca",
            type: "text",
        },
        {
            name: "modelo",
            label: "Modelo",
            type: "text",
        },
        {
            name: "salida_video",
            label: "Salida de Video",
            type: "select",
            options: [
                {
                    value: "",
                    text: "(Seleccionar)",
                },
                {
                    value: "VGA",
                    text: "VGA",
                },
                {
                    value: "HDMI",
                    text: "HDMI",
                },
                {
                    value: "DVI",
                    text: "DVI",
                },
            ],
        },
    ],
};

function construirFormulario(tipo, datos, configuracion) {
    const cuerpoFormulario = obtenerElemento("formularioBody");
    vaciarContenedor(cuerpoFormulario);
    const campos = configuracion[tipo];
    let selectRol = null;
    let selectAula = null;
    let contenedorAula = null;

    campos.forEach((campo) => {
        const divMb3 = crearElemento("div", { clases: ["mb-3"] });

        if (campo.container_id) {
            divMb3.id = campo.container_id;
        }

        const label = crearElemento("label", {
            clases: ["form-label"],
            texto: campo.label,
            atributos: { for: `edit-${campo.name}` },
        });

        let input;

        if (campo.type === "select") {
            input = crearElemento("select", {
                clases: ["form-select"],
                atributos: {
                    name: campo.name,
                    id: `edit-${campo.name}`,
                },
            });

            if (campo.name !== "id_aula") {
                campo.options.forEach((opt) => {
                    const option = new Option(opt.text, opt.value);
                    if (datos[campo.name] == opt.value) option.selected = true;
                    input.appendChild(option);
                });
            }

            if (campo.name === "rol") {
                selectRol = input;
            } else if (campo.name === "id_aula") {
                selectAula = input;
                contenedorAula = divMb3;
                divMb3.classList.add("d-none");
            }
        } else {
            // Para campos de contraseña, NO pre-llenar con el valor actual
            const valorInicial =
                campo.type === "password" ? "" : datos[campo.name] || "";

            input = crearElemento("input", {
                clases: ["form-control"],
                atributos: {
                    type: campo.type,
                    name: campo.name,
                    id: `edit-${campo.name}`,
                    value: valorInicial,
                    placeholder: campo.placeholder || "",
                },
            });

            // Agregar atributo required solo si el campo lo requiere
            if (campo.required) {
                input.setAttribute("required", "required");
            }
        }

        divMb3.appendChild(label);
        divMb3.appendChild(input);

        // Agregar texto de ayuda si existe
        if (campo.help) {
            const textoAyuda = crearElemento("small", {
                clases: ["form-text", "text-muted"],
                texto: campo.help,
            });
            divMb3.appendChild(textoAyuda);
        }

        cuerpoFormulario.appendChild(divMb3);
    });

    // Lógica para mostrar/ocultar aula según el rol
    if (selectRol && contenedorAula && selectAula) {
        const gestionarVisibilidadAula = async (rolSeleccionado) => {
            if (rolSeleccionado === "alumno") {
                contenedorAula.classList.remove("d-none");
                if (selectAula.options.length <= 1) {
                    await cargarAulasParaEdicion(selectAula, datos.id_aula);
                }
            } else {
                contenedorAula.classList.add("d-none");
            }
        };

        selectRol.addEventListener("change", (e) => {
            gestionarVisibilidadAula(e.target.value);
        });

        gestionarVisibilidadAula(datos.rol);
    }
}

async function cargarAulasParaEdicion(selectElement, idAulaActual) {
    try {
        selectElement.innerHTML =
            '<option value="" selected disabled>Cargando aulas...</option>';
        selectElement.disabled = true;
        const aulas = await llamarAPI("/obtener_aulas");
        selectElement.innerHTML = '<option value="">(Ninguna)</option>';
        aulas
            .filter((aula) => /^\d/.test(aula.nombre))
            .sort((a, b) =>
                a.nombre.localeCompare(b.nombre, "es", {
                    numeric: true,
                })
            )
            .forEach((aula) => {
                const option = new Option(aula.nombre, aula.id_aula);
                if (aula.id_aula == idAulaActual) {
                    option.selected = true;
                }
                selectElement.appendChild(option);
            });
        selectElement.disabled = false;
    } catch (error) {
        console.error("Error cargando aulas para edición:", error);
        selectElement.innerHTML =
            '<option value="" selected disabled>Error al cargar aulas</option>';
        mostrarAlertaError("No se pudieron cargar las aulas.");
    }
}

function cargarDatosEnTabla(idTabla, idPlantilla, datos, aulas) {
    const cuerpoTabla = obtenerElemento(idTabla);
    const plantilla = obtenerElemento(idPlantilla);
    vaciarContenedor(cuerpoTabla);

    datos.forEach((item) => {
        const clon = plantilla.content.cloneNode(true);
        const fila = clon.querySelector("tr");
        const aulaAsignada = item.id_aula
            ? aulas.find((a) => a.id_aula === item.id_aula)
            : null;
        let id;

        switch (idPlantilla) {
            case "plantillaUsuario":
                id = item.idUsuarios;
                clon.querySelector(".id").textContent = id;
                clon.querySelector(".email").textContent = item.email;
                const rolElement = clon.querySelector(".rol");
                let rolTexto = item.rol;

                if (rolTexto) {
                    // Primero capitalizar
                    rolTexto = rolTexto.charAt(0).toUpperCase() + rolTexto.slice(1);

                    // Manejar el caso especial de "profesor-tecnica"
                    if (item.rol === "profesor-tecnica") {
                        rolTexto = "Profesor de Técnica";
                    }
                    // Manejar alumnos con aula
                    else if (item.rol === "alumno" && item.id_aula) {
                        const aulaDelAlumno = aulas.find((a) => a.id_aula == item.id_aula);
                        if (aulaDelAlumno && aulaDelAlumno.nombre) {
                            rolTexto = `Alumno (${aulaDelAlumno.nombre})`;
                        } else {
                            rolTexto = "Alumno (Aula desconocida)";
                        }
                    }
                    // Manejar alumnos sin aula
                    else if (item.rol === "alumno") {
                        rolTexto = "Alumno (Sin aula)";
                    }
                }
                rolElement.textContent = rolTexto;

                // --- INICIO DE LÓGICA DE DESBLOQUEO ---
                if (id == usuarioId) {
                    // 1. Estado inicial (Bloqueado)
                    fila.classList.add("table-warning", "usuario-actual-fila");
                    fila.setAttribute(
                        "title",
                        "Haz clic aquí para desbloquear la edición de tu usuario"
                    );

                    // 2. Añadir Badge "Tú"
                    const emailCell = clon.querySelector(".email");
                    const badge = crearElemento("span", {
                        clases: ["badge", "bg-info", "ms-2"],
                        texto: "Tú",
                    });
                    emailCell.appendChild(badge);

                    // 3. Deshabilitar botones
                    const botonesAccion = clon.querySelectorAll(".boton-accion");
                    botonesAccion.forEach((boton) => {
                        boton.disabled = true;
                        boton.classList.add("disabled");
                        boton.style.opacity = "0.5";
                    });

                    // 4. Event listener para desbloquear al hacer clic en la fila
                    fila.addEventListener(
                        "click",
                        () => {
                            // Solo actuar si NO está desbloqueado
                            if (!fila.classList.contains("desbloqueado")) {
                                fila.classList.remove("table-warning");
                                fila.classList.add("table-success", "desbloqueado"); // Estado desbloqueado
                                fila.setAttribute(
                                    "title",
                                    "Edición desbloqueada - Ten cuidado al modificar tu propio usuario"
                                );

                                // Habilitar botones
                                botonesAccion.forEach((boton) => {
                                    boton.disabled = false;
                                    boton.classList.remove("disabled");
                                    boton.style.opacity = "1";
                                });

                                // Mostrar alerta (usando la función de éxito con un tipo 'warning' si la tienes configurada, sino 'success' funciona)
                                mostrarAlertaExito(
                                    "¡Usuario desbloqueado! Ten cuidado al editar o eliminar tu propia cuenta.",
                                    "warning"
                                );
                            }
                        },
                        { once: false }
                    );
                }
                // --- FIN DE LÓGICA DE DESBLOQUEO ---
                break;

            case "plantillaAula":
                id = item.id_aula;
                clon.querySelector(".id").textContent = id;
                clon.querySelector(".nombre").textContent = item.nombre;
                clon.querySelector(".bdr").textContent = item.bdr_max;
                break;

            case "plantillaGabinete":
                id = item.id_gabinete;
                clon.querySelector(".id").textContent = id;
                clon.querySelector(".motherboard").textContent =
                    item.motherboard || "-";
                clon.querySelector(".procesador").textContent = item.procesador || "-";
                clon.querySelector(".ram").textContent = item.ram || "-";
                clon.querySelector(".disco").textContent = item.disco || "-";
                clon.querySelector(".so").textContent = item.so || "-";
                clon.querySelector(".fuente").textContent = item.fuenteAlimen || "-";
                const aulaNombre = aulaAsignada ? aulaAsignada.nombre : "Disponible";
                const bdrNum = item.id_bdr ? String(item.id_bdr).slice(-2) : "";
                const textoAulaBdr = aulaAsignada
                    ? `${aulaNombre} BDR ${bdrNum}`
                    : "Disponible";
                clon.querySelector(".aula-bdr").textContent = textoAulaBdr;
                break;

            case "plantillaMonitor":
                id = item.id_monitor;
                clon.querySelector(".id").textContent = id;
                clon.querySelector(".marca").textContent = item.marca || "-";
                clon.querySelector(".modelo").textContent = item.modelo || "-";
                clon.querySelector(".salida-video").textContent =
                    item.salida_video || "-";
                const aulaNombreMon = aulaAsignada ? aulaAsignada.nombre : "Disponible";
                const bdrNumMon = item.id_bdr ? String(item.id_bdr).slice(-2) : "";
                const textoAulaBdrMon = aulaAsignada
                    ? `${aulaNombreMon} BDR ${bdrNumMon}`
                    : "Disponible";
                clon.querySelector(".aula-bdr").textContent = textoAulaBdrMon;
                break;
        }

        fila.dataset.id = id;
        cuerpoTabla.appendChild(clon);
    });
}

async function inicializarGestion() {
    try {
        const rolUsuario = document.body.dataset.rolUsuario;
        if (rolUsuario === "admin") {
            const [usuarios, aulas, gabinetes, monitores] = await Promise.all([
                llamarAPI("/obtener_usuarios"),
                llamarAPI("/obtener_aulas"),
                llamarAPI("/obtener_gabinetes"),
                llamarAPI("/obtener_monitores"),
            ]);

            cargarDatosEnTabla("tablaUsuarios", "plantillaUsuario", usuarios, aulas);
            cargarDatosEnTabla("tablaAulas", "plantillaAula", aulas, aulas);
            cargarDatosEnTabla(
                "tablaGabinetes",
                "plantillaGabinete",
                gabinetes,
                aulas
            );
            cargarDatosEnTabla(
                "tablaMonitores",
                "plantillaMonitor",
                monitores,
                aulas
            );

            // NUEVA LÍNEA: Actualizar los títulos con el conteo
            actualizarConteoEnTitulos(usuarios, aulas, gabinetes, monitores);
        } else {
            const [aulas, gabinetes, monitores] = await Promise.all([
                llamarAPI("/obtener_aulas"),
                llamarAPI("/obtener_gabinetes"),
                llamarAPI("/obtener_monitores"),
            ]);

            cargarDatosEnTabla(
                "tablaGabinetes",
                "plantillaGabinete",
                gabinetes,
                aulas
            );
            cargarDatosEnTabla(
                "tablaMonitores",
                "plantillaMonitor",
                monitores,
                aulas
            );

            // NUEVA LÍNEA: Actualizar los títulos con el conteo (sin usuarios ni aulas)
            actualizarConteoEnTitulos([], aulas, gabinetes, monitores);
        }
    } catch (error) {
        mostrarAlertaError(
            `No se pudieron cargar los datos de gestión: ${error.message}`
        );
    }
}

async function abrirModalParaEditar(tipo, id) {
    if (!tipo) {
        console.error("No se pudo determinar el tipo de elemento para editar.");
        return;
    }
    obtenerElemento("modalGestionLabel").textContent = `Editar ${tipo.charAt(0).toUpperCase() + tipo.slice(1)
        }`;
    obtenerElemento("editId").value = id;
    obtenerElemento("editTipo").value = tipo;
    const cuerpoFormulario = obtenerElemento("formularioBody");
    cuerpoFormulario.innerHTML = '<p class="text-center">Cargando datos...</p>';
    abrirModal("modalGestion");
    try {
        const datos = await llamarAPI(`/obtener_${tipo}/${id}`);
        construirFormulario(tipo, datos, configuracionFormularios);
    } catch (error) {
        cuerpoFormulario.innerHTML = `<p class="text-danger text-center">${error.message}</p>`;
    }
}

async function guardarCambios() {
    const id = obtenerElemento("editId").value;
    const tipo = obtenerElemento("editTipo").value;
    const datos = obtenerDatosFormulario("formularioGestion");

    if (!datos) return;

    delete datos.editId;
    delete datos.editTipo;
    datos.id_usuario = usuarioId;

    // Si es un usuario y la contraseña está vacía, eliminarla del objeto
    // para que el backend no la actualice
    if (
        tipo === "usuario" &&
        (!datos.contrasenia || datos.contrasenia.trim() === "")
    ) {
        delete datos.contrasenia;
    }

    try {
        const resultado = await llamarAPI(
            `/actualizar_${tipo}/${id}`,
            "PUT",
            datos
        );
        mostrarAlertaExito(resultado.mensaje);
        cerrarModal("modalGestion");
        await inicializarGestion();
    } catch (error) {
        mostrarAlertaError(error.message);
    }
}

// Esta función SÍ ejecuta la eliminación después de confirmar en el modal
async function ejecutarEliminacion(tipo, id) {
    if (!tipo || !id) {
        mostrarAlertaError("Error: Faltan datos para la eliminación.");
        return;
    }

    try {
        const resultado = await llamarAPI(`/eliminar_${tipo}/${id}`, "DELETE", {
            id_usuario: usuarioId,
        });
        mostrarAlertaExito(resultado.mensaje);
        await inicializarGestion(); // Refrescar la tabla
    } catch (error) {
        mostrarAlertaError(error.message);
    } finally {
        cerrarModal("modalConfirmarEliminar"); // Cerrar el modal pase lo que pase
    }
}

// Esta función AHORA solo abre el modal de confirmación
async function eliminarElemento(tipo, id) {
    if (!tipo) {
        console.error("No se pudo determinar el tipo de elemento para eliminar.");
        return;
    }

    // 1. Configurar el modal
    const cuerpoModal = obtenerElemento("cuerpoConfirmarEliminar");
    const btnConfirmar = obtenerElemento("btnConfirmarEliminar");

    if (!cuerpoModal || !btnConfirmar) {
        // Si el modal no existe, volvemos al confirm nativo como respaldo
        console.error(
            "Error: No se encontró el modal de confirmación. Usando 'confirm' nativo."
        );
        if (
            !confirm(`¿Estás seguro de que quieres eliminar el ${tipo} con ID ${id}?`)
        ) {
            return;
        }
        // Si confirma, llamamos a la lógica de borrado directamente
        await ejecutarEliminacion(tipo, id);
        return;
    }

    cuerpoModal.textContent = `¿Estás seguro de que quieres eliminar el ${tipo} con ID ${id}? Esta acción no se puede deshacer.`;

    // 2. Almacenar los datos en el botón de confirmación
    btnConfirmar.dataset.tipo = tipo;
    btnConfirmar.dataset.id = id;

    // 3. Abrir el modal
    abrirModal("modalConfirmarEliminar");
}

function obtenerTipoDesdeSeccion(seccion) {
    const tipoPlural = seccion.id.split("-")[1];
    if (tipoPlural === "monitores") return "monitor";
    if (tipoPlural === "gabinetes") return "gabinete";
    return tipoPlural.slice(0, -1); // 'usuarios' -> 'usuario', 'aulas' -> 'aula'
}

function configurarBuscadorPorID(idInput, idBoton, idTbody) {
    const entrada = obtenerElemento(idInput);
    const boton = obtenerElemento(idBoton);
    const cuerpoTabla = obtenerElemento(idTbody);

    if (!entrada || !boton || !cuerpoTabla) {
        console.error(
            `Error al configurar el buscador: No se encontraron todos los elementos (input: ${idInput}, boton: ${idBoton}, tabla: ${idTbody})`
        );
        return;
    }

    const restaurarFilas = () => {
        const filas = Array.from(cuerpoTabla.querySelectorAll("tr"));
        filas.forEach((fila) => {
            fila.style.display = "";
            fila.classList.remove("buscado-resaltado");
        });
    };

    boton.addEventListener("click", () => {
        const filtroTrim = entrada.value.trim();
        const filtro = filtroTrim.replace(/\D/g, "");

        if (filtro === "") {
            restaurarFilas();
            return;
        }

        const filas = Array.from(cuerpoTabla.querySelectorAll("tr"));
        let encontrado = false;

        filas.forEach((fila) => {
            const celdald = fila.querySelector("td:first-child");
            const idNormalizado = (celdald?.textContent || "")
                .trim()
                .replace(/\D/g, "");

            if (idNormalizado && idNormalizado === filtro) {
                fila.style.display = "";
                fila.classList.add("buscado-resaltado");
                fila.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
                encontrado = true;
            } else {
                fila.style.display = "none";
                fila.classList.remove("buscado-resaltado");
            }
        });

        if (!encontrado) {
            mostrarAlertaError(`No se encontró ningún ítem con ID ${filtro}.`);
            restaurarFilas();
        }
    });

    entrada.addEventListener("input", () => {
        if (entrada.value.trim() === "") {
            restaurarFilas();
        }
    });
}

function actualizarConteoEnTitulos(usuarios, aulas, gabinetes, monitores) {
    const rolUsuario = document.body.dataset.rolUsuario;

    // Solo actualizar usuarios y aulas si es admin
    if (rolUsuario === "admin") {
        const tituloUsuarios = document.querySelector("#gestion-usuarios h2");
        if (tituloUsuarios) {
            tituloUsuarios.textContent = `Usuarios (${usuarios.length})`;
        }

        const tituloAulas = document.querySelector("#gestion-aulas h2");
        if (tituloAulas) {
            tituloAulas.textContent = `Aulas (${aulas.length})`;
        }
    }

    // Estos se actualizan para todos los roles
    const tituloGabinetes = document.querySelector("#gestion-gabinetes h2");
    if (tituloGabinetes) {
        tituloGabinetes.textContent = `Lista de gabinetes (${gabinetes.length})`;
    }

    const tituloMonitores = document.querySelector("#gestion-monitores h2");
    if (tituloMonitores) {
        tituloMonitores.textContent = `Lista de monitores (${monitores.length})`;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // 1. Añade el nuevo ID del modal aquí
    inicializarModales([
        "modalGestion",
        "modalCrearAula",
        "modalConfirmarEliminar",
    ]);
    inicializarGestion();

    document.addEventListener("hardwareAgregado", () => {
        inicializarGestion();
    });

    const rolUsuario = document.body.dataset.rolUsuario;
    const formularioCrearAula = obtenerElemento("formularioCrearAula");

    if (formularioCrearAula && rolUsuario === "admin") {
        formularioCrearAula.addEventListener("submit", async (evento) => {
            evento.preventDefault();
            const datosAula = obtenerDatosFormulario(formularioCrearAula);
            datosAula.id_usuario = usuarioId;
            if (!datosAula.id_aula || !datosAula.nombre || !datosAula.bdr_max) {
                mostrarAlertaError("Completa todos los campos correctamente.");
                return;
            }
            try {
                const resultado = await llamarAPI("/crear_aula", "POST", datosAula);
                mostrarAlertaExito(resultado.mensaje);
                limpiarFormulario(formularioCrearAula);
                cerrarModal("modalCrearAula");
                await inicializarGestion();
            } catch (error) {
                mostrarAlertaError(error.message);
            }
        });
    }

    // 2. AÑADIR ESTE BLOQUE para el botón de confirmación del modal
    const btnConfirmar = obtenerElemento("btnConfirmarEliminar");
    if (btnConfirmar) {
        btnConfirmar.addEventListener("click", () => {
            const tipo = btnConfirmar.dataset.tipo;
            const id = btnConfirmar.dataset.id;
            // Llama a la nueva función que hace el trabajo
            ejecutarEliminacion(tipo, id);
        });
    }

    const contenedorPrincipal = obtenerElemento("gestionar-container");
    if (contenedorPrincipal) {
        on(contenedorPrincipal, ".boton-editar", "click", (e, boton) => {
            const fila = boton.closest("tr");
            const seccion = boton.closest(".seccion-gestionar");
            const tipo = obtenerTipoDesdeSeccion(seccion);
            const id = fila.dataset.id;

            // Validar permisos generales
            if (tipo === "usuario" || tipo === "aula") {
                if (rolUsuario !== "admin") {
                    mostrarAlertaError("No tienes permisos para editar esto");
                    return;
                }
            }

            abrirModalParaEditar(tipo, id);
        });

        // Reemplazar el listener de .boton-editar
        on(contenedorPrincipal, ".boton-editar", "click", (e, boton) => {
            const fila = boton.closest("tr");
            const seccion = boton.closest(".seccion-gestionar");
            const tipo = obtenerTipoDesdeSeccion(seccion);
            const id = fila.dataset.id;

            if (tipo === "usuario" || tipo === "aula") {
                if (rolUsuario !== "admin") {
                    mostrarAlertaError("No tienes permisos para editar esto");
                    return;
                }
            }

            // Validación: Comprobar si es el usuario actual Y si está bloqueado
            if (
                tipo === "usuario" &&
                id == usuarioId &&
                !fila.classList.contains("desbloqueado")
            ) {
                mostrarAlertaError(
                    "Haz clic en tu fila de usuario para desbloquear la edición."
                );
                return;
            }

            abrirModalParaEditar(tipo, id);
        });

        // Reemplazar el listener de .boton-eliminar
        on(contenedorPrincipal, ".boton-eliminar", "click", (e, boton) => {
            const fila = boton.closest("tr");
            const seccion = boton.closest(".seccion-gestionar");
            const tipo = obtenerTipoDesdeSeccion(seccion);
            const id = fila.dataset.id;

            if (tipo === "usuario" || tipo === "aula") {
                if (rolUsuario !== "admin") {
                    mostrarAlertaError("No tienes permisos para eliminar esto");
                    return;
                }
            }

            // Validación: Comprobar si es el usuario actual Y si está bloqueado
            if (
                tipo === "usuario" &&
                id == usuarioId &&
                !fila.classList.contains("desbloqueado")
            ) {
                mostrarAlertaError(
                    "Haz clic en tu fila de usuario para desbloquear la eliminación."
                );
                return;
            }

            eliminarElemento(tipo, id);
        });
    }

    // CONFIGURAR LOS BUSCADORES
    if (rolUsuario === "admin") {
        configurarBuscadorPorID(
            "buscadorIdUsuario",
            "botonBuscarUsuario",
            "tablaUsuarios"
        );
        configurarBuscadorPorID("buscadorIdaula", "botonBuscaraula", "tablaAulas");
    }
    configurarBuscadorPorID(
        "buscadorIdgabinete",
        "botonBuscargabinete",
        "tablaGabinetes"
    );
    configurarBuscadorPorID(
        "buscadorIdmonitor",
        "botonBuscargmonitor",
        "tablaMonitores"
    );
});

// Hacer la función accesible globalmente para el `onclick` del HTML
window.guardarCambios = guardarCambios;
