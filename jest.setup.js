// Este archivo configura el entorno global de Jest

// Aumentamos el timeout para pruebas que requieren más tiempo (como operaciones de DB)
jest.setTimeout(60000); // 60 segundos para todas las pruebas

// Silenciar la salida de console.log durante las pruebas
// Descomenta esto si prefieres no ver logs durante las pruebas
// global.console.log = jest.fn();

// Configuración para la limpieza después de cada prueba
afterEach(async () => {
  // Damos tiempo adicional para que las conexiones de la base de datos se cierren
  await new Promise(resolve => setTimeout(resolve, 500));
}); 