// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', () => {

    // IMPORTANT : Remplace ces valeurs par tes propres clés Supabase !
    // Tu les trouves dans Paramètres > API dans ton projet Supabase
    const SUPABASE_URL = 'TON_URL_SUPABASE'; 
    const SUPABASE_KEY = 'TA_CLE_PUBLIQUE_ANON';

    // Initialiser le client Supabase
    // (Cette variable 'supabase' est chargée par le script CDN que nous ajoutons au HTML)
    let supabase;
    try {
        supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    } catch (e) {
        console.error('Erreur: Supabase n\'est pas chargé. As-tu ajouté le script CDN au HTML ?', e);
        return; 
    }

    // Gérer l'inscription (signup.html)
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Empêcher le rechargement de la page
            
            const email = signupForm.querySelector('input[type="email"]').value;
            const password = signupForm.querySelector('input[type="password"]').value;
            // On pourrait aussi récupérer le nom complet, mais gardons simple pour l'instant

            // Afficher un message de chargement (optionnel)
            const submitButton = signupForm.querySelector('button[type="submit"]');
            submitButton.textContent = 'Création en cours...';
            submitButton.disabled = true;

            // Inscrire l'utilisateur avec Supabase
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
            });

            if (error) {
                // S'il y a une erreur
                alert(`Erreur lors de l'inscription : ${error.message}`);
                submitButton.textContent = 'Créer mon compte';
                submitButton.disabled = false;
            } else {
                // Si c'est un succès
                alert('Inscription réussie ! Veuillez vérifier vos e-mails pour confirmer votre compte.');
                // Rediriger vers la page de connexion ou le dashboard
                window.location.href = 'login.html'; 
            }
        });
    }

    // Gérer la connexion (login.html)
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Empêcher le rechargement de la page

            const email = loginForm.querySelector('input[type="email"]').value;
            const password = loginForm.querySelector('input[type="password"]').value;

            const submitButton = loginForm.querySelector('button[type="submit"]');
            submitButton.textContent = 'Connexion en cours...';
            submitButton.disabled = true;

            // Connecter l'utilisateur avec Supabase
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) {
                // S'il y a une erreur
                alert(`Erreur lors de la connexion : ${error.message}`);
                submitButton.textContent = 'Se connecter';
                submitButton.disabled = false;
            } else {
                // Si c'est un succès
                alert('Connexion réussie ! Redirection vers le tableau de bord...');
                // Rediriger vers le dashboard
                window.location.href = 'dashboard.html';
            }
        });
    }
});
