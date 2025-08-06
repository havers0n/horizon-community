// test-import.js
import('./src/core/lib/supabase.ts')
  .then(module => {
    console.log('Available exports:', Object.keys(module));
    console.log('commonClient exists:', 'commonClient' in module);
    console.log('supabase exists:', 'supabase' in module);
  })
  .catch(error => {
    console.error('Import error:', error.message);
  }); 