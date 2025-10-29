import fs from 'fs';
import path from 'path';

// Chemins vers les DEUX fichiers
const authFilePath = path.join(process.cwd(), 'js', 'auth.js');
const mainFilePath = path.join(process.cwd(), 'js', 'main.js');

// Récupérer les variables d'environnement
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Erreur: SUPABASE_URL ou SUPABASE_KEY ne sont pas définies dans l\'environnement Render.');
    process.exit(1);
}

// Fonction pour injecter les clés dans un fichier
function injectKeys(filePath) {
    try {
        let fileContent = fs.readFileSync(filePath, 'utf8');
        // Remplacer les placeholders
        fileContent = fileContent.replace(/__SUPABASE_URL__/g, supabaseUrl);
        fileContent = fileContent.replace(/__SUPABASE_KEY__/g, supabaseKey);
        
        fs.writeFileSync(filePath, fileContent, 'utf8');
        console.log(`Clés injectées avec succès dans ${filePath}`);
    } catch (err) {
        console.error(`Erreur: Impossible de lire/écrire dans ${filePath}`, err);
        process.exit(1); // Arrêter le build si ça échoue
    }
}

// Injecter dans les deux fichiers
injectKeys(authFilePath);
injectKeys(mainFilePath);
