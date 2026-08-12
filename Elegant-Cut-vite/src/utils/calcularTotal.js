export function calcularTotal(productos) {
    return productos.reduce(
        (total, producto) => total + producto.precio * producto.cantidad,
        0
    );
}