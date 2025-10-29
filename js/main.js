// =============================================
// Gestion de l'authentification globale (Supabase)
// =============================================
const SUPABASE_URL = '__SUPABASE_URL__';
const SUPABASE_KEY = '__SUPABASE_KEY__';

let supabaseClient;
if (SUPABASE_URL !== '__SUPABASE_URL__') {
    try {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    } catch (e) {
        console.error('Erreur init Supabase dans main.js:', e);
    }
}

// Fonction pour créer un profil (nécessaire pour les connexions Google)
async function createProfileIfNotExists(user) {
    if (!supabaseClient) return; // Ne fait rien si Supabase n'est pas là

    // 1. On vérifie si le profil existe
    const { data, error: selectError } = await supabaseClient
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

    if (selectError && selectError.code !== 'PGRST116') {
        // PGRST116 = "le profil n'existe pas", ce qui est normal
        console.error('Erreur en vérifiant le profil:', selectError);
        return;
    }

    // 2. Si 'data' est null, le profil n'existe pas, on le crée
    if (!data) {
        const userFullName = user.user_metadata?.full_name || 'Nouveau Créateur';
        const { error: insertError } = await supabaseClient
            .from('profiles')
            .insert({ id: user.id, full_name: userFullName });

        if (insertError) {
            console.error('Erreur en créant le profil:', insertError);
        }
    }
}

// Listener global qui gère les redirections (ex: Google)
if (supabaseClient) {
    supabaseClient.auth.onAuthStateChange((event, session) => {
        // Si l'utilisateur vient de se connecter (ex: retour de Google)
        if (event === 'SIGNED_IN' && session?.user) {
            createProfileIfNotExists(session.user).then(() => {
                // On redirige vers le dashboard SEULEMENT si on est sur une page publique
                const path = window.location.pathname;
                if (path === '/' || path === '/index.html' || path === '/login.html' || path === '/signup.html' || path === '/pricing.html') {
                    window.location.href = 'dashboard.html';
                }
            });
        }
    });
}
// =============================================
// Fin du bloc Supabase
// =============================================


// Ton ancien code main.js commence ici
document.addEventListener('DOMContentLoaded', function() {
    // Gestion de la navigation active
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-links a, .sidebar-menu a');
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
    
    // Simulation de données pour le dashboard
    if (document.querySelector('.stats-container')) {
        simulateDashboardData();
    }
    
    // Gestion des formulaires
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        // NE PAS ATTACHER aux formulaires d'authentification
        if (form.id !== 'login-form' && form.id !== 'signup-form' && form.id !== 'forgot-password-form') {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                // Simulation de soumission
                alert('Fonctionnalité en cours de développement!');
            });
        }
    });
});

function simulateDashboardData() {
    // Simulation de données statistiques
    const stats = [
        { id: 'followers', value: '12.4K' },
        { id: 'engagement', value: '4.2%' },
        { id: 'views', value: '156K' },
        { id: 'revenue', value: '€245' }
    ];
    
    stats.forEach(stat => {
        const element = document.getElementById(stat.id);
        if (element) {
            element.textContent = stat.value;
        }
    });
}

// Fonction pour afficher/cacher les sections
function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.style.display = section.style.display === 'none' ? 'block' : 'none';
    }
}

// Simulation de chargement
function showLoading() {
    const loading = document.createElement('div');
    loading.className = 'loading';
    loading.innerHTML = 'Chargement...';
    loading.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--primary);
        color: white;
        padding: 1rem 2rem;
        border-radius: 6px;
        z-index: 9999;
    `;
    document.body.appendChild(loading);
    
    setTimeout(() => {
        loading.remove();
    }, 1000);
}
