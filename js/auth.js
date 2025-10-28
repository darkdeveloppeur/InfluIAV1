// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', () => {

    // IMPORTANT : Remplace ces valeurs par tes propres clés Supabase !
    // Tu les trouves dans Paramètres > API dans ton projet Supabase
    const SUPABASE_URL = 'TON_URL_SUPABASE'; // Mets ton URL ici
    const SUPABASE_KEY = 'TA_CLE_PUBLIQUE_ANON'; // Mets ta clé ici

    // Initialiser le client Supabase
    let supabase;
    try {
        supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    } catch (e) {
        console.error('Erreur: Supabase n\'est pas chargé.', e);
        return; 
    }

    // Gérer l'inscription (signup.html)
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Empêcher le rechargement de la page
            
            // Récupérer les valeurs grâce aux IDs
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            const fullName = document.getElementById('signup-name').value; // NOUVEAU

            const submitButton = signupForm.querySelector('button[type="submit"]');
            submitButton.textContent = 'Création en cours...';
            submitButton.disabled = true;

            // ÉTAPE 1 : Inscrire l'utilisateur (Auth)
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
            });

            if (error) {
                // S'il y a une erreur
                alert(`Erreur lors de l'inscription : ${error.message}`);
                submitButton.textContent = 'Créer mon compte';
                submitButton.disabled = false;
            } else if (data.user) {
                // ÉTAPE 2 : Insérer le profil dans la base de données (Database)
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert([
                        { 
                            id: data.user.id, // Lier au compte auth
                            full_name: fullName // Stocker le nom complet
                        }
                    ]);
                
                if (profileError) {
                     alert(`Erreur lors de la création du profil : ${profileError.message}`);
                     // L'utilisateur est créé mais le profil a échoué.
                     // On le laisse quand même se connecter.
                     window.location.href = 'dashboard.html';
                } else {
                    // Succès complet !
                    alert('Inscription réussie ! Redirection...');
                    // Puisque la vérif email est OFF, on redirige direct au dashboard
                    window.location.href = 'dashboard.html';
                }
            }
        });
    }

    // Gérer la connexion (login.html)
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault(); 

            // Utiliser les IDs pour être plus précis (facultatif mais propre)
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
});
