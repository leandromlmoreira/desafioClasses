// Firebase configuration
// The real credentials should be placed in src/js/firebaseConfig.js which
// defines `window.firebaseConfig`.
const firebaseConfig = window.firebaseConfig || {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_AUTH_DOMAIN',
  projectId: 'YOUR_PROJECT_ID',
  appId: 'YOUR_APP_ID',
};

if (firebaseConfig.apiKey === 'YOUR_API_KEY') {
  console.warn('⚠️ Firebase não configurado. Edite src/js/firebaseConfig.js');
}

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

function loginWithEmail(email, password) {
  auth
    .signInWithEmailAndPassword(email, password)
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
      alert('Erro ao entrar: ' + err.message);
    });
}

function signUpWithEmail(email, password) {
  auth
    .createUserWithEmailAndPassword(email, password)
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
      alert('Erro ao cadastrar: ' + err.message);
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
    const googleBtn = document.getElementById('googleLogin');
    if (googleBtn) googleBtn.addEventListener('click', loginWithGoogle);

    const loginBtn = document.getElementById('emailLogin');
    const signupBtn = document.getElementById('emailSignup');
    if (loginBtn)
      loginBtn.addEventListener('click', () => {
        const email = document.getElementById('emailInput').value;
        const pass = document.getElementById('passwordInput').value;
        loginWithEmail(email, pass);
      });
    if (signupBtn)
      signupBtn.addEventListener('click', () => {
        const email = document.getElementById('emailInput').value;
        const pass = document.getElementById('passwordInput').value;
        signUpWithEmail(email, pass);
      });
  });
}
