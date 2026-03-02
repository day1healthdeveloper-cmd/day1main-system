const productId = '9bb038ad-dbf6-480c-a71e-adb93943cb1c'; // Executive Hospital Plan

fetch(`http://localhost:3001/api/admin/products/${productId}/policy-sections`)
  .then(res => res.json())
  .then(data => {
    console.log('API Response:');
    console.log('Sections keys:', Object.keys(data.sections || {}));
    console.log('Definitions in sections:', data.sections?.definitions?.length || 0);
    console.log('Definitions array:', data.definitions?.length || 0);
    
    if (data.sections?.definitions) {
      console.log('\nFirst 3 definitions from sections:');
      data.sections.definitions.slice(0, 3).forEach((def, idx) => {
        console.log(`${idx + 1}. ${def.title}: ${def.content.substring(0, 60)}...`);
      });
    }
  })
  .catch(err => console.error('Error:', err));
