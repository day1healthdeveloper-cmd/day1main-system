const productId = '499e3163-0df1-48fa-b403-a1b3850f9acd'; // Value Plus Plan

fetch(`http://localhost:3001/api/admin/products/${productId}/policy-sections?nocache=${Date.now()}`)
  .then(res => res.json())
  .then(data => {
    console.log('API Response:');
    console.log('Definitions count:', data.sections?.definitions?.length || 0);
    
    if (data.sections?.definitions) {
      console.log('\nLast 10 definitions from API:');
      data.sections.definitions.slice(-10).forEach((def, idx) => {
        console.log(`${data.sections.definitions.length - 10 + idx + 1}. ${def.title}`);
      });
    }
  })
  .catch(err => console.error('Error:', err));
