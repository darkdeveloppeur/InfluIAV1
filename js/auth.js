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
    
    // Si les placeholders sont toujours là, c'est que le build a échoué
    if (SUPABASE_URL.startsWith('__')) {
        console.error('ERREUR : Les clés Supabase n\'ont pas été injectées. Le build a échoué.');
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
            const fullName = document.getElementById('signup-name').value;
            const submitButton = signupForm.querySelector('button[type="submit"]');
            submitButton.textContent = 'Création en cours...';
            submitButton.disabled = true;

            const { data, error } = await supabase.auth.signUp({
                email: email, password: password,
            });

            if (error) {
                alert(`Erreur lors de l'inscription : ${error.message}`);
                submitButton.textContent = 'Créer mon compte';
                submitButton.disabled = false;
            } else if (data.user) {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert([{ id: data.user.id, full_name: fullName }]);
                
                if (profileError) {
                     alert(`Erreur lors de la création du profil : ${profileError.message}`);
                }
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
});
