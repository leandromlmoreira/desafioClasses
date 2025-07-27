// Firebase configuration - replace with real config in production
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_AUTH_DOMAIN',
  projectId: 'YOUR_PROJECT_ID',
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

function loginWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth
    .signInWithPopup(provider)
    .then(result => {
      const user = {
        uid: result.user.uid,
        displayName: result.user.displayName,
        email: result.user.email,
      };
      localStorage.setItem('authUser', JSON.stringify(user));
      window.location.href = 'select-hero.html';
    })
    .catch(err => {
      alert('Erro ao autenticar: ' + err.message);
    });
}

function requireAuth() {
  const user = localStorage.getItem('authUser');
  if (!user) {
    window.location.href = 'login.html';
  }
}

function logout() {
  auth
    .signOut()
    .catch(() => {})
    .finally(() => {
      localStorage.removeItem('authUser');
      localStorage.removeItem('userHero');
      window.location.href = 'login.html';
    });
}

if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('googleLogin');
    if (btn) btn.addEventListener('click', loginWithGoogle);
  });
}
