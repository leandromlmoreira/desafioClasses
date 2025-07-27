requireAuth();

async function loadHeroes() {
  const res = await fetch('src/data/heroes.json');
  const data = await res.json();
  return data.heroes;
}

function renderHeroes(list) {
  const host = document.getElementById('heroList');
  list.forEach(h => {
    const btn = document.createElement('button');
    btn.className = 'login-button';
    btn.textContent = h.name;
    btn.style.display = 'block';
    btn.style.margin = '10px auto';
    btn.onclick = () => selectHero(h.id);
    host.appendChild(btn);
  });
}

function selectHero(id) {
  localStorage.setItem('userHero', id);
  window.location.href = 'index.html';
}

loadHeroes().then(renderHeroes);
