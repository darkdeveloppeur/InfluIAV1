import supabaseClient from './supabaseClient.js';

// Fonction pour créer un profil (appelée manuellement)
async function createProfile(user, fullName) {
    if (!supabaseClient) return { error: { message: 'Client non initialisé' }};
    console.log('Tentative de création de profil pour:', user.id);
    const { error } = await supabaseClient
        .from('profiles')
        .insert({ id: user.id, full_name: fullName });
    if (error) {
        console.error('Erreur création profil:', error);
    } else {
        console.log('Profil créé.');
    }
    return { error }; // Renvoie l'erreur s'il y en a une
}

// Inscription Email
export async function signUpWithEmail(email, password, fullName) {
    if (!supabaseClient) return { error: { message: 'Client non initialisé' }};
    const { data, error } = await supabaseClient.auth.signUp({ email, password });
    if (!error && data.user) {
        // Créer le profil manuellement APRES l'inscription réussie
        await createProfile(data.user, fullName);
    }
    return { data, error };
}

// Connexion Email
export async function signInWithEmail(email, password) {
    if (!supabaseClient) return { error: { message: 'Client non initialisé' }};
    return await supabaseClient.auth.signInWithPassword({ email, password });
}

// Connexion Google
export async function signInWithGoogle() {
    if (!supabaseClient) return { error: { message: 'Client non initialisé' }};
    return await supabaseClient.auth.signInWithOAuth({ provider: 'google' });
}

// Mot de passe oublié
export async function resetPassword(email) {
     if (!supabaseClient) return { error: { message: 'Client non initialisé' }};
     // Utilise l'URL actuelle du site + la page de reset
     const resetURL = `${window.location.origin}/reset-password.html`;
     return await supabaseClient.auth.resetPasswordForEmail(email, { redirectTo: resetURL });
}

// NOTE: TOUTES LES FONCTIONS DE GESTION DE SESSION (handleAuthStateChange, checkInitialSession)
// SONT MAINTENANT DANS js/main.js POUR ÉVITER LES CONFLITS.

// Déconnexion (gardé ici pour le bouton de déconnexion)
export async function signOut() {
    if (!supabaseClient) return;
    await supabaseClient.auth.signOut();
    // La redirection sera gérée par le listener onAuthStateChange dans main.js
    // On force quand même au cas où :
    window.location.replace("index.html");
}
