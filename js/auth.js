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

    // NOUVELLE FONCTION : Crée un profil s'il n'existe pas
    // C'est ce que le trigger faisait, mais en JS c'est plus sûr
    async function createProfileIfNotExists(user) {
        // 1. On vérifie d'abord si un profil existe
        const { data, error: selectError } = await supabaseClient
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .single(); // On ne veut qu'un seul résultat

        if (selectError && selectError.code !== 'PGRST116') {
            // PGRST116 = "le profil n'existe pas", ce qui est normal
            console.error('Erreur en vérifiant le profil:', selectError);
            return; // On arrête
        }

        // 2. Si 'data' est null, le profil n'existe pas, on le crée
        if (!data) {
            console.log('Profil non trouvé. Création du profil...');
            
            // On essaie de récupérer le nom depuis Google
            const userFullName = user.user_metadata?.full_name || 'Nouveau Créateur';

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


    // Gérer l'inscription (signup.html) - SANS TRIGGER
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
                password: password,
                // On passe le nom pour que notre fonction JS puisse le lire
                options: {
                    data: {
                        full_name: fullName 
                    }
                }
            });

            if (error) {
                alert(`Erreur lors de l'inscription : ${error.message}`);
                submitButton.textContent = 'Créer mon compte';
                submitButton.disabled = false;
            } else if (data.user) {
                // L'inscription a réussi. On crée le profil manuellement.
                await createProfileIfNotExists(data.user);
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
                // Connexion réussie. On vérifie/crée le profil au cas où.
                await createProfileIfNotExists(data.user);
                alert('Connexion réussie ! Redirection...');
                window.location.href = 'dashboard.html';
            }
        });
    }

    // Gérer le mot de passe oublié
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    if (forgotPasswordForm) {
        // ... (code inchangé) ...
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

    // GESTION DE LA REDIRECTION GOOGLE
    // C'est ce qui va créer le profil après le retour de Google
    supabaseClient.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
            console.log('Utilisateur connecté après redirection Google.');
            // On vérifie/crée le profil
            createProfileIfNotExists(session.user).then(() => {
                // Et on redirige vers le dashboard
                console.log('Redirection vers le dashboard...');
                window.location.href = 'dashboard.html';
            });
        }
    });
    
});
