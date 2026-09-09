 // Filtrado de barberos
        document.addEventListener('DOMContentLoaded', function() {
            const filterBtns = document.querySelectorAll('.filter-btn');
            const barberCards = document.querySelectorAll('.barber-card');

            filterBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    // Remover active de todos los botones
                    filterBtns.forEach(b => b.classList.remove('active'));
                    // Agregar active al botón clickeado
                    this.classList.add('active');

                    const filter = this.getAttribute('data-filter');

                    barberCards.forEach(card => {
                        if (filter === 'all' || card.getAttribute('data-category').includes(filter)) {
                            card.style.display = 'block';
                            setTimeout(() => {
                                card.style.opacity = '1';
                                card.style.transform = 'translateY(0)';
                            }, 50);
                        } else {
                            card.style.opacity = '0';
                            card.style.transform = 'translateY(20px)';
                            setTimeout(() => {
                                card.style.display = 'none';
                            }, 300);
                        }
                    });
                });
            });
        });