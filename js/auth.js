// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', () => {

    const SUPABASE_URL = '__SUPABASE_URL__';
    const SUPABASE_KEY = '__SUPABASE_KEY__';

    let supabaseClient;
    try {
        // 'supabase' vient du script CDN
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    } catch (e) {
        console.error('Erreur: Supabase n\'est pas chargé.', e);
        // Si Supabase n'est pas chargé (ex: CDN bloqué), on ne peut rien faire
        return; 
    }
    
    // Vérifier si les clés ont été injectées
    if (SUPABASE_URL.startsWith('__')) {
        console.error('ERREUR : Les clés Supabase n\'ont pas été injectées.');
        alert('Erreur critique de configuration. Contactez l\'administrateur.');
        // On empêche les formulaires de fonctionner si les clés manquent
        return;
    }

    // Fonction pour créer un profil (utilisée par l'inscription email/Google)
    // Elle est appelée depuis auth.js (pour email) et main.js (pour Google)
    async function createProfileIfNotExists(user, fullNameFromSignup = null) {
        // Vérifier si le profil existe déjà
        const { data, error: selectError } = await supabaseClient
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .single();

        if (selectError && selectError.code !== 'PGRST116') { // PGRST116 = "not found", c'est normal
            console.error('Erreur en vérifiant le profil:', selectError);
            return; 
        }

        // Si le profil n'existe pas ('data' est null), on le crée
        if (!data) {
            console.log('Profil non trouvé. Création du profil...');
            
            // Choisir le nom : celui du formulaire OU celui de Google OU un nom par défaut
            const userFullName = fullNameFromSignup || user.user_metadata?.full_name || 'Nouveau Créateur';

            const { error: insertError } = await supabaseClient
                .from('profiles')
                .insert({ 
                    id: user.id, 
                    full_name: userFullName 
                });

            if (insertError) {
                console.error('Erreur en créant le profil:', insertError);
            } else {
                console.log('Profil créé avec succès.');
            }
        } else {
            console.log('Le profil existe déjà.');
        }
    }


    // Gérer l'inscription par Email (signup.html)
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

            // Inscrire l'utilisateur
            const { data, error } = await supabaseClient.auth.signUp({
                email: email, 
                password: password
            });

            if (error) {
                alert(`Erreur lors de l'inscription : ${error.message}`);
                submitButton.textContent = 'Créer mon compte';
                submitButton.disabled = false;
            } else if (data.user) {
                // Inscription réussie. Créer le profil manuellement.
                await createProfileIfNotExists(data.user, fullName); // On passe le nom du formulaire
                alert('Inscription réussie ! Redirection...');
                window.location.href = 'dashboard.html'; // Redirection directe
            } else {
                 // Cas rare où l'inscription réussit mais data.user est null
                 alert('Un problème est survenu. Veuillez réessayer.');
                 submitButton.textContent = 'Créer mon compte';
                 submitButton.disabled = false;
            }
        });
    }

    // Gérer la connexion par Email (login.html)
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
                // La redirection est gérée par le listener dans main.js
                alert('Connexion réussie ! Redirection...');
                window.location.href = 'dashboard.html'; // Redirection directe
            } else {
                alert('Un problème est survenu. Veuillez réessayer.');
                submitButton.textContent = 'Se connecter';
                submitButton.disabled = false;
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

    // Connexion Google (fonction appelée par les boutons)
    async function signInWithGoogle() {
        const { data, error } = await supabaseClient.auth.signInWithOAuth({
            provider: 'google'
            // La redirection est gérée par Supabase et le listener dans main.js
        });
        if (error) {
            alert('Erreur lors de la connexion Google : ' + error.message);
        }
    }

    // Attacher la fonction au bouton Google de la page de connexion
    const googleLoginBtn = document.getElementById('google-login-btn');
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', signInWithGoogle);
    }
    
    // Attacher la fonction au bouton Google de la page d'inscription
    const googleSignupBtn = document.getElementById('google-signup-btn');
    if (googleSignupBtn) {
        googleSignupBtn.addEventListener('click', signInWithGoogle);
    }
    
}); // FIN du document.addEventListener('DOMContentLoaded', ...)
