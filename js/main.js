// PLACEHOLDERS POUR L'INJECTION
const SUPABASE_URL = '__SUPABASE_URL__';
const SUPABASE_KEY = '__SUPABASE_KEY__';

let supabaseClient;
let initialCheckDone = false; // Pour éviter les boucles

try {
    if (SUPABASE_URL.startsWith('__')) {
        throw new Error('Les clés Supabase n\'ont pas été injectées !');
    }
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
} catch (e) {
    console.error('Erreur Init Supabase (main.js):', e.message);
}

// Fonction pour créer un profil
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

// Fonction pour vérifier l'état et rediriger
async function handleAuthState(session) {
    if (initialCheckDone) return; // Si on a déjà vérifié, on arrête pour éviter les boucles
    initialCheckDone = true; // Marquer comme vérifié

    const path = window.location.pathname;
    const isPublicPage = ['/', '/index.html', '/login.html', '/signup.html', '/pricing.html', '/forgot-password.html', '/reset-password.html'].some(p => path.endsWith(p));
    const isDashboard = path.endsWith('/dashboard.html');

    if (session) { // Utilisateur connecté
        console.log('Utilisateur connecté détecté.');
        await createProfileIfNotExists(session.user);
        // Si connecté et sur une page publique (sauf l'accueil), rediriger vers dashboard
        if (isPublicPage && path !== '/' && path !== '/index.html') {
             console.log('Connecté sur page publique -> dashboard');
             window.location.replace('dashboard.html'); // Utilise replace pour éviter l'historique
        } else if (!isPublicPage && !isDashboard) {
             // Sécurité: Si connecté mais sur une URL privée invalide ? Rediriger vers dashboard.
             console.log('Connecté sur page privée inconnue -> dashboard');
             window.location.replace('dashboard.html');
        } else {
             console.log('Connecté, pas de redirection nécessaire.');
        }
    } else { // Utilisateur déconnecté
        console.log('Utilisateur déconnecté détecté.');
        // Si déconnecté et essaie d'accéder à une page privée, rediriger vers login
        if (!isPublicPage) {
            console.log('Déconnecté sur page privée -> login');
            window.location.replace('login.html'); // Utilise replace
        } else {
            console.log('Déconnecté, pas de redirection nécessaire.');
        }
    }
     // Réactiver les vérifications après un court délai pour gérer les changements d'état
    setTimeout(() => { initialCheckDone = false; }, 500);
}

// Listener global + Vérification initiale
if (supabaseClient) {
    // Écoute les changements (connexion, déconnexion)
    supabaseClient.auth.onAuthStateChange((event, session) => {
        console.log(`Auth Event: ${event}`);
        handleAuthState(session); // Gère l'état actuel
    });

    // Vérifie l'état au chargement de la page
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
        console.log('Vérification session initiale.');
        handleAuthState(session);
    }).catch(error => {
        console.error("Erreur getSession:", error);
        handleAuthState(null); // Traiter comme déconnecté en cas d'erreur
    });

} else {
     console.warn('Supabase client non initialisé. Authentification désactivée.');
     handleAuthState(null); // Traiter comme déconnecté
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

function simulateDashboardData() { 
    const stats = [
        { id: 'followers', value: '12.4K' }, { id: 'engagement', value: '4.2%' },
        { id: 'views', value: '156K' }, { id: 'revenue', value: '€245' }
    ];
    stats.forEach(stat => {
        const element = document.getElementById(stat.id);
        if (element) element.textContent = stat.value;
    });
 }
function toggleSection(sectionId) { 
    const section = document.getElementById(sectionId);
    if (section) section.style.display = section.style.display === 'none' ? 'block' : 'none';
 }
function showLoading() { /* ... */ }
