import requests
import re
from flask import (Flask, render_template, jsonify, redirect, url_for, request, flash,)
from flask_login import ( LoginManager, UserMixin, login_user, logout_user, login_required, current_user,)

# ==============================================================================
# CONFIGURACIÓN INICIAL
# ==============================================================================
app = Flask(__name__)
app.secret_key = "clave-secreta-muy-segura-y-dificil-de-adivinar"

API_BASE = "https://soporte2025.pythonanywhere.com"

# Configuración de Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "iniciosesion"
login_manager.login_message = "Por favor, inicia sesión para acceder a esta página."
login_manager.login_message_category = "warning"

# ==============================================================================
# CLASES Y FUNCIONES AUXILIARES
# ==============================================================================
class Usuario(UserMixin):
    def __init__(self, id_usuario, email, rol, id_aula=None):
        self.id = id_usuario
        self.email = email
        self.rol = rol
        self.id_aula = id_aula

@login_manager.user_loader
def cargar_usuario(id_usuario):
    try:
        respuesta = requests.get(f"{API_BASE}/obtener_usuario/{id_usuario}")
        if respuesta.ok:
            datos = respuesta.json()
            return Usuario(
                id_usuario=datos.get("idUsuarios"),
                email=datos.get("email"),
                rol=datos.get("rol"),
                id_aula=datos.get("id_aula"),
            )
        return None
    except requests.RequestException:
        return None

def generar_pagina_acceso_denegado(mensaje):
    """Función para mostrar una página de error estandarizada."""
    return render_template("acceso_denegado.html", mensaje=mensaje), 403

@app.template_filter("extraer_nombre")
def extraer_nombre_de_email(email):
    """Filtro de Jinja2 para obtener un nombre legible desde un email."""
    try:
        nombre = email.split("@")[0].replace(".", " ").replace("_", " ")
        return nombre.title()
    except:
        return "Usuario"

def normalizar_nombre(nombre):
    """Elimina espacios y convierte a minúsculas para comparaciones."""
    if nombre is None:
        return ""
    return re.sub(r"\s+", "", nombre).lower()

# ==============================================================================
# RUTAS DE AUTENTICACIÓN Y PÚBLICAS
# ==============================================================================
@app.route("/")
def inicio():
    if current_user.is_authenticated:
        return redirect(url_for("seleccionar_aulas"))
    return render_template("index.html")

@app.route("/iniciosesion")
def iniciosesion():
    if current_user.is_authenticated:
        return redirect(url_for("seleccionar_aulas"))
    return render_template("inicio-sesion.html")

@app.route("/api/login", methods=["POST"])
def api_login():
    datos_formulario = request.get_json()
    email = datos_formulario.get("email")
    contrasenia = datos_formulario.get("contrasenia")
    
    # AÑADIR ESTAS 2 LÍNEAS:
    if email:
        email = email.strip().lower()
    if contrasenia:
        contrasenia = contrasenia.strip()
    # FIN DE LO AÑADIDO
    
    if not email or not contrasenia:
        return jsonify({"success": False, "error": "Faltan datos."}), 400

    try:
        respuesta_api = requests.post(f"{API_BASE}/login_usuario", json=datos_formulario)

        if respuesta_api.status_code == 200:
            datos_usuario = respuesta_api.json()
            usuario_a_loguear = Usuario(
                id_usuario=datos_usuario.get("idUsuarios"),
                email=datos_usuario.get("email"),
                rol=datos_usuario.get("rol"),
                id_aula=datos_usuario.get("id_aula"),
            )
            login_user(usuario_a_loguear) # La sesión se guarda en una cookie segura
            return jsonify({"success": True, "redirect_url": url_for("seleccionar_aulas")})
        
        elif respuesta_api.status_code == 401:
            return jsonify({"success": False, "error": "Correo o contraseña incorrectos."}), 401
            
        else:
            error_api = respuesta_api.json().get("error", "Error desconocido de la API.")
            return jsonify({"success": False, "error": error_api}), respuesta_api.status_code

    except requests.RequestException:
        return jsonify({"success": False, "error": "Error de conexión con el servidor de autenticación."}), 503

@app.route("/cerrar_sesion")
@login_required
def cerrar_sesion():
    logout_user() 
    flash("Has cerrado sesión correctamente.", "success")
    return redirect(url_for("inicio"))

@app.route("/faq")
def mostrar_faq():
    return render_template("faq.html")

# ==============================================================================
# RUTAS PROTEGIDAS (Requieren inicio de sesión)
# ==============================================================================
@app.route("/registrarse")
@login_required
def registrarse():
    if current_user.rol != "admin":
        return generar_pagina_acceso_denegado("Esta función es solo para administradores.")
    return render_template("registrarse.html")

@app.route("/gestionar")
@login_required
def gestionar():
    roles_permitidos = ["admin", "soporte", "profesor-tecnica"]
    if current_user.rol not in roles_permitidos:
        return generar_pagina_acceso_denegado("No tienes permisos para acceder a la gestión del sistema.")
    return render_template("gestionar.html", current_user=current_user)

@app.route("/agregar_hardware")
@login_required
def agregar_hardware():
    roles_permitidos = ["admin", "soporte", "profesor-tecnica"]
    if current_user.rol not in roles_permitidos:
        return generar_pagina_acceso_denegado("No tienes permisos para agregar hardware.")
    return render_template("agregar-hardware.html")

@app.route("/seleccionaraulas")
@login_required
def seleccionar_aulas():
    return render_template("seleccionar-aulas.html")

@app.route("/controlaula/<nombre_aula_url>")
@login_required
def control_aula(nombre_aula_url):
    try:
        nombre_aula_real = nombre_aula_url.replace('_', ' ')
        payload = {"rol": current_user.rol, "id_aula": current_user.id_aula}
        respuesta_api = requests.post(f"{API_BASE}/aulas_permitidas", json=payload)
        respuesta_api.raise_for_status()
        aulas_permitidas = respuesta_api.json()
        
        nombre_normalizado_buscado = normalizar_nombre(nombre_aula_real)
        aula_encontrada = next(
            (aula for aula in aulas_permitidas if normalizar_nombre(aula.get("nombre")) == nombre_normalizado_buscado),
            None
        )
        
        if not aula_encontrada:
            return generar_pagina_acceso_denegado("No tienes permiso para acceder a esta aula o no existe.")
        
        return render_template("control-aula.html", aula=aula_encontrada)
        
    except requests.RequestException as e:
        return render_template("acceso_denegado.html", mensaje=f"Error de conexión con la API: {e}"), 503
    except Exception as e:
        return render_template("acceso_denegado.html", mensaje=f"Ocurrió un error inesperado: {e}"), 500

# ==============================================================================
# EJECUCIÓN DE LA APP
# ==============================================================================
if __name__ == "__main__":
    app.run(debug=True)