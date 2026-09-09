// scroll.js Funcion del scroll ar darle click 
document.addEventListener('DOMContentLoaded', function() {
    console.log(' DOM cargado');
    
    const descubreMasBtn = document.getElementById('descubre-mas-btn');
    const aboutSection = document.getElementById('about-section');
    
    console.log('🔍 Buscando elementos:');
    console.log(' - Botón:', descubreMasBtn);
    console.log(' - Sección:', aboutSection);
    
    if (descubreMasBtn && aboutSection) {
        console.log('Elementos encontrados, agregando evento...');
        
        descubreMasBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Botón clickeado!');
            
            // Método 1: scrollIntoView
            aboutSection.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
            
            console.log('Scroll ejecutado');
        });
        
    } else {
        console.error('ERROR: No se encontraron los elementos');
        console.log('IDs buscados: descubre-mas-btn y about-section');
    }
});