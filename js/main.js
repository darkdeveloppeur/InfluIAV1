// On importe le client Supabase unique depuis notre fichier
import supabaseClient from './auth/supabaseClient.js';

// Fonction UNIQUE pour vérifier l'état et rediriger
function handleAuthRedirect(session) {
    const path = window.location.pathname;
    
    // Liste des pages accessibles au public (quand on est DÉCONNECTÉ)
    const publicPages = [
        '/', 
        '/index.html', 
        '/login.html', 
        '/signup.html', 
        '/pricing.html', 
        '/forgot-password.html', 
        '/reset-password.html'
    ];

    const isPublicPage = publicPages.includes(path);
    const isLoginPage = path.endsWith('/login.html');
    const isDashboardPage = path.endsWith('/dashboard.html');

    console.log(`(main.js) Vérification Auth: Connecté=${!!session}, Page Publique=${isPublicPage}, Path=${path}`);

    if (session) {
        // --- UTILISATEUR CONNECTÉ ---
        
        // S'il est connecté et essaie de voir une page publique...
        // ...ET qu'il n'est PAS DÉJÀ sur le dashboard...
        if (isPublicPage && !isDashboardPage) {
            console.log('(main.js) Connecté sur page publique -> dashboard');
            // ...on le renvoie au dashboard.
            window.location.replace('dashboard.html');
        }
        
    } else {
        // --- UTILISATEUR DÉCONNECTÉ ---
        
        // S'il est déconnecté et essaie de voir une page privée...
        // ...ET qu'il n'est PAS DÉJÀ sur la page de login...
        if (!isPublicPage && !isLoginPage) {
            console.log('(main.js) Déconnecté sur page privée -> login');
            // ...on le renvoie au login.
            window.location.replace('login.html');
        }
    }
}

// --- Point d'entrée de la sécurité ---
if (supabaseClient) {
    
    // 1. Écoute les changements (connexion, déconnexion)
    supabaseClient.auth.onAuthStateChange((event, session) => {
        console.log(`(main.js) Auth Event: ${event}`);
        
        // Si l'événement est une connexion ou une déconnexion,
        // on gère la redirection.
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
            handleAuthRedirect(session);
        }
    });

    // 2. Vérifie la session au premier chargement de la page
    supabaseClient.auth.getSession().then(({ data: { session }, error }) => {
        if (error) {
            console.error("(main.js) Erreur getSession:", error);
            handleAuthRedirect(null); // En cas d'erreur, on considère déconnecté
        } else {
            console.log('(main.js) Vérification session initiale au chargement.');
            handleAuthRedirect(session);
        }
    }).catch(error => {
        // Gère les erreurs de promesse (au cas où)
        console.error("(main.js) Erreur promesse getSession:", error);
        handleAuthRedirect(null);
    });

} else {
     console.warn('(main.js) Supabase client non initialisé. Authentification désactivée.');
     // Traite comme déconnecté si Supabase plante
     handleAuthRedirect(null); 
}

// --- Ton ancien code pour l'interface utilisateur (ne touche pas à Supabase) ---
document.addEventListener('DOMContentLoaded', function() {
    // Gestion de la navigation active
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
    
    // Simulation des données du dashboard (pour l'affichage statique)
    if (document.querySelector('.stats-container')) {
        simulateDashboardData();
    }
    
    // Gestion des formulaires non liés à l'authentification
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        if (!['login-form', 'signup-form', 'forgot-password-form'].includes(form.id)) {
            form.addEventListener('submit', function(e) {
                e.preventDefault(); 
                alert('Fonctionnalité en cours de développement!');
            });
        }
    });
});

// ... (le reste des fonctions simulateDashboardData, toggleSection, showLoading reste identique) ...
function simulateDashboardData() { 
    const stats = [
        { id: 'followers', value: '12.4K' }, { id: 'engagement', value: '4.2%' },
        { id: 'views', value: '156K' }, { id: 'revenue', value: '€245' }
    ];
    stats.forEach(stat => {
        const element = document.getElementById(stat.id);
        if (element) {
            element.textContent = stat.value;
        }
    });
 }

function toggleSection(sectionId) { 
    const section = document.getElementById(sectionId);
    if (section) {
        section.style.display = section.style.display === 'none' ? 'block : 'none';
    }
 }

function showLoading() { 
    const loading = document.createElement('div');
    loading.className = 'loading';
    loading.innerHTML = 'Chargement...';
    loading.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        background: var(--primary, #4361ee); color: white; padding: 1rem 2rem;
        border-radius: 6px; z-index: 9999; box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    `;
    document.body.appendChild(loading);
    
    setTimeout(() => {
        loading.remove();
    }, 1000);
 }
