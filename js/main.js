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
    // Pas d'alerte ici, on ne veut pas bloquer les pages publiques
}

// Fonction pour créer un profil (appelée après redirection Google)
async function createProfileIfNotExists(user) {
    if (!supabaseClient) return; 

    const { data, error: selectError } = await supabaseClient
        .from('profiles').select('id').eq('id', user.id).single();
    if (selectError && selectError.code !== 'PGRST116') { 
        console.error('Erreur vérif profil:', selectError); return; 
    }
    if (!data) {
        console.log('Profil absent. Création...');
        const userFullName = user.user_metadata?.full_name || 'Nouveau Créateur';
        const { error: insertError } = await supabaseClient
            .from('profiles').insert({ id: user.id, full_name: userFullName });
        if (insertError) console.error('Erreur création profil:', insertError);
        else console.log('Profil créé.');
    } else console.log('Profil déjà là.');
}


// Listener global qui gère la connexion ET la redirection Google
if (supabaseClient) {
    supabaseClient.auth.onAuthStateChange(async (event, session) => {
        // Détecte si l'utilisateur vient de se connecter (email ou Google)
        if (event === 'SIGNED_IN' && session?.user) {
            console.log('EVENT: SIGNED_IN détecté');
            await createProfileIfNotExists(session.user);
            
            // Redirige vers le dashboard SI on n'y est pas déjà
            // et si on est sur une page publique
            const path = window.location.pathname;
            const isOnPublicPage = ['/', '/index.html', '/login.html', '/signup.html', '/pricing.html', '/forgot-password.html'].includes(path);
            const isOnDashboard = path.includes('dashboard.html');

            if (!isOnDashboard && isOnPublicPage) {
                 console.log('Redirection vers dashboard...');
                 window.location.href = 'dashboard.html';
            } else {
                 console.log('Déjà connecté ou sur une page privée. Pas de redirection.');
            }
        } 
        // Gère la déconnexion (on ajoutera un bouton plus tard)
        else if (event === 'SIGNED_OUT') {
            console.log('EVENT: SIGNED_OUT détecté');
             // Redirige vers l'accueil si on est sur une page privée
            const path = window.location.pathname;
            const isOnPublicPage = ['/', '/index.html', '/login.html', '/signup.html', '/pricing.html', '/forgot-password.html'].includes(path);
            if (!isOnPublicPage) {
                console.log('Redirection vers accueil...');
                window.location.href = 'index.html';
            }
        }
    });

     // Vérifie l'état initial au chargement de la page (important pour Google)
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
        if (session) {
            console.log('Session active trouvée au chargement.');
            // Déclenche manuellement le listener pour gérer la redirection si nécessaire
             supabaseClient.auth.setSession(session); 
        } else {
            console.log('Pas de session active au chargement.');
            // Si pas de session et on est sur une page privée, rediriger vers login
             const path = window.location.pathname;
             const isOnPublicPage = ['/', '/index.html', '/login.html', '/signup.html', '/pricing.html', '/forgot-password.html'].includes(path);
             if (!isOnPublicPage && !path.includes('reset-password.html')) { // Sauf pour reset password
                 console.log('Accès non autorisé, redirection vers login...');
                 window.location.href = 'login.html';
             }
        }
    });

} else {
     console.warn('Supabase client non initialisé dans main.js. Authentification désactivée.');
     // Si pas de Supabase et on est sur une page privée, rediriger vers login
     const path = window.location.pathname;
     const isOnPublicPage = ['/', '/index.html', '/login.html', '/signup.html', '/pricing.html', '/forgot-password.html'].includes(path);
      if (!isOnPublicPage && !path.includes('reset-password.html')) {
          console.log('Accès non autorisé (Supabase absent), redirection vers login...');
          window.location.href = 'login.html';
      }
}


// --- Ton ancien code main.js (inchangé à partir d'ici) ---
document.addEventListener('DOMContentLoaded', function() {
    // Gestion nav active
    const currentPage = window.location.pathname.split('/').pop() || 'index.html'; // Default to index
    const navLinks = document.querySelectorAll('.nav-links a, .sidebar-menu a');
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href').split('/').pop() || 'index.html';
        if (linkHref === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active'); // Assure que seul le bon est actif
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
