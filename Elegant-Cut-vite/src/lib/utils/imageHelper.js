//Esta sirve para llamar solo la variable y no poner todo el link
export const getCloudinaryUrl = (publicId) => {
    if (!publicId) return '';
    return `https://res.cloudinary.com/dbuldg4dt/image/upload/c_fill,g_face,h_400,w_400/${publicId}`;
};

export const getCloudinaryBannerUrl = (publicId) => {
    if (!publicId) return '';
    return `https://res.cloudinary.com/dbuldg4dt/image/upload/f_auto,q_auto,c_fill,w_1200,h_400/${publicId}`;
};

export const getCloudinaryHomeUrl = (publicId) => {
    if (!publicId) return '';
    return `https://res.cloudinary.com/dbuldg4dt/image/upload/f_auto,q_auto,c_fill/${publicId}`;
};