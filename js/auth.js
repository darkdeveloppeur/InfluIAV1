// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', () => {

    // =================================================================
    // 1. METS TES CLÉS SUPABASE ICI
    // =================================================================
    // Tu trouves ces infos dans : Paramètres > API de ton projet Supabase
    
    const SUPABASE_URL = https://wzsugtpvexzrompgawsj.supabase.co; // Colle ton URL ici
    const SUPABASE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6c3VndHB2ZXh6cm9tcGdhd3NqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NTUxNTQsImV4cCI6MjA3NzIzMTE1NH0.vyykHppP0b1QgxFGp5slxPfewdL_YIcmJggtOMhnCzA; // Colle ta clé 'anon' 'public' ici

    // =================================================================

    // Initialiser le client Supabase
    let supabase;
    try {
        supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    } catch (e) {
        console.error('Erreur: Supabase n\'est pas chargé. As-tu mis tes clés ?', e);
        // Si les clés sont mauvaises, on arrête tout
        if (!SUPABASE_URL || SUPABASE_URL === 'TON_URL_SUPABASE') {
            alert('ERREUR : Les clés Supabase ne sont pas configurées dans js/auth.js !');
        }
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

            // ÉTAPE 1 : Inscrire l'utilisateur (Auth)
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
            });

            if (error) {
                alert(`Erreur lors de l'inscription : ${error.message}`);
                submitButton.textContent = 'Créer mon compte';
                submitButton.disabled = false;
            } else if (data.user) {
                // ÉTAPE 2 : Insérer le profil dans la base de données (Database)
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert([
                        { 
                            id: data.user.id,
                            full_name: fullName
                        }
                    ]);
                
                if (profileError) {
                     alert(`Erreur lors de la création du profil : ${profileError.message}`);
                }
                
                // Succès - Redirection
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
                email: email,
                password: password,
            });

            if (error) {
                alert(`Erreur lors de la connexion : ${error.message}`);
                submitButton.textContent = 'Se connecter';
                submitButton.disabled = false;
            } else {
                alert('Connexion réussie ! Redirection vers le tableau de bord...');
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

            //
            // J'AI MIS TON URL RENDER CI-DESSOUS
            //
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
