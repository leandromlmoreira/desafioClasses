let heroesData = null;
let heroes = [];

const ataquePorTipo = {
  Mago: 'magia',
  Guerreiro: 'espada',
  Monge: 'artes marciais',
  Ninja: 'shuriken',
};

class Hero {
  constructor(data) {
    this.id = data.id;
    this.nome = data.name;
    this.tipo = data.type;
    this.desc = data.description;
    this.hp = data.hp;
    this.hpMax = data.maxHp;
    this.mp = data.mp;
    this.mpMax = data.maxMp;
    this.sp = data.sp || 0;
    this.spMax = data.maxSp || 0;
    this.level = data.level;
    this.xp = data.xp;
    this.xpToNext = data.xpToNext;
    this.combatStats = data.combatStats;
    this.abilities = data.abilities;
  }

  atacar() {
    return `o ${this.tipo.toLowerCase()} atacou usando ${ataquePorTipo[this.tipo]}`;
  }

  poderDeCombate() {
    const h = this.hp / this.hpMax,
      m = this.mp / this.mpMax,
      s = this.sp / this.spMax;
    if (this.tipo === 'Guerreiro') return 0.58 * h + 0.42 * Math.random();
    if (this.tipo === 'Mago') return 0.62 * m + 0.38 * Math.random();
    if (this.tipo === 'Monge') return 0.5 * (h + s) + 0.28 * Math.random();
    if (this.tipo === 'Ninja') return 0.55 * s + 0.45 * Math.random();
    return Math.random();
  }

  addXP(amount) {
    this.xp += amount;
    this.checkLevelUp();
    this.saveToCache();
  }

  checkLevelUp() {
    const xpLevels = [0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700];
    let newLevel = this.level;

    for (let i = 0; i < xpLevels.length; i++) {
      if (this.xp >= xpLevels[i]) {
        newLevel = i + 1;
      } else {
        break;
      }
    }

    if (newLevel > this.level) {
      this.level = newLevel;
      this.xpToNext = xpLevels[newLevel] || 9999;

      const hpGain = Math.floor(this.hpMax * 0.1);
      const mpGain = Math.floor(this.mpMax * 0.1);
      const spGain = Math.floor(this.spMax * 0.1);

      this.hpMax += hpGain;
      this.hp += hpGain;
      this.mpMax += mpGain;
      this.mp += mpGain;
      this.spMax += spGain;
      this.sp += spGain;

      this.combatStats.attack += Math.floor(this.combatStats.attack * 0.05);
      this.combatStats.spellPower += Math.floor(
        this.combatStats.spellPower * 0.05
      );
      this.combatStats.defense += Math.floor(this.combatStats.defense * 0.05);

      console.log(`${this.nome} subiu para o nível ${this.level}!`);
      showLevelUpNotification(this.nome, this.level);
    } else {
      this.xpToNext = xpLevels[this.level] || 9999;
    }
  }

  saveToCache() {
    const cache = JSON.parse(localStorage.getItem('heroesCache') || '{}');
    cache[this.id] = {
      level: this.level,
      xp: this.xp,
      hp: this.hp,
      hpMax: this.hpMax,
      mp: this.mp,
      mpMax: this.mpMax,
      sp: this.sp,
      spMax: this.spMax,
      combatStats: this.combatStats,
    };
    localStorage.setItem('heroesCache', JSON.stringify(cache));
  }

  loadFromCache() {
    const cache = JSON.parse(localStorage.getItem('heroesCache') || '{}');
    const cached = cache[this.id];
    if (cached) {
      this.level = cached.level;
      this.xp = cached.xp;
      this.hp = cached.hp;
      this.hpMax = cached.hpMax;
      this.mp = cached.mp;
      this.mpMax = cached.mpMax;
      this.sp = cached.sp || this.sp;
      this.spMax = cached.spMax || this.spMax;
      this.combatStats = cached.combatStats;
    }
  }
}

async function loadHeroesData() {
  try {
    const response = await fetch('src/data/heroes.json');
    heroesData = await response.json();

    heroes = heroesData.heroes.map(heroData => {
      const hero = new Hero(heroData);
      hero.loadFromCache();
      return hero;
    });

    const isFirstTime = !localStorage.getItem('heroesCache');
    if (isFirstTime) {
      console.log('Primeira execução - restaurando status...');
      restoreHeroStats();
    } else {
      console.log(
        'Cache encontrado - verificando se precisa restaurar status...'
      );
      const needsRestore = heroes.some(
        hero =>
          (hero.tipo === 'Mago' && hero.mp < hero.mpMax) ||
          (hero.tipo !== 'Mago' && hero.sp < hero.spMax)
      );
      if (needsRestore) {
        console.log('Status incompletos detectados - restaurando...');
        restoreHeroStats();
      }
    }

    render();
  } catch (error) {
    console.error('Erro ao carregar dados dos heróis:', error);
  }
}

const grid = document.getElementById('grid');
const tpl = document.getElementById('card-template');
const btnStart = document.getElementById('btnStart');
const selCount = document.getElementById('selCount');
const arena = document.getElementById('arena');
const stage = arena.querySelector('.stage');
const duelL = arena.querySelector('.duelist.left');
const duelR = arena.querySelector('.duelist.right');
const battleLog = document.getElementById('battleLog');
const btnAgain = document.getElementById('btnAgain');
const btnClose = document.getElementById('btnClose');

const selected = new Set();
const chosenAbility = new Map();

function fmt(v, m) {
  return `${v} / ${m}`;
}
function pct(v, m) {
  return Math.max(0, Math.min(100, (v / m) * 100));
}

const ui = {
  log(lines = []) {
    battleLog.innerHTML = lines
      .map(t => `<div class="line">${t}</div>`)
      .join('');
  },
};

function updateXP(root, hero) {
  const ratio = pct(hero.xp, hero.xpToNext);

  console.log(
    `Atualizando XP para ${hero.nome}: ${hero.xp}/${hero.xpToNext} (${ratio}%)`
  );

  root.querySelectorAll('.xp-fill').forEach(fill => {
    fill.style.transition = 'width 0.8s ease-out';
    fill.style.width = ratio + '%';
  });

  root.querySelectorAll('.xp-text .xp-text-full').forEach(text => {
    text.style.transition = 'color 0.3s ease';
    text.style.color = '#ffd700';
    setTimeout(() => {
      text.textContent = `${hero.xp} / ${hero.xpToNext} XP`;
      text.style.color = '';
    }, 300);
  });

  root.querySelectorAll('.level-number').forEach(level => {
    const oldLevel = level.textContent;
    const newLevel = `Lv${hero.level}`;

    if (oldLevel !== newLevel) {
      level.style.transition = 'transform 0.5s ease, color 0.5s ease';
      level.style.transform = 'scale(1.2)';
      level.style.color = '#ffd700';

      setTimeout(() => {
        level.textContent = newLevel;
        level.style.transform = 'scale(1)';
        level.style.color = '';
      }, 250);
    } else {
      level.textContent = newLevel;
    }
  });
}

function buildCard(h) {
  const root = tpl.content.firstElementChild.cloneNode(true);
  root.dataset.id = h.id;
  root.setAttribute('data-type', h.tipo);

  root.querySelector('.card-front .hero-name').textContent = h.nome;
  root.querySelector('.card-front .hero-desc').textContent = h.desc;

  const hpFillF = root.querySelector('.card-front .hp-fill');
  const hpTextF = root.querySelector('.card-front .hp-text');
  const mpFillF = root.querySelector('.card-front .mana-fill');
  const mpTextF = root.querySelector('.card-front .mp-text');
  const spFillF = root.querySelector('.card-front .sp-fill');
  const spTextF = root.querySelector('.card-front .sp-text');
  const mpBar = root.querySelector('.card-front .stat-bar.mana');
  const spBar = root.querySelector('.card-front .stat-bar.sp');

  hpFillF.style.width = pct(h.hp, h.hpMax) + '%';
  hpTextF.textContent = fmt(h.hp, h.hpMax);

  if (h.tipo === 'Mago') {
    mpFillF.style.width = pct(h.mp, h.mpMax) + '%';
    mpTextF.textContent = fmt(h.mp, h.mpMax);
    if (mpBar) mpBar.style.display = 'flex';
    if (spBar) spBar.style.display = 'none';
  } else {
    spFillF.style.width = pct(h.sp, h.spMax) + '%';
    spTextF.textContent = fmt(h.sp, h.spMax);
    if (mpBar) mpBar.style.display = 'none';
    if (spBar) spBar.style.display = 'flex';
  }
  const artBox = root.querySelector('.card-front .art-placeholder');
  if (artBox) {
    const img = new Image();
    const imageName = h.id.charAt(0).toUpperCase() + h.id.slice(1);
    img.src = `assets/images/${imageName}.png`;
    img.alt = h.nome;
    console.log(`Tentando carregar imagem: assets/images/${imageName}.png`);
    img.onerror = () => {
      console.warn(`Imagem não encontrada: assets/images/${imageName}.png`);
    };
    artBox.innerHTML = '';
    artBox.appendChild(img);
  }

  ['attack', 'frost', 'slam', 'meteor'].forEach(k => {
    const panel = root.querySelector(`.ability[data-ability="${k}"]`);
    if (!panel) return;
    const meta = h.abilities[k];
    if (meta) {
      const pa = panel.querySelector('.ability-art-placeholder');
      if (pa) {
        const img = new Image();
        const imageName = h.id.charAt(0).toUpperCase() + h.id.slice(1);
        img.src = `assets/images/${imageName}.png`;
        img.alt = h.nome;
        img.onerror = () => {
          console.warn(`Imagem não encontrada: assets/images/${imageName}.png`);
        };
        pa.innerHTML = '';
        pa.appendChild(img);
      }
      panel.querySelector('.ability-name-text').textContent = meta.name;
      panel.querySelector('.ability-cost-text').textContent = meta.cost
        ? `${meta.cost} ${h.tipo === 'Mago' ? 'MP' : 'SP'}`
        : 'Sem Custo';
      panel.querySelector('.ability-desc-text').textContent =
        meta.description || meta.desc || 'Descrição não disponível';
    }
  });

  const tabs = root.querySelectorAll('.ability-tab');
  tabs.forEach(tab =>
    tab.addEventListener('click', ev => {
      ev.stopPropagation();
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const abil = tab.dataset.ability;
      root
        .querySelectorAll('.ability')
        .forEach(a => a.classList.remove('active'));
      root
        .querySelector(`.ability[data-ability="${abil}"]`)
        .classList.add('active');
    })
  );

  root.querySelectorAll('.ability').forEach(panel => {
    panel.addEventListener('click', ev => {
      ev.stopPropagation();
      const k = panel.dataset.ability;
      chosenAbility.set(h.id, k);
      const a = h.abilities[k];
      const abilityDesc = a.description || a.desc || 'Descrição não disponível';
      root.querySelector('.card-front .hero-desc').textContent =
        `Próximo: ${a.name} — ${abilityDesc}`;
      root.classList.remove('flipped');
      root
        .querySelectorAll('.art-placeholder img,.ability-art-placeholder img')
        .forEach(img => (img.style.transform = 'scaleX(1)'));
    });
  });

  const flipper = root.querySelector('.game-card');
  flipper.addEventListener('click', e => {
    if (e.button !== 0) return;
    if (e.target.closest('.ability-tab') || e.target.closest('.ability'))
      return;
    const flipped = root.classList.toggle('flipped');
    root
      .querySelectorAll('.art-placeholder img,.ability-art-placeholder img')
      .forEach(
        img => (img.style.transform = flipped ? 'scaleX(-1)' : 'scaleX(1)')
      );
  });

  root.addEventListener('contextmenu', e => {
    e.preventDefault();
    toggleSelect(root, h.id);
  });

  updateXP(root, h);

  const combatStats = root.querySelectorAll('.combat-stat');
  if (combatStats.length > 0 && h.combatStats) {
    const attackStat = root.querySelector(
      '.combat-stat.attack .combat-stat-fill'
    );
    const spellStat = root.querySelector(
      '.combat-stat.spell-power .combat-stat-fill'
    );
    const defenseStat = root.querySelector(
      '.combat-stat.defense .combat-stat-fill'
    );

    if (attackStat) attackStat.style.width = `${h.combatStats.attack}%`;
    if (spellStat) spellStat.style.width = `${h.combatStats.spellPower}%`;
    if (defenseStat) defenseStat.style.width = `${h.combatStats.defense}%`;

    const attackText = root.querySelector(
      '.combat-stat.attack .combat-stat-text'
    );
    const spellText = root.querySelector(
      '.combat-stat.spell-power .combat-stat-text'
    );
    const defenseText = root.querySelector(
      '.combat-stat.defense .combat-stat-text'
    );

    if (attackText) attackText.textContent = `${h.combatStats.attack} / 100`;
    if (spellText) spellText.textContent = `${h.combatStats.spellPower} / 100`;
    if (defenseText) defenseText.textContent = `${h.combatStats.defense} / 100`;
  }

  return root;
}

function toggleSelect(card, id) {
  if (selected.has(id)) {
    selected.delete(id);
    card.classList.remove('selected');
  } else {
    if (selected.size >= 2) {
      const first = [...selected][0];
      const firstEl = grid.querySelector(`.card-container[data-id="${first}"]`);
      if (firstEl) firstEl.classList.remove('selected');
      selected.delete(first);
    }
    selected.add(id);
    card.classList.add('selected');
  }
  selCount.textContent = selected.size;
  btnStart.disabled = selected.size !== 2;

  const counter = document.querySelector('.selection-counter');
  if (selected.size === 2) {
    counter.classList.add('ready');
  } else {
    counter.classList.remove('ready');
  }
}

function render() {
  restoreHeroStats();
  grid.innerHTML = '';
  heroes.forEach(h => grid.appendChild(buildCard(h)));
}

function updateAllCards() {
  heroes.forEach(hero => {
    const cardElement = grid.querySelector(`[data-id="${hero.id}"]`);
    if (cardElement) {
      updateXP(cardElement, hero);

      const heroDesc = cardElement.querySelector('.card-front .hero-desc');
      if (heroDesc) {
        heroDesc.textContent = hero.desc;
      }

      const hpFillF = cardElement.querySelector('.card-front .hp-fill');
      const hpTextF = cardElement.querySelector('.card-front .hp-text');
      const mpFillF = cardElement.querySelector('.card-front .mana-fill');
      const mpTextF = cardElement.querySelector('.card-front .mp-text');
      const spFillF = cardElement.querySelector('.card-front .sp-fill');
      const spTextF = cardElement.querySelector('.card-front .sp-text');
      const mpBar = cardElement.querySelector('.card-front .stat-bar.mana');
      const spBar = cardElement.querySelector('.card-front .stat-bar.sp');

      if (hpFillF && hpTextF) {
        hpFillF.style.width = pct(hero.hp, hero.hpMax) + '%';
        hpTextF.textContent = fmt(hero.hp, hero.hpMax);
      }

      if (hero.tipo === 'Mago') {
        if (mpFillF && mpTextF) {
          mpFillF.style.width = pct(hero.mp, hero.mpMax) + '%';
          mpTextF.textContent = fmt(hero.mp, hero.mpMax);
        }
        if (mpBar) mpBar.style.display = 'flex';
        if (spBar) spBar.style.display = 'none';
      } else {
        if (spFillF && spTextF) {
          spFillF.style.width = pct(hero.sp, hero.spMax) + '%';
          spTextF.textContent = fmt(hero.sp, hero.spMax);
        }
        if (mpBar) mpBar.style.display = 'none';
        if (spBar) spBar.style.display = 'flex';
      }

      const combatStats = cardElement.querySelectorAll('.combat-stat');
      if (combatStats.length > 0 && hero.combatStats) {
        const attackStat = cardElement.querySelector(
          '.combat-stat.attack .combat-stat-fill'
        );
        const spellStat = cardElement.querySelector(
          '.combat-stat.spell-power .combat-stat-fill'
        );
        const defenseStat = cardElement.querySelector(
          '.combat-stat.defense .combat-stat-fill'
        );

        if (attackStat) {
          attackStat.style.transition = 'width 0.8s ease-out';
          attackStat.style.width = `${hero.combatStats.attack}%`;
        }
        if (spellStat) {
          spellStat.style.transition = 'width 0.8s ease-out';
          spellStat.style.width = `${hero.combatStats.spellPower}%`;
        }
        if (defenseStat) {
          defenseStat.style.transition = 'width 0.8s ease-out';
          defenseStat.style.width = `${hero.combatStats.defense}%`;
        }

        const attackText = cardElement.querySelector(
          '.combat-stat.attack .combat-stat-text'
        );
        const spellText = cardElement.querySelector(
          '.combat-stat.spell-power .combat-stat-text'
        );
        const defenseText = cardElement.querySelector(
          '.combat-stat.defense .combat-stat-text'
        );

        if (attackText)
          attackText.textContent = `${hero.combatStats.attack} / 100`;
        if (spellText)
          spellText.textContent = `${hero.combatStats.spellPower} / 100`;
        if (defenseText)
          defenseText.textContent = `${hero.combatStats.defense} / 100`;
      }
    }
  });
}

function showLevelUpNotification(heroName, newLevel) {
  const notification = document.createElement('div');
  notification.className = 'level-up-notification';
  notification.innerHTML = `
    <div class="level-up-content">
      <div class="level-up-icon">⭐</div>
      <div class="level-up-text">
        <div class="level-up-title">LEVEL UP!</div>
        <div class="level-up-hero">${heroName}</div>
        <div class="level-up-level">Nível ${newLevel}</div>
      </div>
    </div>
  `;

  notification.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(135deg, #2c1810, #4a2c1a);
    border: 2px solid #ffd700;
    border-radius: 15px;
    padding: 20px;
    color: #ffd700;
    font-family: 'Cinzel', serif;
    font-weight: bold;
    text-align: center;
    z-index: 1000;
    box-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
    animation: levelUpAppear 0.5s ease-out;
    min-width: 200px;
  `;

  const content = notification.querySelector('.level-up-content');
  content.style.cssText = `
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  `;

  const icon = notification.querySelector('.level-up-icon');
  icon.style.cssText = `
    font-size: 32px;
    animation: spin 2s linear infinite;
  `;

  const title = notification.querySelector('.level-up-title');
  title.style.cssText = `
    font-size: 18px;
    font-weight: 900;
    text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
  `;

  const hero = notification.querySelector('.level-up-hero');
  hero.style.cssText = `
    font-size: 16px;
    color: #f5e7c8;
  `;

  const level = notification.querySelector('.level-up-level');
  level.style.cssText = `
    font-size: 14px;
    color: #ffd700;
    font-weight: 700;
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'levelUpDisappear 0.5s ease-in';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 500);
  }, 3000);
}

function cloneCardForArena(h) {
  const c = buildCard(h);
  c.classList.remove('selected', 'flipped');
  return c;
}

function writeFloat(hostEl, text, kind = 'dmg') {
  const d = document.createElement('div');
  d.className = `float-text ${kind}`;
  d.textContent = text;
  hostEl.appendChild(d);
  setTimeout(() => d.remove(), 1200);
}
function writeHPDamage(card, dmg) {
  const hpBar = card.querySelector('.stat-bar.hp');
  if (!hpBar) return;
  const tag = document.createElement('div');
  tag.className = 'hp-dmg-float';
  tag.textContent = `-${dmg}`;
  hpBar.appendChild(tag);
  setTimeout(() => tag.remove(), 1200);
}
function showBarChange(card, type, amount) {
  if (type === 'mp') {
    const bar = card.querySelector('.stat-bar.mana .stat-fill-section');
    if (!bar) return;
    const b = document.createElement('div');
    b.className = 'bar-float mp';
    b.textContent = (amount > 0 ? '+' : '') + amount;
    bar.appendChild(b);
    setTimeout(() => b.remove(), 1000);
  }
  if (type === 'sp') {
    const bar = card.querySelector('.stat-bar.sp .stat-fill-section');
    if (!bar) return;
    const b = document.createElement('div');
    b.className = 'bar-float sp';
    b.textContent = (amount > 0 ? '+' : '') + amount;
    bar.appendChild(b);
    setTimeout(() => b.remove(), 1000);
  }
}
function fxHit(duelistEl) {
  duelistEl.classList.add('fx-hit');
  setTimeout(() => duelistEl.classList.remove('fx-hit'), 450);
}
function fxShield(inner) {
  inner.classList.add('fx-shield', 'cast-magic-def');
  setTimeout(() => inner.classList.remove('fx-shield', 'cast-magic-def'), 1000);
}
function fxDefense(inner) {
  inner.style.animation = 'defensePulse 0.6s ease-in-out';
  setTimeout(() => (inner.style.animation = ''), 600);
}
function fxDefenseCard(card) {
  const cardFrame = card.querySelector('.card-frame');
  if (cardFrame) {
    cardFrame.style.animation = 'defenseBarrier 1.2s ease-in-out';
    setTimeout(() => (cardFrame.style.animation = ''), 1200);
  }
}
function fxCharge(inner) {
  inner.classList.add('cast-magic-pwr');
  setTimeout(() => inner.classList.remove('cast-magic-pwr'), 1000);
}
function fxUlt(stageEl, inner) {
  inner.classList.add('cast-ult');
  setTimeout(() => inner.classList.remove('cast-ult'), 1200);
  const wave = document.createElement('div');
  wave.className = 'fx-ult-wave';
  stageEl.appendChild(wave);
  setTimeout(() => wave.remove(), 1200);
}

function atualizarHUDCard(card, hp, hpMax, mp, mpMax, sp, spMax) {
  const hpFill = card.querySelector('.hp-fill');
  const hpText = card.querySelector('.hp-text');
  const mpFill = card.querySelector('.mana-fill');
  const mpText = card.querySelector('.mp-text');
  const spFill = card.querySelector('.sp-fill');
  const spText = card.querySelector('.sp-text');

  if (hpFill) {
    hpFill.style.width = pct(hp, hpMax) + '%';
    hpFill.style.transition = 'width 0.3s ease-in-out';
  }
  if (hpText) hpText.textContent = fmt(hp, hpMax);

  if (mpFill) {
    mpFill.style.width = pct(mp, mpMax) + '%';
    mpFill.style.transition = 'width 0.3s ease-in-out';
  }
  if (mpText) mpText.textContent = fmt(mp, mpMax);

  if (spFill) {
    spFill.style.width = pct(sp, spMax) + '%';
    spFill.style.transition = 'width 0.3s ease-in-out';
  }
  if (spText) spText.textContent = fmt(sp, spMax);
}

function calcularDanoBase(atkHero) {
  const base = 8 + Math.floor(Math.random() * 6);
  const mod = 0.8 + atkHero.poderDeCombate() * 0.4;
  return Math.floor(base * mod);
}
function escolherHabilidade(state, defState) {
  const H = state.heroi.abilities || {};
  const currentEnergy = state.heroi.tipo === 'Mago' ? state.mp : state.sp;
  const maxEnergy = state.heroi.tipo === 'Mago' ? state.mpMax : state.spMax;

  const preKey = chosenAbility.get(state.heroi.id);
  if (preKey && H[preKey] && currentEnergy >= (H[preKey].cost || 0)) {
    return H[preKey];
  }

  const ult = H.meteor || H.ult || H.ultimate;
  if (ult && currentEnergy >= (ult.cost || 999999)) {
    if (defState && ult.damage && ult.damage >= defState.hp) return ult;
    return ult;
  }

  const skills = Object.entries(H)
    .filter(([k, v]) => k !== 'attack' && v && currentEnergy >= (v.cost || 0))
    .sort((a, b) => {
      const va = a[1],
        vb = b[1];
      const typeScore = x => (x.type === 'ult' ? 2 : x.type === 'pwr' ? 1 : 0);
      const byType = typeScore(vb) - typeScore(va);
      if (byType) return byType;
      const byCost = (vb.cost || 0) - (va.cost || 0);
      if (byCost) return byCost;
      const byDmg = (vb.damage || 0) - (va.damage || 0);
      if (byDmg) return byDmg;
      const ratioA = (va.damage || 0) / Math.max(1, va.cost || 1);
      const ratioB = (vb.damage || 0) / Math.max(1, vb.cost || 1);
      return ratioB - ratioA;
    });

  if (skills.length) return skills[0][1];
  return H.attack;
}
function combatePorTurnos(heroiA, heroiB) {
  function resolveAbilKey(hero, abilObj) {
    for (const [k, v] of Object.entries(hero.abilities || {})) {
      if (v === abilObj) return k;
    }
    return 'attack';
  }

  const A = {
    heroi: heroiA,
    hp: heroiA.hpMax,
    hpMax: heroiA.hpMax,
    mp: Math.floor(heroiA.mpMax * 0.6),
    mpMax: heroiA.mpMax,
    sp: Math.floor(heroiA.spMax * 0.6),
    spMax: heroiA.spMax,
    buffs: {},
  };
  const B = {
    heroi: heroiB,
    hp: heroiB.hpMax,
    hpMax: heroiB.hpMax,
    mp: Math.floor(heroiB.mpMax * 0.6),
    mpMax: heroiB.mpMax,
    sp: Math.floor(heroiB.spMax * 0.6),
    spMax: heroiB.spMax,
    buffs: {},
  };

  const duo = [A, B];
  const turnos = [];
  let n = 1;

  function aplicaDano(atk, def, abil) {
    if (def.hp <= 0) return 0;

    const abilEff = abil || atk.heroi.abilities.attack;
    let dmg =
      abilEff.damage ||
      Math.floor(
        calcularDanoBase(atk.heroi) * (abilEff.mult || 1) +
          (abilEff.bonusFlat || 0)
      );

    if (def.buffs.guard) {
      dmg = Math.max(1, Math.floor(dmg * (1 - def.buffs.guard.rate)));
      def.buffs.guard.turns--;
      if (def.buffs.guard.turns <= 0) delete def.buffs.guard;
    }

    dmg = Math.floor(dmg * 0.85);

    def.hp = Math.max(0, def.hp - dmg);

    const isBasic = abilEff === atk.heroi.abilities.attack;
    if (isBasic) {
      const hpPerc = atk.hp / atk.hpMax;
      const rec = Math.floor((1 - hpPerc) * 20) + 10;
      if (atk.heroi.tipo === 'Mago') {
        atk.mp = Math.min(atk.mpMax, atk.mp + rec);
      } else {
        atk.sp = Math.min(atk.spMax, atk.sp + rec);
      }
    }

    return dmg;
  }

  while (A.hp > 0 && B.hp > 0 && n < 80) {
    const atk1 = duo[0],
      def1 = duo[1];
    const atk2 = duo[1],
      def2 = duo[0];

    let abil1 = escolherHabilidade(atk1, def1);
    if (abil1 && abil1.cost > 0) {
      const falta1 =
        atk1.heroi.tipo === 'Mago'
          ? atk1.mp < abil1.cost
          : atk1.sp < abil1.cost;
      if (falta1) abil1 = atk1.heroi.abilities.attack;
    }
    let abil2 = escolherHabilidade(atk2, def2);
    if (abil2 && abil2.cost > 0) {
      const falta2 =
        atk2.heroi.tipo === 'Mago'
          ? atk2.mp < abil2.cost
          : atk2.sp < abil2.cost;
      if (falta2) abil2 = atk2.heroi.abilities.attack;
    }

    const cost1 = abil1 && abil1.cost ? abil1.cost : 0;
    if (cost1 > 0) {
      if (atk1.heroi.tipo === 'Mago') atk1.mp = Math.max(0, atk1.mp - cost1);
      else atk1.sp = Math.max(0, atk1.sp - cost1);
    }
    const cost2 = abil2 && abil2.cost ? abil2.cost : 0;
    if (cost2 > 0) {
      if (atk2.heroi.tipo === 'Mago') atk2.mp = Math.max(0, atk2.mp - cost2);
      else atk2.sp = Math.max(0, atk2.sp - cost2);
    }

    const abilKey1 = resolveAbilKey(atk1.heroi, abil1);
    const abilKey2 = resolveAbilKey(atk2.heroi, abil2);

    if (chosenAbility.get(atk1.heroi.id) === abilKey1)
      chosenAbility.delete(atk1.heroi.id);
    if (chosenAbility.get(atk2.heroi.id) === abilKey2)
      chosenAbility.delete(atk2.heroi.id);
    const reg1 = {
      turno: n,
      atacante: atk1.heroi,
      defensor: def1.heroi,
      abilKey: abilKey1,
      abilName: (abil1 && abil1.name) || 'Ataque',
      tipo: (abil1 && abil1.type) || 'atk',
      gasto: cost1,
      dano: 0,
      hpRestante: 0,
      hpMaxDef: def1.hpMax,
    };
    const reg2 = {
      turno: n,
      atacante: atk2.heroi,
      defensor: def2.heroi,
      abilKey: abilKey2,
      abilName: (abil2 && abil2.name) || 'Ataque',
      tipo: (abil2 && abil2.type) || 'atk',
      gasto: cost2,
      dano: 0,
      hpRestante: 0,
      hpMaxDef: def2.hpMax,
    };

    if (abil1 && abil1.type === 'def') {
      atk1.buffs.guard = { rate: abil1.guard || 0.35, turns: 1 };
      const cura = Math.floor(
        (abil1.heal || 0.2) *
          (atk1.heroi.tipo === 'Mago' ? atk1.mpMax : atk1.spMax)
      );
      atk1.hp = Math.min(atk1.hpMax, atk1.hp + cura);
      reg1.hpRestante = atk1.hp;
    } else {
      reg1.dano = aplicaDano(atk1, def1, abil1 || atk1.heroi.abilities.attack);
      reg1.hpRestante = def1.hp;
    }

    if (abil2 && abil2.type === 'def') {
      atk2.buffs.guard = { rate: abil2.guard || 0.35, turns: 1 };
      const cura = Math.floor(
        (abil2.heal || 0.2) *
          (atk2.heroi.tipo === 'Mago' ? atk2.mpMax : atk2.spMax)
      );
      atk2.hp = Math.min(atk2.hpMax, atk2.hp + cura);
      reg2.hpRestante = atk2.hp;
    } else {
      reg2.dano = aplicaDano(atk2, def2, abil2 || atk2.heroi.abilities.attack);
      reg2.hpRestante = def2.hp;
    }

    turnos.push(reg1, reg2);
    if (def1.hp <= 0 || def2.hp <= 0) {
      if (def1.hp <= 0) {
        turnos.push({
          turno: n,
          atacante: def1.heroi,
          defensor: def2.heroi,
          abilKey: 'death',
          abilName: 'Morte',
          tipo: 'death',
          gasto: 0,
          dano: 0,
          hpRestante: 0,
          hpMaxDef: def1.hpMax,
        });
      }
      if (def2.hp <= 0) {
        turnos.push({
          turno: n,
          atacante: def2.heroi,
          defensor: def1.heroi,
          abilKey: 'death',
          abilName: 'Morte',
          tipo: 'death',
          gasto: 0,
          dano: 0,
          hpRestante: 0,
          hpMaxDef: def2.hpMax,
        });
      }
      break;
    }

    n++;
  }

  const vencedor = A.hp > 0 ? A.heroi : B.heroi;
  const perdedor = A.hp > 0 ? B.heroi : A.heroi;
  return { turnos, vencedor, perdedor };
}

function wrapDuelist(el, card) {
  el.innerHTML = '';
  const inner = document.createElement('div');
  inner.className = 'duelist-inner';
  inner.appendChild(card);
  el.appendChild(inner);
  return inner;
}

function positionBattleLog() {
  const innerL = duelL.querySelector('.duelist-inner');
  const innerR = duelR.querySelector('.duelist-inner');
  if (!innerL || !innerR) return;
  const l = innerL.getBoundingClientRect();
  const r = innerR.getBoundingClientRect();
  const s = stage.getBoundingClientRect();
  const pad = 16;
  const leftEdge = l.right - s.left + pad;
  const rightEdge = r.left - s.left - pad;
  const width = Math.max(120, rightEdge - leftEdge);
  battleLog.style.width = width + 'px';
  battleLog.style.left = (leftEdge + rightEdge) / 2 + 'px';
  battleLog.style.transform = 'translate(-50%,-50%)';
}

function forceResetInner(inner) {
  inner.style.animation = 'none';
  inner.style.transform = 'translate3d(0,0,0)';
  void inner.offsetWidth;
  inner.style.animation = '';
}

function iniciarCombate() {
  if (selected.size !== 2) return;
  const [aId, bId] = [...selected];
  const heroA = heroes.find(h => h.id === aId);
  const heroB = heroes.find(h => h.id === bId);

  const cardA = cloneCardForArena(heroA);
  const cardB = cloneCardForArena(heroB);
  const innerL = wrapDuelist(duelL, cardA);
  const innerR = wrapDuelist(duelR, cardB);

  atualizarHUDCard(
    cardA,
    heroA.hpMax,
    heroA.hpMax,
    Math.floor(heroA.mpMax * 0.6),
    heroA.mpMax,
    Math.floor(heroA.spMax * 0.6),
    heroA.spMax
  );
  atualizarHUDCard(
    cardB,
    heroB.hpMax,
    heroB.hpMax,
    Math.floor(heroB.mpMax * 0.6),
    heroB.mpMax,
    Math.floor(heroB.spMax * 0.6),
    heroB.spMax
  );

  arena.classList.add('show');
  stage.classList.remove('resolved');
  duelL.classList.remove('winner', 'loser', 'on-top', 'fx-shield', 'fx-hit');
  duelR.classList.remove('winner', 'loser', 'on-top', 'fx-shield', 'fx-hit');
  duelL.style.right = '';
  duelR.style.right = '';
  duelL.style.left = '40px';
  duelR.style.left = 'calc(100% - 40px - 420px)';
  duelL.style.transform = 'translateY(-50%)';
  duelR.style.transform = 'translateY(-50%)';
  innerL.classList.remove('attack-left');
  innerR.classList.remove('attack-right');
  battleLog.classList.remove('fade-out');

  void duelL.offsetWidth;
  duelL.classList.add('enter-left');
  duelR.classList.add('enter-right');
  ui.log(['<span class="title">Iniciando duelo…</span>']);

  setTimeout(() => {
    positionBattleLog();
    const res = combatePorTurnos(heroA, heroB);
    executarCombatePorTurnos(res, innerL, innerR, cardA, cardB);
  }, 800);
}

function executarCombatePorTurnos(res, innerL, innerR, cardA, cardB) {
  let i = 0;
  function prox() {
    if (i >= res.turnos.length) {
      finalizarCombate(res);
      return;
    }
    const t = res.turnos[i];
    const leftFirst = res.turnos[0].atacante.id;
    const attackerLeft = t.atacante.id === leftFirst;

    const atkD = attackerLeft ? duelL : duelR;
    const defD = attackerLeft ? duelR : duelL;
    const atkInner = attackerLeft ? innerL : innerR;
    const defInner = attackerLeft ? innerR : innerL;
    const atkCard = attackerLeft ? cardA : cardB;
    const defCard = attackerLeft ? cardB : cardA;

    ui.log([
      `<span class="title">Turno ${t.turno}</span>`,
      `${t.atacante.nome} usa <b>${t.abilName}</b>!`,
    ]);
    atkD.classList.add('on-top');
    positionBattleLog();

    if (t.tipo === 'def') {
      fxDefenseCard(atkCard);
    } else {
      if (t.tipo === 'pwr') {
        fxCharge(atkInner);
      }
      if (t.tipo === 'ult') {
        fxUlt(stage, atkInner);
      }
      if (t.tipo === 'atk') {
        atkInner.classList.add('attack-basic');
        setTimeout(() => atkInner.classList.remove('attack-basic'), 800);
      }
      forceResetInner(atkInner);
      atkInner.classList.add(attackerLeft ? 'attack-left' : 'attack-right');
    }

    if (t.gasto > 0) {
      const energyType = t.atacante.tipo === 'Mago' ? 'mp' : 'sp';
      showBarChange(atkCard, energyType, -t.gasto);
    }

    setTimeout(() => {
      if (t.tipo === 'def') {
        writeFloat(atkInner, 'CURA', 'heal');
      } else {
        fxHit(defD);
        writeHPDamage(defCard, t.dano);
      }

      setTimeout(() => {
        atualizarParciaisHUD(res, i, cardA, cardB);

        setTimeout(() => {
          atkInner.classList.remove('attack-left', 'attack-right');
          forceResetInner(atkInner);
          atkInner.style.animation = '';
          atkCard.style.animation = '';
          defCard.style.animation = '';
          duelL.classList.remove('on-top');
          duelR.classList.remove('on-top');
          i++;
          positionBattleLog();
          setTimeout(prox, 1000);
        }, 600);
      }, 400);
    }, 600);
  }
  prox();
}

function atualizarParciaisHUD(res, ate, cardL, cardR) {
  const leftId = res.turnos[0].atacante.id;
  const rightId = res.turnos[1].atacante.id;

  const hL = heroes.find(h => h.id === leftId);
  const hR = heroes.find(h => h.id === rightId);

  const state = {
    [leftId]: {
      hp: hL.hpMax,
      hpMax: hL.hpMax,
      mp: Math.floor(hL.mpMax * 0.6),
      mpMax: hL.mpMax,
      sp: Math.floor(hL.spMax * 0.6),
      spMax: hL.spMax,
    },
    [rightId]: {
      hp: hR.hpMax,
      hpMax: hR.hpMax,
      mp: Math.floor(hR.mpMax * 0.6),
      mpMax: hR.mpMax,
      sp: Math.floor(hR.spMax * 0.6),
      spMax: hR.spMax,
    },
  };

  const guard = {};
  res.turnos.slice(0, ate + 1).forEach(turn => {
    const atkId = turn.atacante.id,
      defId = turn.defensor.id;
    const heroAtk = heroes.find(h => h.id === atkId);
    if (!heroAtk) return;

    const abil = heroAtk.abilities[turn.abilKey];
    if (!abil) return;

    if (abil.cost > 0) {
      if (heroAtk.tipo === 'Mago') {
        state[atkId].mp = Math.max(0, state[atkId].mp - abil.cost);
      } else {
        state[atkId].sp = Math.max(0, state[atkId].sp - abil.cost);
      }
    }

    if (abil.type === 'def') {
      guard[atkId] = { rate: abil.guard || 0.35, turns: 1 };
      const cura = Math.floor(
        (heroAtk.tipo === 'Mago' ? state[atkId].mpMax : state[atkId].spMax) *
          (abil.heal || 0.2)
      );
      state[atkId].hp = Math.min(state[atkId].hpMax, state[atkId].hp + cura);
    } else {
      if (guard[defId]) {
        guard[defId].turns--;
        if (guard[defId].turns <= 0) delete guard[defId];
      }
      state[defId].hp = Math.max(0, state[defId].hp - turn.dano);

      if (turn.abilKey === 'attack') {
        const hpPercent = state[atkId].hp / state[atkId].hpMax;
        const energyRecovery = Math.floor((1 - hpPercent) * 20) + 10;
        if (heroAtk.tipo === 'Mago') {
          state[atkId].mp = Math.min(
            state[atkId].mpMax,
            state[atkId].mp + energyRecovery
          );
        } else {
          state[atkId].sp = Math.min(
            state[atkId].spMax,
            state[atkId].sp + energyRecovery
          );
        }
      }
    }
  });

  atualizarHUDCard(
    cardL,
    state[leftId].hp,
    state[leftId].hpMax,
    state[leftId].mp,
    state[leftId].mpMax,
    state[leftId].sp,
    state[leftId].spMax
  );
  atualizarHUDCard(
    cardR,
    state[rightId].hp,
    state[rightId].hpMax,
    state[rightId].mp,
    state[rightId].mpMax,
    state[rightId].sp,
    state[rightId].spMax
  );

  const heroL = heroes.find(h => h.id === leftId);
  const heroR = heroes.find(h => h.id === rightId);
  if (heroL) {
    heroL.hp = state[leftId].hp;
    heroL.mp = state[leftId].mp;
    heroL.sp = state[leftId].sp;
  }
  if (heroR) {
    heroR.hp = state[rightId].hp;
    heroR.mp = state[rightId].mp;
    heroR.sp = state[rightId].sp;
  }

  updateXP(cardL, hL);
  updateXP(cardR, hR);
}

function finalizarCombate(res) {
  ui.log([
    `<span class="title">Resultado Final</span>`,
    `Vencedor: ${res.vencedor.nome}!`,
  ]);

  const heroVencedor = heroes.find(h => h.nome === res.vencedor.nome);
  const heroPerdedor = heroes.find(h => h.nome === res.perdedor.nome);

  if (heroVencedor) {
    heroVencedor.addXP(50);
    console.log(`${heroVencedor.nome} ganhou 50 XP!`);

    const cardArenaL = duelL.querySelector('.card-container');
    const cardArenaR = duelR.querySelector('.card-container');
    if (cardArenaL && cardArenaL.dataset.id === heroVencedor.id) {
      updateXP(cardArenaL, heroVencedor);
    }
    if (cardArenaR && cardArenaR.dataset.id === heroVencedor.id) {
      updateXP(cardArenaR, heroVencedor);
    }
  }

  if (heroPerdedor) {
    heroPerdedor.addXP(10);
    console.log(`${heroPerdedor.nome} ganhou 10 XP!`);

    const cardArenaL = duelL.querySelector('.card-container');
    const cardArenaR = duelR.querySelector('.card-container');
    if (cardArenaL && cardArenaL.dataset.id === heroPerdedor.id) {
      updateXP(cardArenaL, heroPerdedor);
    }
    if (cardArenaR && cardArenaR.dataset.id === heroPerdedor.id) {
      updateXP(cardArenaR, heroPerdedor);
    }
  }

  setTimeout(() => {
    stage.classList.add('resolved');
    setTimeout(() => {
      if (res.vencedor.id === res.turnos[0].atacante.id) {
        duelL.classList.add('winner');
        duelR.classList.add('loser');
      } else {
        duelR.classList.add('winner');
        duelL.classList.add('loser');
      }

      setTimeout(() => {
        restoreHeroStats();
        updateAllCards();
      }, 2000);
    }, 100);
    setTimeout(() => {
      battleLog.classList.add('fade-out');
      setTimeout(() => (battleLog.innerHTML = ''), 500);
    }, 2000);
  }, 900);
}

function restoreHeroStats() {
  heroes.forEach(hero => {
    hero.hp = hero.hpMax;
    if (hero.tipo === 'Mago') {
      hero.mp = hero.mpMax;
    } else {
      hero.mp = 0;
      hero.sp = hero.spMax;
    }
    console.log(
      `Restaurando ${hero.nome}: HP=${hero.hp}/${hero.hpMax}, MP=${hero.mp}/${hero.mpMax}, SP=${hero.sp}/${hero.spMax}`
    );
  });
}

function resetArena() {
  arena.classList.remove('show');
  stage.classList.remove('resolved');
  battleLog.innerHTML = '';
  battleLog.classList.remove('fade-out');
  [duelL, duelR].forEach((d, i) => {
    d.classList.remove(
      'winner',
      'loser',
      'on-top',
      'fx-shield',
      'fx-hit',
      'enter-left',
      'enter-right'
    );
    d.style.right = '';
    d.style.left = i === 0 ? '40px' : 'calc(100% - 40px - 420px)';
    d.style.transform = 'translateY(-50%)';
    const inner = d.querySelector('.duelist-inner');
    if (inner) {
      inner.classList.remove('attack-left', 'attack-right');
      forceResetInner(inner);
    }
  });

  setTimeout(() => {
    restoreHeroStats();
    updateAllCards();
  }, 100);
}

function resetAllLevels() {
  if (confirm('Tem certeza que deseja resetar todos os níveis dos heróis?')) {
    heroes.forEach(hero => {
      hero.level = 1;
      hero.xp = 0;
      hero.xpToNext = 100;
      hero.hp = hero.hpMax;
      if (hero.tipo === 'Mago') {
        hero.mp = hero.mpMax;
      } else {
        hero.mp = 0;
        hero.sp = hero.spMax;
      }
      hero.saveToCache();
    });
    render();
    console.log('Todos os níveis foram resetados!');
  }
}

document.getElementById('btnStart').addEventListener('click', iniciarCombate);
document.getElementById('btnAgain').addEventListener('click', iniciarCombate);
document.getElementById('btnClose').addEventListener('click', resetArena);
document.getElementById('btnReset').addEventListener('click', resetAllLevels);
window.addEventListener('resize', () => {
  if (arena.classList.contains('show')) positionBattleLog();
});
document.addEventListener('DOMContentLoaded', loadHeroesData);
