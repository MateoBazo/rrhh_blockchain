// Importar servicio
import { vacantesAPI } from '/src/api/vacantes.js';

// Test 1: Listar vacantes abiertas
console.log('🧪 Test: Listar vacantes abiertas');
const vacantes = await vacantesAPI.listar({ estado: 'abierta' });
console.log('✅ Respuesta:', vacantes.data);
console.log('Total vacantes:', vacantes.data.total);

// Mostrar títulos
vacantes.data.vacantes?.forEach((v, i) => {
  console.log(`${i+1}. ${v.titulo} (ID: ${v.id}) - ${v.ciudad}`);
});

// Test 2: Obtener detalle de la primera vacante
const primeraVacanteId = vacantes.data.vacantes[0]?.id;
if (primeraVacanteId) {
  console.log('\n🧪 Test: Obtener detalle vacante ID:', primeraVacanteId);
  const detalle = await vacantesAPI.obtenerPorId(primeraVacanteId);
  console.log('✅ Detalle:', detalle.data);
  console.log('Título:', detalle.data.titulo);
  console.log('Descripción:', detalle.data.descripcion);
  console.log('Empresa:', detalle.data.empresa?.nombre_comercial);
  console.log('Salario:', detalle.data.mostrar_salario 
    ? `${detalle.data.salario_min} - ${detalle.data.salario_max}` 
    : 'No mostrado');
}

// Test 3: Búsqueda por ciudad
console.log('\n🧪 Test: Buscar vacantes en Cochabamba');
const busqueda = await vacantesAPI.buscarAvanzado({ 
  ciudad: 'Cochabamba',
  limite: 5 
});
console.log('✅ Encontradas:', busqueda.data.total);
busqueda.data.vacantes?.forEach((v, i) => {
  console.log(`${i+1}. ${v.titulo} - ${v.modalidad}`);
});