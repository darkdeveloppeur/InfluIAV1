// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', () => {

    // =================================================================
    // CES VALEURS SERONT REMPLACÉES PAR RENDER PENDANT LE BUILD
    const SUPABASE_URL = '__SUPABASE_URL__';
    const SUPABASE_KEY = '__SUPABASE_KEY__';
    // =================================================================

    // Initialiser le client Supabase
    let supabase;
    try {
        supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    } catch (e) {
        console.error('Erreur: Supabase n\'est pas chargé.', e);
        return; 
    }
    
    if (SUPABASE_URL.startsWith('__')) {
        console.error('ERREUR : Les clés Supabase n\'ont pas été injectées.');
        alert('Erreur critique de configuration. Contactez l\'administrateur.');
        return;
    }

    // Gérer l'inscription (signup.html)
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            const fullName = document.getElementById('signup-name').value; // On récupère le nom
            const submitButton = signupForm.querySelector('button[type="submit"]');
            submitButton.textContent = 'Création en cours...';
            submitButton.disabled = true;

            // Le Trigger SQL gère la création de profil.
            // Nous passons le nom dans 'options.data' pour que le Trigger puisse le lire.
            const { data, error } = await supabase.auth.signUp({
                email: email, 
                password: password,
                options: {
                    data: {
                        full_name: fullName // Le Trigger SQL va récupérer ça
                    }
                }
            });

            if (error) {
                alert(`Erreur lors de l'inscription : ${error.message}`);
                submitButton.textContent = 'Créer mon compte';
                submitButton.disabled = false;
            } else {
                // L'inscription a réussi, le Trigger a créé le profil.
                alert('Inscription réussie ! Redirection...');
                window.location.href = 'dashboard.html';
            }
        });
    }

    // Gérer la connexion (login.html)
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault(); 
            const email = loginForm.querySelector('input[type="email"]').value;
            const password = loginForm.querySelector('input[type="password"]').value;
            const submitButton = loginForm.querySelector('button[type="submit"]');
            submitButton.textContent = 'Connexion en cours...';
            submitButton.disabled = true;

            const { data, error } = await supabase.auth.signInWithPassword({
                email: email, password: password,
            });

            if (error) {
                alert(`Erreur lors de la connexion : ${error.message}`);
                submitButton.textContent = 'Se connecter';
                submitButton.disabled = false;
            } else {
                alert('Connexion réussie ! Redirection...');
                window.location.href = 'dashboard.html';
            }
        });
    }

    // Gérer le mot de passe oublié (forgot-password.html)
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('forgot-email').value;
            const submitButton = forgotPasswordForm.querySelector('button[type="submit"]');
            submitButton.textContent = 'Envoi en cours...';
            submitButton.disabled = true;

            const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: 'https://influiav1-1.onrender.com/reset-password.html'
            });

            if (error) {
                alert(`Erreur lors de l'envoi : ${error.message}`);
            } else {
                alert('Email de réinitialisation envoyé ! Vérifiez votre boîte de réception.');
            }
            submitButton.textContent = 'Envoyer le lien';
            submitButton.disabled = false;
        });
    }

    // =============================================
    // NOUVEAU BLOC : Connexion Google
    // =============================================
    async function signInWithGoogle() {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google'
            // Pas besoin de 'redirectTo', Supabase utilise l'URL de ton site
            // que tu as configurée dans Authentication -> URL Configuration
        });

        if (error) {
            alert('Erreur lors de la connexion Google : ' + error.message);
        }
        // Pas de redirection ici, Supabase gère le pop-up.
    }

    const googleLoginBtn = document.getElementById('google-login-btn');
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', signInWithGoogle);
    }
    
    const googleSignupBtn = document.getElementById('google-signup-btn');
    if (googleSignupBtn) {
        googleSignupBtn.addEventListener('click', signInWithGoogle);
    }
    
});
