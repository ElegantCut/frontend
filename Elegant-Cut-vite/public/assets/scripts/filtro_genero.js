// Filtro Dama/Caballero
document.addEventListener('DOMContentLoaded', function() {
    const genderButtons = document.querySelectorAll('.gender-btn');
    const categoriaDama = document.getElementById('categoriaDama');
    const categoriaCaballero = document.getElementById('categoriaCaballero');
    const catalogDama = document.getElementById('catalogDama');
    const catalogCaballero = document.getElementById('catalogCaballero');

    // Función para cambiar entre vistas
    function switchGender(gender) {
        // Remover active de todos los botones
        genderButtons.forEach(btn => btn.classList.remove('active'));
        
        // Activar el botón seleccionado
        document.querySelector(`[data-gender="${gender}"]`).classList.add('active');
        
        // Cambiar visibilidad de las categorías
        if (gender === 'dama') {
            categoriaDama.style.display = 'flex';
            categoriaCaballero.style.display = 'none';
            catalogDama.style.display = 'grid';
            catalogCaballero.style.display = 'none';
            
            // Actualizar título de la página
            document.title = 'Catálogo Dama - ElegantCut';
            
            // Actualizar URL sin recargar
            history.pushState({}, '', '../page/servicios_dama.html');
        } else {
            categoriaDama.style.display = 'none';
            categoriaCaballero.style.display = 'flex';
            catalogDama.style.display = 'none';
            catalogCaballero.style.display = 'grid';
            
            // Actualizar título de la página
            document.title = 'Catálogo Caballero - ElegantCut';
            
            // Actualizar URL sin recargar
            history.pushState({}, '', '../page/servicios_caballero.html');
        }
        
        // Reiniciar categorías activas
        const activeButtons = document.querySelectorAll('.category-menu button.active');
        activeButtons.forEach(btn => btn.classList.remove('active'));
        
        // Activar primera categoría de cada género
        if (gender === 'dama') {
            categoriaDama.querySelector('button').classList.add('active');
        } else {
            categoriaCaballero.querySelector('button').classList.add('active');
        }
        
        // Filtrar productos por primera categoría
        filterProducts();
    }

    // Event listeners para los botones de género
    genderButtons.forEach(button => {
        button.addEventListener('click', function() {
            const gender = this.getAttribute('data-gender');
            switchGender(gender);
        });
    });

    // Filtrar productos por categoría
    function filterProducts() {
        const activeGender = document.querySelector('.gender-btn.active').getAttribute('data-gender');
        const activeCategory = document.querySelector(`#categoria${activeGender.charAt(0).toUpperCase() + activeGender.slice(1)} button.active`).getAttribute('data-category');
        
        const currentCatalog = activeGender === 'dama' ? catalogDama : catalogCaballero;
        const products = currentCatalog.querySelectorAll('.product-card');
        
        products.forEach(product => {
            if (product.getAttribute('data-category') === activeCategory) {
                product.style.display = 'block';
            } else {
                product.style.display = 'none';
            }
        });
    }

    // Event listeners para categorías de dama
    if (categoriaDama) {
        categoriaDama.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', function() {
                categoriaDama.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                filterProducts();
            });
        });
    }

    // Event listeners para categorías de caballero
    if (categoriaCaballero) {
        categoriaCaballero.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', function() {
                categoriaCaballero.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                filterProducts();
            });
        });
    }

    // Inicializar filtro
    filterProducts();
});