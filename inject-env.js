import fs from 'fs';
import path from 'path';

// On cible les fichiers originaux à la racine
const authFilePath = path.join(process.cwd(), 'js', 'auth.js');
const mainFilePath = path.join(process.cwd(), 'js', 'main.js');

// Récupérer les variables d'environnement
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('ERREUR CRITIQUE: SUPABASE_URL ou SUPABASE_KEY manquent dans Render Environment.');
    process.exit(1); // Arrête le build
}

// Fonction pour injecter les clés
function injectKeys(filePath) {
    try {
        console.log(`Tentative d'injection dans : ${filePath}`);
        let fileContent = fs.readFileSync(filePath, 'utf8');
        
        // Remplacer les placeholders (avec vérification)
        const originalContent = fileContent;
        fileContent = fileContent.replace(/__SUPABASE_URL__/g, supabaseUrl);
        fileContent = fileContent.replace(/__SUPABASE_KEY__/g, supabaseKey);

        if (fileContent === originalContent) {
             console.warn(`ATTENTION: Aucun placeholder trouvé ou remplacé dans ${filePath}. Le fichier contient-il __SUPABASE_URL__ ?`);
        } else if (fileContent.includes('__SUPABASE_URL__')) {
             console.error(`ERREUR: Remplacement incomplet dans ${filePath}. Vérifiez les placeholders.`);
             process.exit(1);
        }
        
        fs.writeFileSync(filePath, fileContent, 'utf8');
        console.log(`Clés injectées avec succès dans ${filePath}`);
    } catch (err) {
        console.error(`ERREUR: Impossible de lire/écrire dans ${filePath}`, err);
        process.exit(1); // Arrête le build
    }
}

// Injecter dans les deux fichiers originaux
injectKeys(authFilePath);
injectKeys(mainFilePath);
