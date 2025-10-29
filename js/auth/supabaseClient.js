import { SUPABASE_URL, SUPABASE_KEY } from './config.js';

let supabaseClient = null;

try {
    if (!SUPABASE_URL || SUPABASE_URL.startsWith('TON_')) {
        throw new Error('Les clés Supabase ne sont pas configurées dans js/auth/config.js');
    }
    // 'supabase' vient du CDN global
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('Client Supabase initialisé.');
} catch (error) {
    console.error('Erreur initialisation Supabase:', error.message);
    // On pourrait afficher un message à l'utilisateur ici
}

export default supabaseClient;
