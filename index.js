document.addEventListener('DOMContentLoaded', function() {
    const logo = document.getElementById("logo");
    const contenido = document.getElementById("contenido");

    setTimeout(() => {
        logo.classList.add("visible");
    }, 200);

    setTimeout(() => {
        contenido.scrollIntoView({ behavior: "smooth" });
    }, 3000);

    document.addEventListener('shown.bs.collapse', function(event) {
        event.target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    });
});

window.history.scrollRestoration = "manual";
window.scrollTo(0, 0);