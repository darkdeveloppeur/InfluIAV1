// On importe le client Supabase unique depuis notre fichier
import supabaseClient from './auth/supabaseClient.js';

let initialCheckDone = false; 

// Fonction pour vérifier l'état et rediriger
function handleAuthStateRedirect(session) {
    // Évite les exécutions multiples rapides qui peuvent causer des boucles
    if (initialCheckDone) {
        // console.log("handleAuthStateRedirect: Vérification déjà faite récemment.");
        return; 
    }
    initialCheckDone = true; 

    const path = window.location.pathname;
    // Vérifie si l'URL se termine par l'une des pages publiques connues
    const isPublicPage = ['/', '/index.html', '/login.html', '/signup.html', '/pricing.html', '/forgot-password.html', '/reset-password.html'].some(p => path.endsWith(p));
    const isDashboard = path.endsWith('/dashboard.html');
    
    console.log(`Vérification Auth: Connecté=${!!session}, Page Publique=${isPublicPage}, Path=${path}`);

    if (session) { // Utilisateur connecté
        // Si connecté et sur une page publique (pas l'accueil), rediriger vers dashboard
        // On vérifie qu'on n'est pas déjà sur le dashboard pour éviter une boucle
        if (isPublicPage && !isDashboard && path !== '/' && !path.endsWith('/index.html')) {
             console.log('Connecté sur page publique -> dashboard');
             window.location.replace('dashboard.html'); // Utilise replace pour éviter l'historique inutile
        } else {
             console.log('Connecté, pas de redirection nécessaire.');
        }
    } else { // Utilisateur déconnecté
        // Si déconnecté et essaie d'accéder à une page privée, rediriger vers login
        if (!isPublicPage) {
            console.log('Déconnecté sur page privée -> login');
            window.location.replace('login.html'); // Utilise replace
        } else {
            console.log('Déconnecté, pas de redirection nécessaire.');
        }
    }
    // Permet une nouvelle vérification après un court délai
    setTimeout(() => { initialCheckDone = false; }, 500); 
}

// Listener global + Vérification initiale
if (supabaseClient) {
    // Écoute les changements d'état (connexion, déconnexion, token rafraîchi)
    supabaseClient.auth.onAuthStateChange((event, session) => {
        console.log(`Auth Event: ${event}`);
        // Gère l'état actuel (connecté ou déconnecté) et redirige si besoin
        handleAuthStateRedirect(session); 
    });

    // Vérifie l'état au premier chargement de la page
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
        console.log('Vérification session initiale au chargement.');
        handleAuthStateRedirect(session);
    }).catch(error => {
        console.error("Erreur getSession:", error);
        handleAuthStateRedirect(null); // En cas d'erreur, on considère l'utilisateur comme déconnecté
    });

} else {
     // Si Supabase n'a pas pu être initialisé (clés manquantes ?)
     console.warn('Supabase client non initialisé dans main.js. Authentification désactivée.');
     // Vérifie si l'accès à la page actuelle est autorisé sans connexion
     handleAuthStateRedirect(null); 
}


// --- Ton ancien code pour l'interface utilisateur (ne touche pas à Supabase) ---
document.addEventListener('DOMContentLoaded', function() {
    // Gestion de la navigation active
    const currentPage = window.location.pathname.split('/').pop() || 'index.html'; // index.html par défaut si URL est '/'
    const navLinks = document.querySelectorAll('.nav-links a, .sidebar-menu a');
    navLinks.forEach(link => {
        // Gère le cas où href est juste 'index.html' ou '/'
        const linkHref = link.getAttribute('href').split('/').pop() || 'index.html'; 
        if (linkHref === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active'); // Important pour enlever l'état actif des autres liens
        }
    });
    
    // Simulation des données du dashboard (pour l'affichage statique)
    if (document.querySelector('.stats-container')) {
        simulateDashboardData();
    }
    
    // Gestion des formulaires non liés à l'authentification
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        // Exclut explicitement les formulaires gérés par authUI.js
        if (!['login-form', 'signup-form', 'forgot-password-form'].includes(form.id)) {
            form.addEventListener('submit', function(e) {
                e.preventDefault(); // Empêche l'envoi normal
                alert('Fonctionnalité en cours de développement!'); // Message temporaire
            });
        }
    });
});

// Fonction pour simuler l'affichage des stats (à remplacer par des vraies données plus tard)
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

// Fonction pour afficher/cacher des sections (utilisé dans admin.html et profile.html)
function toggleSection(sectionId) { 
    const section = document.getElementById(sectionId);
    if (section) {
        // Simple bascule d'affichage
        section.style.display = section.style.display === 'none' ? 'block' : 'none';
    }
 }

// Fonction pour montrer un indicateur de chargement (peut être utile plus tard)
function showLoading() { 
    const loading = document.createElement('div');
    loading.className = 'loading';
    loading.innerHTML = 'Chargement...';
    // Styles basiques pour le rendre visible
    loading.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        background: var(--primary, #4361ee); color: white; padding: 1rem 2rem;
        border-radius: 6px; z-index: 9999; box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    `;
    document.body.appendChild(loading);
    
    // Disparaît après 1 seconde (simulation)
    setTimeout(() => {
        loading.remove();
    }, 1000);
 }
