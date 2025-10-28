// Fonctions utilitaires
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
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            // Simulation de soumission
            alert('Fonctionnalité en cours de développement!');
        });
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
