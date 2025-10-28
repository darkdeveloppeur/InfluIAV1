// Ce script s'exécute sur le serveur de Render (pas dans le navigateur)

import fs from 'fs';
import path from 'path';

// Chemin vers ton fichier auth.js (on suppose qu'il est dans un dossier 'js')
const authFilePath = path.join(process.cwd(), 'js', 'auth.js');

// Lire le contenu du fichier
let authFileContent;
try {
    authFileContent = fs.readFileSync(authFilePath, 'utf8');
} catch (err) {
    console.error(`Erreur: Impossible de lire le fichier ${authFilePath}`, err);
    process.exit(1); // Arrêter le build si le fichier n'est pas trouvé
}

// Récupérer les variables d'environnement (que tu as mises sur Render)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Vérifier si les variables existent
if (!supabaseUrl || !supabaseKey) {
    console.error('Erreur: SUPABASE_URL ou SUPABASE_KEY ne sont pas définies dans l\'environnement Render.');
    process.exit(1);
}

// Remplacer les placeholders dans le fichier JS
authFileContent = authFileContent.replace('__SUPABASE_URL__', supabaseUrl);
authFileContent = authFileContent.replace('__SUPABASE_KEY__', supabaseKey);

// Écrire le fichier modifié
try {
    fs.writeFileSync(authFilePath, authFileContent, 'utf8');
    console.log('Clés Supabase injectées avec succès dans js/auth.js');
} catch (err) {
    console.error(`Erreur: Impossible d'écrire dans le fichier ${authFilePath}`, err);
    process.exit(1);
}
