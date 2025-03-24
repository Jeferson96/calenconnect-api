// Este archivo configura el entorno global de Jest

// Aumentamos el timeout para pruebas que requieren más tiempo (como operaciones de DB)
jest.setTimeout(30000);

// Silenciar la salida de console.log durante las pruebas
// Descomenta esto si prefieres no ver logs durante las pruebas
// global.console.log = jest.fn();

// Configuración para la limpieza después de cada prueba si lo necesitas
// afterEach(() => {
//   // Código para limpiar después de cada prueba
// }); 