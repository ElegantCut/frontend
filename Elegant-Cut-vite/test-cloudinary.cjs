const https = require('https');
const ids = ['Carrusel1_i2b3g9', 'Carrusel2_txzezq'];
const exts = ['.jpg', '.jpeg', '.png', '.webp', '', '.JPG', '.JPEG'];

function testUrl(id, ext) {
    const url = 'https://res.cloudinary.com/dbuldg4dt/image/upload/carrousel/' + id + ext;
    https.get(url, (res) => {
        if (res.statusCode === 200 || res.statusCode === 304) {
            console.log('SUCCESS: ' + url);
        } else {
            // console.log('FAIL: ' + url + ' (' + res.statusCode + ')');
        }
    }).on('error', () => {});
}

ids.forEach(id => exts.forEach(ext => testUrl(id, ext)));
