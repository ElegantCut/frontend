const nav = document.querySelector("#nav");
const abrir = document.querySelector("#abrir");
const cerrar = document.querySelector("#cerrar");
const overlay = document.querySelector("#overlay");

// Abrir menú
abrir.addEventListener("click", () => {
    nav.classList.add("visible");
    overlay.classList.add("visible");
    document.body.style.overflow = "hidden";
});

// Cerrar menú
cerrar.addEventListener("click", () => {
    nav.classList.remove("visible");
    overlay.classList.remove("visible");
    document.body.style.overflow = "auto";
});

// Cerrar menú al hacer clic en el overlay
overlay.addEventListener("click", () => {
    nav.classList.remove("visible");
    overlay.classList.remove("visible");
    document.body.style.overflow = "auto";
});

// Cerrar menú con tecla Escape
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("visible")) {
        nav.classList.remove("visible");
        overlay.classList.remove("visible");
        document.body.style.overflow = "auto";
    }
});

// Cerrar menú al hacer clic en un enlace del menú
const menuLinks = document.querySelectorAll(".menu-nav-button");
menuLinks.forEach(link => {
    link.addEventListener("click", () => {
        nav.classList.remove("visible");
        overlay.classList.remove("visible");
        document.body.style.overflow = "auto";
    });
});