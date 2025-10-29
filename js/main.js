// PLACEHOLDERS POUR L'INJECTION
const SUPABASE_URL = '__SUPABASE_URL__';
const SUPABASE_KEY = '__SUPABASE_KEY__';

let supabaseClient;
let initialCheckDone = false; 

try {
    if (SUPABASE_URL.startsWith('__')) {
        throw new Error('Les clés Supabase n\'ont pas été injectées !');
    }
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
} catch (e) {
    console.error('Erreur Init Supabase (main.js):', e.message);
}

// Fonction pour vérifier l'état et rediriger (SIMPLIFIÉE)
function handleAuthStateRedirect(session) {
    if (initialCheckDone) return; 
    initialCheckDone = true; 

    const path = window.location.pathname;
    // Ajout de .html pour correspondre aux vrais fichiers servis
    const isPublicPage = ['/', '/index.html', '/login.html', '/signup.html', '/pricing.html', '/forgot-password.html', '/reset-password.html'].some(p => path.endsWith(p));
    const isDashboard = path.endsWith('/dashboard.html');
    
    console.log(`Vérification Auth: Connecté=${!!session}, Page Publique=${isPublicPage}, Path=${path}`);

    if (session) { // Utilisateur connecté
        // Si connecté et sur une page publique (sauf l'accueil), rediriger vers dashboard
        if (isPublicPage && path !== '/' && !path.endsWith('/index.html') ) {
             console.log('Connecté sur page publique -> dashboard');
             window.location.replace('dashboard.html'); 
        } else {
             console.log('Connecté, pas de redirection.');
        }
    } else { // Utilisateur déconnecté
        // Si déconnecté et essaie d'accéder à une page privée, rediriger vers login
        if (!isPublicPage) {
            console.log('Déconnecté sur page privée -> login');
            window.location.replace('login.html'); 
        } else {
            console.log('Déconnecté, pas de redirection.');
        }
    }
    setTimeout(() => { initialCheckDone = false; }, 500); // Réactive la vérification après un délai
}

// Listener global + Vérification initiale
if (supabaseClient) {
    supabaseClient.auth.onAuthStateChange((event, session) => {
        console.log(`Auth Event: ${event}`);
        handleAuthStateRedirect(session); 
    });

    supabaseClient.auth.getSession().then(({ data: { session } }) => {
        console.log('Vérification session initiale.');
        handleAuthStateRedirect(session);
    }).catch(error => {
        console.error("Erreur getSession:", error);
        handleAuthStateRedirect(null); 
    });

} else {
     console.warn('Supabase client non initialisé. Authentification désactivée.');
     handleAuthStateRedirect(null); 
}


// --- Ton ancien code main.js (inchangé à partir d'ici) ---
document.addEventListener('DOMContentLoaded', function() { /* ... */ });
function simulateDashboardData() { /* ... */ }
function toggleSection(sectionId) { /* ... */ }
function showLoading() { /* ... */ }
