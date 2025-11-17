import { llamarAPI } from './api.js';
import { obtenerElemento, obtenerValor, establecerValor, mostrarElemento, ocultarElemento } from './dom.js';
import { mostrarAlertaError, mostrarAlertaExito, limpiarNotificaciones } from './notificaciones.js';

// --- Obtención de elementos del DOM ---
const emailInput = obtenerElemento("emailInput");
const contraseniaInput = obtenerElemento("contraseniaInput");
const confirmarContraseniaInput = obtenerElemento("confirmarContraseniaInput");
const rolSelect = obtenerElemento("rolSelect");
const contenedorAulas = obtenerElemento("contenedorAulas");
const idAulaSelect = obtenerElemento("idAulaSelect");
const mensajeFeedback = obtenerElemento("mensajeFeedback");
const botonRegistrar = obtenerElemento("botonRegistrar");

// --- Validación de contraseña (Instantánea) ---
function validarSeguridadContrasenia(contrasenia) {
    const requisitos = {
        longitud: contrasenia.length >= 6,
        mayuscula: /[A-Z]/.test(contrasenia),
        numero: /\d/.test(contrasenia),
        simbolo: /[^A-Za-z0-9]/.test(contrasenia)
    };

    if (contrasenia.length === 0) {
        mensajeFeedback.textContent = "";
        return false;
    }

    if (Object.values(requisitos).every(v => v === true)) {
        if (mensajeFeedback.textContent.startsWith("La contraseña debe incluir")) {
            mensajeFeedback.textContent = "";
        }
        return true;
    }

    let faltantes = [];
    if (!requisitos.longitud) faltantes.push("mínimo 6 caracteres");
    if (!requisitos.mayuscula) faltantes.push("una mayúscula");
    if (!requisitos.numero) faltantes.push("un número");
    if (!requisitos.simbolo) faltantes.push("un símbolo");

    mensajeFeedback.textContent = `La contraseña debe incluir: ${faltantes.join(", ")}.`;
    mensajeFeedback.style.color = "red";
    return false;
}

// --- Comparación de contraseñas (Instantánea) ---
function compararContrasenias() {
    const contrasenia = obtenerValor(contraseniaInput);
    const confirmar = obtenerValor(confirmarContraseniaInput);

    if (confirmar.length === 0) {
        if (mensajeFeedback.textContent === "Las contraseñas no coinciden.") {
            mensajeFeedback.textContent = "";
        }
        return false;
    }

    if (contrasenia !== confirmar) {
        mensajeFeedback.textContent = "Las contraseñas no coinciden.";
        mensajeFeedback.style.color = "red";
        return false;
    }

    if (mensajeFeedback.textContent === "Las contraseñas no coinciden.") {
        mensajeFeedback.textContent = "";
    }
    return true;
}

// --- Generador de contraseña ---
// --- Generador de contraseña ---
function generarContraseniaAleatoria() {
    // Grupos de caracteres separados para garantizar que la contraseña cumpla los requisitos
    const mayusculas = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const minusculas = "abcdefghijklmnopqrstuvwxyz";
    const numeros = "0123456789";
    const simbolos = "!@#$%^&*()_+{}[]";

    // Garantizar al menos UN carácter de cada tipo requerido
    let contrasenia = "";
    contrasenia += mayusculas.charAt(Math.floor(Math.random() * mayusculas.length)); // 1 mayúscula
    contrasenia += numeros.charAt(Math.floor(Math.random() * numeros.length));       // 1 número
    contrasenia += simbolos.charAt(Math.floor(Math.random() * simbolos.length));     // 1 símbolo

    // Rellenar el resto con caracteres aleatorios de todos los grupos
    const todosLosCaracteres = mayusculas + minusculas + numeros + simbolos;
    const longitudRestante = 7; // Para llegar a 10 caracteres en total (ya tenemos 3)

    for (let i = 0; i < longitudRestante; i++) {
        contrasenia += todosLosCaracteres.charAt(Math.floor(Math.random() * todosLosCaracteres.length));
    }

    // Mezclar la contraseña para que no siempre tenga el mismo patrón
    contrasenia = contrasenia.split('').sort(() => Math.random() - 0.5).join('');

    // Establecer la contraseña en ambos campos
    establecerValor(contraseniaInput, contrasenia);
    establecerValor(confirmarContraseniaInput, contrasenia);

    mensajeFeedback.textContent = "Contraseña generada automáticamente.";
    mensajeFeedback.style.color = "green";

    mostrarAlertaExito("Contraseña generada automáticamente", { duracion: 2000 });
    validarFormularioCompleto();
}

// --- Habilitar/deshabilitar el botón de registro ---
function validarFormularioCompleto() {
    const emailValido = emailInput.value.trim() !== "" && emailInput.checkValidity();
    const rolValido = rolSelect.value.trim() !== "";
    let aulaValida = true;

    if (rolSelect.value === "alumno") {
        aulaValida = idAulaSelect.value.trim() !== "";
    }

    const seguridadContrasenia = validarSeguridadContrasenia(contraseniaInput.value);
    const contraseniasCoinciden = compararContrasenias();

    const todoValido = emailValido && rolValido && aulaValida && seguridadContrasenia && contraseniasCoinciden;
    botonRegistrar.disabled = !todoValido;
}

// --- Lógica de Aulas (para rol Alumno) ---
async function mostrarOpcionesAula() {
    const rol = obtenerValor(rolSelect);

    if (rol === "alumno") {
        mostrarElemento(contenedorAulas);
        try {
            const aulas = await llamarAPI("/obtener_aulas");
            idAulaSelect.innerHTML = '<option value="" selected disabled>Selecciona un aula</option>';
            aulas
                .filter(aula => /^\d/.test(aula.nombre))
                .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { numeric: true }))
                .forEach(aula => {
                    const option = new Option(aula.nombre, aula.id_aula);
                    idAulaSelect.appendChild(option);
                });
        } catch (error) {
            console.error("Error cargando aulas:", error);
            mostrarAlertaError("No se pudieron cargar las aulas");
        }
    } else {
        ocultarElemento(contenedorAulas);
    }
    validarFormularioCompleto();
}

// --- Registro de Usuario (Función Principal) ---
async function registrarUsuario(evento) {
    evento.preventDefault();

    console.log("🔴 registrarUsuario se ejecutó"); // Para debugging

    limpiarNotificaciones();
    mensajeFeedback.textContent = "";

    if (!compararContrasenias() || !validarSeguridadContrasenia(obtenerValor(contraseniaInput))) {
        mostrarAlertaError("Revisa los datos del formulario.");
        return;
    }

    const email = obtenerValor(emailInput);
    const contrasenia = obtenerValor(contraseniaInput);
    let rol = obtenerValor(rolSelect);

    if (rol === "profesorTecnica") {
        rol = "profesor-tecnica";
    }

    const id_aula = (rol === "alumno") ? obtenerValor(idAulaSelect) : null;

    if (rol === "alumno" && !id_aula) {
        mostrarAlertaError("Debes seleccionar un aula para el alumno");
        return;
    }

    try {
        await llamarAPI('/registrar_usuario', 'POST', { email, contrasenia, rol, id_aula });

        mostrarAlertaExito("Usuario registrado correctamente", {
            duracion: 2000,
            alCerrar: () => {
                window.location.href = "/gestionar";
            }
        });

    } catch (error) {
        const errorMessage = error.message || String(error);
        mostrarAlertaError(errorMessage);
    }
}

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    const form = obtenerElemento('formularioRegistro');
    const btnGenerar = obtenerElemento('btnGenerarContrasenia');

    if (form) {
        form.addEventListener('submit', registrarUsuario);
    }

    if (btnGenerar) {
        btnGenerar.addEventListener('click', generarContraseniaAleatoria);
    }

    if (rolSelect) {
        rolSelect.addEventListener('change', () => {
            mostrarOpcionesAula();
            validarFormularioCompleto();
        });
    }

    if (emailInput) {
        emailInput.addEventListener('input', validarFormularioCompleto);
    }

    if (contraseniaInput) {
        contraseniaInput.addEventListener('input', validarFormularioCompleto);
    }

    if (confirmarContraseniaInput) {
        confirmarContraseniaInput.addEventListener('input', validarFormularioCompleto);
    }

    if (idAulaSelect) {
        idAulaSelect.addEventListener('change', validarFormularioCompleto);
    }
});