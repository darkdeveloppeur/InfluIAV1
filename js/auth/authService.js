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

// Gérer l'état d'authentification (redirection)
export function handleAuthStateChange() {
    if (!supabaseClient) return;
    supabaseClient.auth.onAuthStateChange((event, session) => {
        console.log(`Auth Event (handleAuthStateChange): ${event}`);
        if (event === "SIGNED_IN" && session?.user) {
            const currentPath = window.location.pathname;
            // Ne redirige que si on n'est PAS déjà sur une page privée
            // (On suppose que toutes les pages sauf celles listées sont privées)
            const publicPages = ['/', '/index.html', '/login.html', '/signup.html', '/pricing.html', '/forgot-password.html', '/reset-password.html'];
            if (publicPages.some(p => currentPath.endsWith(p)) ) {
                console.log("SIGNED_IN sur page publique -> dashboard");
                window.location.replace("dashboard.html");
            }
        } else if (event === "SIGNED_OUT") {
            // Optionnel : rediriger vers l'accueil si déconnecté
            // window.location.replace("index.html");
        }
    });
}

// Vérifier la session au chargement
export async function checkInitialSession() {
     if (!supabaseClient) return null;
     const { data: { session }, error } = await supabaseClient.auth.getSession();
     if (error) {
         console.error("Erreur getSession:", error);
         return null;
     }
     console.log('Session initiale:', session ? 'Active' : 'Inactive');
     return session; // Renvoie la session (ou null)
}

// Déconnexion
export async function signOut() {
    if (!supabaseClient) return;
    await supabaseClient.auth.signOut();
    window.location.replace("index.html"); // Redirige vers l'accueil après déconnexion
}
