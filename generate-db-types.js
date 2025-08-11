const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting Supabase types generation...');

const command = 'npx supabase gen types typescript --project-id axgtvvcimqoyxbfvdrok --schema "public,common,mdt,system"';
const outputPath = path.join(__dirname, 'packages', 'db-types', 'src', 'index.ts');

exec(command, (error, stdout, stderr) => {
    if (error) {
        console.error(`Error executing command: ${error.message}`);
        console.error('Stderr:', stderr);
        return;
    }

    if (stderr) {
        console.warn('Stderr:', stderr); // Supabase CLI sometimes outputs warnings to stderr
    }

    console.log('Successfully generated types. Writing to file...');
    
    // Здесь происходит прямое сохранение в файл
    fs.writeFile(outputPath, stdout, 'utf8', (err) => {
        if (err) {
            console.error('Error writing to file:', err);
            return;
        }
        console.log(`Successfully wrote types to ${outputPath}`);
    });
});
