import { obtenerElemento } from './dom.js';

// Gestiona el envío del formulario de inicio de sesión.
document.addEventListener('DOMContentLoaded', () => {
    const formulario = obtenerElemento('formularioLogin');
    const mensajeError = obtenerElemento('mensaje-error');

    if (formulario) {
        formulario.addEventListener('submit', async (evento) => {
            evento.preventDefault();
            mensajeError.textContent = '';

            const email = obtenerElemento('email').value;
            const contrasenia = obtenerElemento('contrasenia').value;

            try {
                const respuesta = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, contrasenia }),
                });

                const datos = await respuesta.json();

                if (respuesta.ok && datos.success) {
                    window.location.href = datos.redirect_url;
                } else {
                    mensajeError.textContent = datos.error || 'Ocurrió un error inesperado.';
                }
            } catch (error) {
                mensajeError.textContent = 'No se pudo conectar con el servidor. Intenta de nuevo más tarde.';
                console.error('Error en el fetch:', error);
            }
        });
    }
});