export const getCloudinaryUrl = (publicId) => {
    if (!publicId) return '';
    const cleanId = publicId.trim();
    // Si ya es un enlace completo, lo limpiamos de cualquier desenfoque accidental en la BD
    if (cleanId.startsWith('http') || cleanId.startsWith('/')) {
        return cleanId.replace(/e_blur:\d+,?/g, '').replace(/blur/g, '');
    }
    return `https://res.cloudinary.com/dbuldg4dt/image/upload/f_auto,q_auto/${cleanId}`;
};

// Función para banners (ajustada a formato panorámico)
export const getCloudinaryBannerUrl = (publicId) => {
    if (!publicId) return '';
    if (publicId.startsWith('http') || publicId.startsWith('/')) return publicId;
    return `https://res.cloudinary.com/dbuldg4dt/image/upload/f_auto,q_auto,c_fill,w_1200,h_400/${publicId}`;
};

// Función para imágenes generales del home
export const getCloudinaryHomeUrl = (publicId) => {
    if (!publicId) return '';
    if (publicId.startsWith('http') || publicId.startsWith('/')) return publicId;
    return `https://res.cloudinary.com/dbuldg4dt/image/upload/f_auto,q_auto,c_fill/${publicId}`;
};

// Función específica para servicios (mantiene proporción)
export const getCloudinaryServiceUrl = (publicId) => {
    if (!publicId) return '';
    if (publicId.startsWith('http') || publicId.startsWith('/')) return publicId;
    return `https://res.cloudinary.com/dbuldg4dt/image/upload/f_auto,q_auto,c_fill/${publicId}`;
};
