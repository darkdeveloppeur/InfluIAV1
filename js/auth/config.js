// On importe depuis le fichier 'env.js' qui sera créé par Render
import { SUPABASE_URL, SUPABASE_KEY } from './env.js';

let supabaseClient = null;

try {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
        throw new Error('Les clés Supabase (URL ou KEY) sont manquantes dans js/auth/env.js');
    }
    // 'supabase' vient du CDN global
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('Client Supabase initialisé.');
} catch (error) {
    console.error('Erreur initialisation Supabase:', error.message);
    // On pourrait afficher un message à l'utilisateur ici
}

export default supabaseClient;
