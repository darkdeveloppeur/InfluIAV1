// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', () => {

    // PLACEHOLDERS POUR L'INJECTION
    const SUPABASE_URL = '__SUPABASE_URL__';
    const SUPABASE_KEY = '__SUPABASE_KEY__';

    let supabaseClient;
    try {
        if (SUPABASE_URL.startsWith('__')) {
            throw new Error('Les clés Supabase n\'ont pas été injectées !');
        }
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    } catch (e) {
        console.error('Erreur Init Supabase (auth.js):', e.message);
        alert('Erreur critique de configuration. Impossible de contacter le serveur d\'authentification.');
        // Empêcher les formulaires de fonctionner
        document.querySelectorAll('#signup-form button[type=submit], #login-form button[type=submit], #google-login-btn, #google-signup-btn, #forgot-password-form button[type=submit]')
            .forEach(btn => btn.disabled = true);
        return; 
    }

    // --- Le reste du code auth.js reste identique ---

    // Fonction pour créer un profil
    async function createProfileIfNotExists(user, fullNameFromSignup = null) {
        const { data, error: selectError } = await supabaseClient
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .single();
        if (selectError && selectError.code !== 'PGRST116') { 
            console.error('Erreur en vérifiant le profil:', selectError); return; 
        }
        if (!data) {
            console.log('Profil non trouvé. Création...');
            const userFullName = fullNameFromSignup || user.user_metadata?.full_name || 'Nouveau Créateur';
            const { error: insertError } = await supabaseClient
                .from('profiles').insert({ id: user.id, full_name: userFullName });
            if (insertError) console.error('Erreur en créant le profil:', insertError);
            else console.log('Profil créé.');
        } else console.log('Profil existe déjà.');
    }

    // Gérer l'inscription par Email
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            const fullName = document.getElementById('signup-name').value;
            const submitButton = signupForm.querySelector('button[type="submit"]');
            submitButton.textContent = 'Création...'; submitButton.disabled = true;

            const { data, error } = await supabaseClient.auth.signUp({ email, password });

            if (error) {
                alert(`Erreur inscription : ${error.message}`);
                submitButton.textContent = 'Créer'; submitButton.disabled = false;
            } else if (data.user) {
                await createProfileIfNotExists(data.user, fullName);
                alert('Inscription réussie !');
                window.location.href = 'dashboard.html';
            } else {
                 alert('Problème inconnu. Réessayez.');
                 submitButton.textContent = 'Créer'; submitButton.disabled = false;
            }
        });
    }

    // Gérer la connexion par Email
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault(); 
            const email = loginForm.querySelector('input[type="email"]').value;
            const password = loginForm.querySelector('input[type="password"]').value;
            const submitButton = loginForm.querySelector('button[type="submit"]');
            submitButton.textContent = 'Connexion...'; submitButton.disabled = true;

            const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

            if (error) {
                alert(`Erreur connexion : ${error.message}`);
                submitButton.textContent = 'Connecter'; submitButton.disabled = false;
            } else if (data.user) {
                alert('Connexion réussie !');
                window.location.href = 'dashboard.html';
            } else {
                alert('Problème inconnu. Réessayez.');
                submitButton.textContent = 'Connecter'; submitButton.disabled = false;
            }
        });
    }

    // Gérer le mot de passe oublié
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('forgot-email').value;
            const submitButton = forgotPasswordForm.querySelector('button[type="submit"]');
            submitButton.textContent = 'Envoi...'; submitButton.disabled = true;

            const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password.html` // Utilise l'origine actuelle
            });

            if (error) alert(`Erreur envoi : ${error.message}`);
            else alert('Email envoyé ! Vérifiez votre boîte.');
            submitButton.textContent = 'Envoyer'; submitButton.disabled = false;
        });
    }

    // Connexion Google (fonction)
    async function signInWithGoogle() {
        const { error } = await supabaseClient.auth.signInWithOAuth({ provider: 'google' });
        if (error) alert('Erreur Google : ' + error.message);
    }

    // Attacher aux boutons Google
    const googleLoginBtn = document.getElementById('google-login-btn');
    if (googleLoginBtn) googleLoginBtn.addEventListener('click', signInWithGoogle);
    const googleSignupBtn = document.getElementById('google-signup-btn');
    if (googleSignupBtn) googleSignupBtn.addEventListener('click', signInWithGoogle);
    
});
