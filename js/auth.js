// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', () => {

    const SUPABASE_URL = '__SUPABASE_URL__';
    const SUPABASE_KEY = '__SUPABASE_KEY__';

    let supabaseClient;
    try {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    } catch (e) {
        console.error('Erreur: Supabase n\'est pas chargé.', e);
        return; 
    }
    
    if (SUPABASE_URL.startsWith('__')) {
        console.error('ERREUR : Les clés Supabase n\'ont pas été injectées.');
        alert('Erreur critique de configuration. Contactez l\'administrateur.');
        return;
    }

    // Fonction pour créer un profil (utilisée par l'inscription email)
    async function createProfileForEmailUser(user, fullName) {
        const { data, error } = await supabaseClient
            .from('profiles')
            .insert({ id: user.id, full_name: fullName });
        if (error) {
            console.error('Erreur en créant le profil:', error);
        }
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

            const { data, error } = await supabaseClient.auth.signUp({
                email: email, 
                password: password
                // Note: On n'envoie plus 'options: data' car on le fait manuellement
            });

            if (error) {
                alert(`Erreur lors de l'inscription : ${error.message}`);
                submitButton.textContent = 'Créer mon compte';
                submitButton.disabled = false;
            } else if (data.user) {
                // L'inscription a réussi. On crée le profil manuellement.
                await createProfileForEmailUser(data.user, fullName);
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

            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email: email, password: password,
            });

            if (error) {
                alert(`Erreur lors de la connexion : ${error.message}`);
                submitButton.textContent = 'Se connecter';
                submitButton.disabled = false;
            } else if (data.user) {
                // Connexion réussie.
                // Pas besoin de createProfile, le listener dans main.js s'en charge.
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

            const { data, error } = await supabaseClient.auth.resetPasswordForEmail(email, {
                redirectTo: 'https://influiav1.onrender.com/reset-password.html'
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

    // Connexion Google
    async function signInWithGoogle() {
        const { data, error } = await supabaseClient.auth.signInWithOAuth({
            provider: 'google'
        });
        if (error) {
            alert('Erreur lors de la connexion Google : ' + error.message);
        }
    }

    const googleLoginBtn = document.getElementById('google-login-btn');
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', signInWithGoogle);
    }
    
    const googleSignupBtn = document.getElementById('google-signup-btn');
    if (googleSignupBtn) {
        googleSignupBtn.addEventListener('click', signInWithGoogle);
    }

    // LE LISTENER onAuthStateChange A ÉTÉ SUPPRIMÉ D'ICI
    
});
