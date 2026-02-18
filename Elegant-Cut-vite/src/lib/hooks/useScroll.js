// src/hooks/useScroll.js
import { useEffect } from 'react';

export const useScroll = () => {
  useEffect(() => {
    console.log('🔄 Hook useScroll activado');
    
    const descubreMasBtn = document.getElementById('descubre-mas-btn');
    const aboutSection = document.getElementById('about-section');
    
    console.log('🔍 Buscando elementos:');
    console.log(' - Botón:', descubreMasBtn);
    console.log(' - Sección:', aboutSection);
    
    if (descubreMasBtn && aboutSection) {
      console.log('✅ Elementos encontrados, agregando evento...');
      
      const handleClick = (e) => {
        e.preventDefault();
        console.log('🎯 Botón clickeado!');
        
        // Scroll suave
        aboutSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
        
        console.log('📜 Scroll ejecutado');
      };
      
      descubreMasBtn.addEventListener('click', handleClick);
      
      // Limpieza
      return () => {
        descubreMasBtn.removeEventListener('click', handleClick);
        console.log('🧹 Event listener removido');
      };
      
    } else {
      console.error('❌ ERROR: No se encontraron los elementos');
    }
  }, []);
};