// On importe SEULEMENT les fonctions d'action (pas de gestion de session)
import { signUpWithEmail, signInWithEmail, signInWithGoogle, resetPassword } from './authService.js';

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

        const { data, error } = await signUpWithEmail(email, password, fullName);

        if (error) {
            alert(`Erreur inscription : ${error.message}`);
            submitButton.textContent = 'Créer'; submitButton.disabled = false;
        } else {
            // La redirection est gérée par main.js
            alert('Inscription réussie ! Redirection...');
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

        const { data, error } = await signInWithEmail(email, password);

        if (error) {
            alert(`Erreur connexion : ${error.message}`);
            submitButton.textContent = 'Connecter'; submitButton.disabled = false;
        } else {
             // La redirection est gérée par main.js
            alert('Connexion réussie ! Redirection...');
        }
    });
}

// Gérer le mot de passe oublié
const forgotPasswordForm = document.getElementById('forgot-password-form');
if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value; // ID 'email' et non 'forgot-email'
        const submitButton = forgotPasswordForm.querySelector('button[type="submit"]');
        submitButton.textContent = 'Envoi...'; submitButton.disabled = true;

        const { error } = await resetPassword(email);

        if (error) alert(`Erreur envoi : ${error.message}`);
        else alert('Email envoyé ! Vérifiez votre boîte.');
        submitButton.textContent = 'Envoyer'; submitButton.disabled = false;
    });
}

// Attacher aux boutons Google
const googleLoginBtn = document.getElementById('google-login-btn');
if (googleLoginBtn) googleLoginBtn.addEventListener('click', async () => {
    const { error } = await signInWithGoogle();
    if (error) alert('Erreur Google Login: ' + error.message);
});
const googleSignupBtn = document.getElementById('google-signup-btn');
if (googleSignupBtn) googleSignupBtn.addEventListener('click', async () => {
     const { error } = await signInWithGoogle();
     if (error) alert('Erreur Google Signup: ' + error.message);
});

// ON N'APPELLE PLUS handleAuthStateChange() ICI. C'EST LA SOURCE DU BUG.
// import { handleAuthStateChange } from './authService.js';
// handleAuthStateChange(); 

console.log('Auth UI (formulaires) initialisé.');
