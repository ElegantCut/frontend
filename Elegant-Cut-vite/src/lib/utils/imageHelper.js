// Función para obtener URL de Cloudinary para fotos de perfil (con recorte facial)
export const getCloudinaryUrl = (publicId) => {
    if (!publicId) return '';
    return `https://res.cloudinary.com/dbuldg4dt/image/upload/c_fill,g_face,h_400,w_400/${publicId}`;
};

// Función para banners (ajustada a formato panorámico)
export const getCloudinaryBannerUrl = (publicId) => {
    if (!publicId) return '';
    return `https://res.cloudinary.com/dbuldg4dt/image/upload/f_auto,q_auto,c_fill,w_1200,h_400/${publicId}`;
};

// Función para imágenes generales del home
export const getCloudinaryHomeUrl = (publicId) => {
    if (!publicId) return '';
    return `https://res.cloudinary.com/dbuldg4dt/image/upload/f_auto,q_auto,c_fill/${publicId}`;
};

// Función específica para servicios (mantiene proporción)
export const getCloudinaryServiceUrl = (publicId) => {
    if (!publicId) return '';
    return `https://res.cloudinary.com/dbuldg4dt/image/upload/f_auto,q_auto,c_fill/${publicId}`;
};
