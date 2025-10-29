// Connexion Google (fonction)
    async function signInWithGoogle() {
        const { data, error } = await supabaseClient.auth.signInWithOAuth({
            provider: 'google'
        });
        if (error) {
            alert('Erreur lors de la connexion Google : ' + error.message);
        }
    }

    // Attacher la fonction au bouton de la page de connexion
    const googleLoginBtn = document.getElementById('google-login-btn');
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', signInWithGoogle);
    }
    
    // Attacher la fonction au bouton de la page d'inscription
    const googleSignupBtn = document.getElementById('google-signup-btn');
    if (googleSignupBtn) {
        googleSignupBtn.addEventListener('click', signInWithGoogle);
    }

    // Le listener onAuthStateChange a été déplacé dans main.js
    
}); // Fin du document.addEventListener
