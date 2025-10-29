// PLACEHOLDERS POUR L'INJECTION
const SUPABASE_URL = '__SUPABASE_URL__';
const SUPABASE_KEY = '__SUPABASE_KEY__';

let supabaseClient;

try {
    if (SUPABASE_URL.startsWith('__')) {
        throw new Error('Les clés Supabase n\'ont pas été injectées !');
    }
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
} catch (e) {
    console.error('Erreur Init Supabase (main.js):', e.message);
}

// Listener TRES simplifié : redirige UNIQUEMENT si on vient de se connecter
if (supabaseClient) {
    supabaseClient.auth.onAuthStateChange((event, session) => {
        console.log(`Auth Event: ${event}`);
        // Si l'utilisateur vient de se connecter (via Google ou après redirection)
        if (event === 'SIGNED_IN' && session?.user) {
            const currentPath = window.location.pathname;
            // Redirige seulement si on n'est PAS déjà sur le dashboard
            if (!currentPath.endsWith('dashboard.html')) {
                console.log('SIGNED_IN détecté, redirection vers dashboard...');
                window.location.replace('dashboard.html'); // Utilise replace pour éviter l'historique
            }
        }
        // NOTE: On ne gère PAS la déconnexion ou la protection des pages ici
    });
} else {
     console.warn('Supabase client non initialisé dans main.js.');
}


// --- Ton ancien code main.js (inchangé à partir d'ici) ---
document.addEventListener('DOMContentLoaded', function() {
    // Gestion nav active
    const currentPage = window.location.pathname.split('/').pop() || 'index.html'; 
    const navLinks = document.querySelectorAll('.nav-links a, .sidebar-menu a');
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href').split('/').pop() || 'index.html';
        if (linkHref === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active'); 
        }
    });
    
    // Simu dashboard
    if (document.querySelector('.stats-container')) simulateDashboardData();
    
    // Formulaires (sauf auth)
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        if (!['login-form', 'signup-form', 'forgot-password-form'].includes(form.id)) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                alert('Fonctionnalité en dev!');
            });
        }
    });
});

function simulateDashboardData() { /* ... */ }
function toggleSection(sectionId) { /* ... */ }
function showLoading() { /* ... */ }
