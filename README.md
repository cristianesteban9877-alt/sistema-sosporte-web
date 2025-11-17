# Sistema soporte Sagrado Corazón Al. Cal. (SsSC) 🖥️

![Logo del proyecto](static/img/logo.png)

## Sistema Web de control de aulas y computadoras para el Soporte Técnico

---

## Indice

- [Introducción](#introducción)
    - [Objetivo del proyecto](#objetivo-del-proyecto)
    - [Decisiones técnicas del equipo](#decisiones-técnicas-del-equipo)
        - [Bootstrap](#bootstrap)
        - [Flask](#flask)
        - [PythonAnywhere](#pythonanywhere)
    - [Estado actual del proyecto](#estado-actual-del-proyecto)
- [Instalación del proyecto](#instalación-del-proyecto)
    - [Clonar repositorio](#clonar-repositorio)
    - [Instalar Python](#instalar-python)
    - [Instalar Flask/Flask-Login](#instalar-flaskflask-login)
    - [Instalar requests](#instalar-requests)
    - [Instalar pip](#instalar-pip)
    - [Iniciar el contenido del repositorio](#iniciar-el-contenido-del-repositorio)
- [Estructura de directorios](#estructura-de-directorios)
    - [Pantallas de la página](#pantallas-de-la-página)
- [Herramientas utilizadas](#herramientas-utilizadas)
- [Créditos](#créditos)
---

## Introducción

En este repositorio se almacena la **página web** del proyecto denominado **Sistema de Soporte Sagrado Corazón Al. Cal**, desarrollado utilizando los lenguajes *HTML*, *CSS*, *JavaScript* y *Python*. El proyecto consiste en un sistema (disponible tanto para dispositivos móviles como para la web) que permite a los usuarios gestionar el estado de los dispositivos en cada aula de la escuela secundaria **Sagrado Corazón Al. Cal**.
Este proyecto se está llevando a cabo teniendo en cuenta lo diagramado en el [Diagrama de Entidad y Relación](https://drive.google.com/file/d/1cBF-ouSTAnJteINNelDu4B3LaD_ZgULP/view?usp=drive_link) que diseñamos para este proyecto y la estrutura y estilos diseñados en el [Mockup del Proyecto](https://www.figma.com/design/54xsJwvNFpv46d0cNe7Ehx/Proyecto-Soporte-MockUp--Pagina-Web-y-Movil-?node-id=0-1&t=wHSkP1ed1hbRMXCC-1).

### Objetivo del proyecto

Este proyecto fue creado como un **trabajo anual e integrador** para el último año de la secundaria técnica, con el objetivo de aplicar todos los conocimientos adquiridos a lo largo de los años de estudio en una página web y una aplicación móvil. La versión final de la página web busca convertirse en una **herramienta** que optimice el sistema de *soporte técnico* de la escuela, unificando en una única página o aplicación todas las necesidades y los pasos necesarios para reportar un dispositivo.

### Decisiones técnicas del equipo

#### Bootstrap

Decidimos utilizar **Bootstrap** debido al conocimiento previo que teníamos de este framework. Lo elegimos por su amplia variedad de componentes y la facilidad con la que permite ejecutar las funciones que teníamos en mente para el proyecto, además de lo sencillo que es modificar el estilo y la apariencia de cada uno de los componentes. Bootstrap cumple con la estructura, funcionalidad y visualización que deseábamos al diseñar el proyecto.

#### Flask

Implementamos **Flask** en la página web como framework backend debido a su facilidad y flexibilidad para integrarse con otras tecnologías. La intención principal era poder realizar un ABM (Alta, Baja y Modificación) en nuestra página utilizando las funciones y el enrutamiento de Python, para conectar nuestro servidor con la base de datos a través de Flask. Es una tecnología que ya habíamos utilizado anteriormente, por lo que también la elegimos por estar familiarizados con su uso.

#### PythonAnywhere

Utilizamos **PythonAnywhere** como nuestra plataforma de despliegue para la aplicación debido a su facilidad de uso y la posibilidad de integrarlo directamente con aplicaciones Flask, como es nuestra página. Con PythonAnywhere creamos un servidor en el que alojamos la base de datos, lo que nos permite acceder a ella utilizando el lenguaje Python desde Flask. De esta manera, la base de datos puede modificarse desde cualquier computadora en la que se ejecute la página utilizando Flask.


### Estado actual del Proyecto

**Sprint Julio-Agosto:** Tras haber completado la documentación y la fase de diseño, el equipo se encuentra actualmente en la fase de desarrollo. En el caso de la página web, comenzamos a programar con *HTML* la estructura más básica, enfocándonos en los elementos necesarios para la funcionalidad planeada. Una vez que tengamos la estructura principal de la página, nos centraremos en mejorarla progresivamente con estilos *CSS*.
Con la estructura y el diseño iniciales listos, el siguiente paso será conectar la página con una *base de datos* previamente creada, para finalizar la integración de la funcionalidad deseada.

**Sprint Septiembre:** Tras completar el desarrollo de la estructura básica de la página web, comenzamos a corregir estilos y a cargar la página en el servidor utilizando *Flask* y funciones en *Python*. El objetivo principal de este Sprint fue conectar la página con la *base de datos* para poder generar reportes, añadir o eliminar computadoras, asignar o desasignar gabinetes, y editar sus componentes. Toda la conexión con la base de datos se logra mediante *PythonAnywhere*.

**Sprint Octubre:** Estando en la etapa final del desarrollo, el equipo se está centrando en corregir los estilos y los detalles de las funcionalidades del sistema. En esta fase, nos aseguramos de que todo *funcione correctamente* y se vea como debería, para cerrar el proyecto y darlo por completado. Todas las *funciones ABM* han sido añadidas, así como los *permisos correspondientes* para cada usuario.

---

## Instalación del proyecto

### Clonar repositorio

Ingresando en el repositorio de gitlab y clickando en la pestaña desplegable que pone "**Code**" podemos ver distintos links para clonar el repositorio, solo hace falta con copiar el link HTTPS y clonar el repositorio de esta forma:

* Abrir una terminal en nuestra computadora y escribir:

```
git clone https://gitlab.com/valentina-zarate/sistema-soporte-web.git
```

### Instalar Python

Para iniciar el contenido del repositorio es necesario tener instalado python (también para instalar pip flask y requests). Si Python no está instalado, sigue estos pasos para instalar Python en Windows:

1. Ve a la página oficial de Python: [https://www.python.org/downloads/](https://www.python.org/downloads/).
2. Descarga el instalador de la última versión para Windows.
3. Ejecuta el instalador y **marca la opción "Add Python to PATH"** antes de hacer clic en "Install Now".
4. Verifica la instalación abriendo la terminal (cmd) y ejecutando:
```
   python --version
 ```

### Instalar pip

En caso de que no se pueda iniciar el contenido del repositorio porque flask, flask-login o requests no está instalado, es importante asegurarnos de que tenemos instalado pip primero. Para instalar pip lo hacemos con el siguiente comando:  
```
python -m ensurepip --upgrade
```

### Instalar Flask/Flask-Login

En caso de que no se pueda inciar el contenido del repositorio porque flask/flask-login no está instalado, lo instalamos con el siguiente comando:
```
pip install flask
```
Para instalar flask-login lo hacemos con el siguiente comando:
```
pip install flask-login
```
### Instalar requests
En caso de que no se pueda inciar el contenido del repositorio porque requests no está instalado, lo instalamos con el siguiente comando:
```
pip install requests
```

### Iniciar el contenido del repositorio
Una vez clonado el contenido del repositorio, para iniciarlo es necesario correr Flask. Para esto escribimos en una terminal de nuestra computadora y dentro de la carpeta `sistema-soporte-web`:
```
python app.py
```
e ingresamos al enlace proporcionado.

---
## Estructura de directorios
```
└── sistema-soporte-web/
    ├── app.py
    ├── consultas_api.http
    ├── README.md
    ├── templates/
    │   ├── seleccionaraulas.html
    │   ├── registrarse.html
    │   ├── controlaula.html
    │   ├── iniciosesion.html
    │   ├── gestionar.html
    │   ├── index.html
    │   ├── agregarhardware.html
    │   ├── faq.html
    │   └── componentes/
    │       ├── nav.html
    │       ├── mostraraulas.html
    │       └── mostrarcompus.html
    ├── .git/
    └── static/
        ├── css/
        ├── img/
        ├── js/
        └── fonts/
```
* `sistema-soporte-web/` - Es la carpeta del repositorio que contiene todo el proyecto.
    * `app.py` - Es el archivo de Python por el cual se inicia la página usando Flask.
    * `consultas_api.http` - Es donde se encuentran todos los métodos y consultas GET, POST, PUT y DELETE que modifican directamente la base de datos.
    * `README.md` - Es este archivo.
    * `templates/` - Contiene los archivos .html (Hypertext Markup Language) de todas las pantallas de la página.
    * `.git/`- Contiene todos los archivos requeridos de git para realizar acciones con el repositorio y su contenido de forma remota.
    * `static/` - Contiene los contenidos "estáticos" de la página.
        * `css/` - Es la carpeta que contiene los archivos .css (Cascading Style Sheets) de todas las pantallas de la página.
        * `img/` - Es la carpeta que contiene todas las imágenes utilizadas en la página.
        * `js/` - Es la carpeta que contiene los archivos .js (JavaScript).
        * `fonts/`- Es la carpeta que contiene los archivos de las fuentes utilizadas en la página.

### Pantallas de la página

Inluyendo a `index.html` como la pantalla principal, estas son todas las páginas del proyecto.

* Inicio - `index.html` - Donde se encuentra información de la página y quiénes lo hicieron.
* Preguntas frecuentes - `faq.html` - Donde se responden dudas con respecto al funcionamiento de la página.
* Registro - `registro.html` - Donde un administrador puede registrar un nuevo usuario.
* Inicio de sesión - `iniciosesion.html` - Donde un usuario puede iniciar sesión tras haber sido registrado.
* Seleción de aulas - `seleccionaulas.html` -  Es un menú donde se muentran todas las aulas para hacer seguimiento de sus dispositivos. Añade botones de filtro para mostrar las aulas, los laboratorios, las preceptorías y la secretaría.
* Gestión de datos  - `gestionar.html` - Donde se pueden ver las tablas de usuarios, aulas, monitores y gabinetes y sus respectivos registros que pueden ser modificados o eliminados, además de poder añadir nuevos.
* Aula - `controlaula.html` - Es donde se ve el estado de un aula, las computadoras y donde se pueden realizar los reportes.

Otros (componentes):
* `mostraraulas.html` - Contiene el sector de la página `seleccionaulas.html` que incluye la información de cada aula.
* `mostrarcompus.html` - Contiene el setor de la página `controlaula.html` que inlcuye el ícono de la computadora.
* `nav.html` - Contiene la barra de navegación que se usa en las demás pantallas.

---

## Herramientas utilizadas

Para la creación de este proyecto se hizo uso de:
* [Bootstrap](https://getbootstrap.com/) - Utilizado para los componentes dinámicos de la página como formularios o acordeones.
* [Flask](https://flask.palletsprojects.com/en/stable/) - Para poder lanzar la página y así conectar la base de datos usando Python.
* [PythonAnywhere](https://www.pythonanywhere.com/) - Para tener la base de datos en un servidor, y poder editarla directamente de la página.

---

## Créditos

* **Leonardo Quiroga** - [leoquiroga1010](https://gitlab.com/leoquiroga1010) - Maintainer
* **Thiago Encina** -  [thiagoEncina](https://gitlab.com/ThiagoEncina) - Developer
* **Ko Vargas** - [ko.vargas](https://gitlab.com/ko.vargas) - Developer
* **Cristian Arias** - [cristutu](https://gitlab.com/cristutu) - QA
* **Valentina Zarate** - [valentina-zarate](https://gitlab.com/valentina-zarate) - QA