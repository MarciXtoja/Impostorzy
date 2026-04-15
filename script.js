const WORDS = {
  jedzenie: [['Pizza','Hamburger'],['Lody','Sorbet'],['Sushi','Pierogi'],['Kawa','Herbata'],['Czekolada','Karmel'],['Banan','Mango'],['Frytki','Chipsy'],['Zapiekanka','Hot dog']],
  zwierzeta: [['Pies','Wilk'],['Kot','Ryś'],['Słoń','Nosorożec'],['Żyrafa','Wielbłąd'],['Pingwin','Puffin'],['Delfin','Morświn'],['Orzeł','Sokół'],['Królik','Zając']],
  miejsca: [['Plaża','Wydma'],['Zamek','Pałac'],['Las','Dżungla'],['Góry','Wulkan'],['Biblioteka','Archiwum'],['Stadion','Arena'],['Lotnisko','Dworzec'],['Rynek','Plac']],
  sport: [['Piłka nożna','Rugby'],['Koszykówka','Siatkówka'],['Tenis','Badminton'],['Pływanie','Nurkowanie'],['Narciarstwo','Snowboard'],['Boks','Karate'],['Golf','Krykiet'],['Kolarstwo','Triathlon']],
  filmy: [['Titanic','Rejs'],['Matrix','Inception'],['Avatar','Dune'],['Harry Potter','Percy Jackson'],['Shrek','Kung Fu Panda'],['Star Wars','Star Trek'],['Hobbit','Eragon'],['Interstellar','Gravity']],
  przedmioty: [['Telefon','Tablet'],['Samochód','Motocykl'],['Gitara','Skrzypce'],['Zegarek','Kompas'],['Lampa','Świecznik'],['Klucz','Śrubokręt'],['Parasol','Płaszcz'],['Piłka','Balon']]
};
const CATEGORIES = Object.keys(WORDS);
const CAT_NAMES = {jedzenie:'🍕 Jedzenie',zwierzeta:'🐾 Zwierzęta',miejsca:'🌍 Miejsca',sport:'⚽ Sport',filmy:'🎬 Filmy',przedmioty:'📦 Przedmioty'};

let players=[], impostorIndices=[], normalWord='', impostorWord='', category='';
let currentTurn=0, playerOrder=[], voteMap={}, voterIndex=0, timerInterval=null;
let selectedMinutes=5, kickedPlayer=null;

function selectTime(min) {
  selectedMinutes = min;
  document.querySelectorAll('.time-opt').forEach(el => {
    el.classList.toggle('selected', parseInt(el.textContent) === min);
  });
}

function addPlayer() {
  const input = document.getElementById('player-input');
  const name = input.value.trim();
  if (!name || players.includes(name)) return;
  players.push(name);
  input.value = '';
  renderPlayers();
  input.focus();
}
document.getElementById('player-input').addEventListener('keydown', e => { if(e.key==='Enter') addPlayer(); });

function renderPlayers() {
  document.getElementById('players-list').innerHTML = players.map((p,i) =>
    `<div class="player-tag">${p} <span class="remove" onclick="removePlayer(${i})">✕</span></div>`
  ).join('');
}
function removePlayer(i) { players.splice(i,1); renderPlayers(); }

function startGame() {
  if (players.length < 3) { alert('Dodaj co najmniej 3 graczy!'); return; }
  const impostorCount = Math.min(parseInt(document.getElementById('impostor-count').value)||1, Math.floor(players.length/2));
  let cat = document.getElementById('category-select').value;
  if (cat==='random') cat = CATEGORIES[Math.floor(Math.random()*CATEGORIES.length)];
  category = cat;
  const pair = WORDS[cat][Math.floor(Math.random()*WORDS[cat].length)];
  const flip = Math.random()<0.5;
  normalWord = flip ? pair[0] : pair[1];
  impostorWord = flip ? pair[1] : pair[0];
  const shuffled = players.map((_,i)=>i).sort(()=>Math.random()-0.5);
  impostorIndices = shuffled.slice(0, impostorCount);
  voteMap={}; voterIndex=0; currentTurn=0; kickedPlayer=null;
  playerOrder = [...players].sort(()=>Math.random()-0.5);
  showPassScreen();
}

function showPassScreen() {
  if (currentTurn >= players.length) { showGameScreen(); return; }
  document.getElementById('pass-count').textContent = `Gracz ${currentTurn+1} z ${players.length}`;
  document.getElementById('pass-to').textContent = players[currentTurn];
  showScreen('screen-pass');
}

function showRole() {
  const isImpostor = impostorIndices.includes(currentTurn);
  document.getElementById('role-emoji').textContent = isImpostor ? '🔴' : '🔵';
  const label = document.getElementById('role-label');
  label.textContent = isImpostor ? 'IMPOSTOR' : 'GRACZ';
  label.className = 'role-label ' + (isImpostor ? 'impostor' : 'gracz');
  document.getElementById('role-category').textContent = CAT_NAMES[category]||category;
  const wordEl = document.getElementById('role-word');
  wordEl.textContent = isImpostor ? impostorWord : normalWord;
  wordEl.classList.add('word-hidden');
  wordEl.classList.remove('revealed');
  wordEl.style.cursor = 'pointer';
  document.getElementById('role-hint').textContent = isImpostor
    ? '🕵️ Jesteś impostorem! Ukryj się. Możesz zgadnąć prawdziwe hasło po głosowaniu.'
    : '✅ Pamiętaj swoje hasło i opisz je tak, żeby impostor nie zgadł!';
  showScreen('screen-role');
}

function revealWord(el) {
  el.classList.toggle('revealed');
  el.classList.toggle('word-hidden');
  if (el.classList.contains('revealed')) el.style.cursor='default';
}

function nextTurn() {
  currentTurn++;
  currentTurn < players.length ? showPassScreen() : showGameScreen();
}

function showGameScreen() {
  document.getElementById('speak-order').innerHTML = playerOrder.map((p,i) =>
    `<div style="padding:8px 0;border-bottom:1px solid #22223a;color:#e8e8ff;font-size:0.95rem">${i+1}. ${p}</div>`
  ).join('');

  // Kick list
  document.getElementById('kick-list').innerHTML = players.map(p =>
    `<div class="kick-btn" id="kick-row-${p.replace(/\s/g,'_')}">
      <span>${p}</span>
      <button class="kick-x" onclick="kickPlayer('${p.replace(/'/g,"\\'")}')">WYWAL</button>
    </div>`
  ).join('');

  // Timer
  const totalSec = selectedMinutes * 60;
  let remaining = totalSec;
  const circumference = 2 * Math.PI * 70;
  const arc = document.getElementById('timer-arc');
  arc.style.strokeDasharray = circumference;
  arc.classList.remove('urgent');

  function updateTimer() {
    const frac = remaining / totalSec;
    arc.style.strokeDashoffset = circumference * (1 - frac);
    const m = Math.floor(remaining / 60);
    const s = remaining % 60;
    const digits = document.getElementById('timer-digits');
    digits.textContent = m + ':' + String(s).padStart(2,'0');
    if (remaining <= 30) {
      arc.classList.add('urgent');
      digits.classList.add('urgent');
    }
    if (remaining <= 0) {
      clearInterval(timerInterval);
      document.getElementById('timer-digits').textContent = '0:00';
      goToVote();
    }
    remaining--;
  }

  if (timerInterval) clearInterval(timerInterval);
  updateTimer();
  timerInterval = setInterval(updateTimer, 1000);

  showScreen('screen-game');
}

function kickPlayer(name) {
  if (timerInterval) clearInterval(timerInterval);
  kickedPlayer = name;
  const safeId = name.replace(/\s/g,'_');
  document.querySelectorAll('.kick-btn').forEach(b => b.classList.add('kicked'));
  document.getElementById('kick-row-'+safeId).style.borderColor = '#ff4466';
  document.getElementById('kick-row-'+safeId).style.opacity = '1';
  document.getElementById('kick-row-'+safeId).querySelector('.kick-x').textContent = 'WYWALONY';

  // Auto-go to results after 1.5s
  setTimeout(() => {
    showKickResults(name);
  }, 1500);
}

function showKickResults(name) {
  const impostorNames = impostorIndices.map(i => players[i]);
  const caught = impostorNames.includes(name);

  document.getElementById('result-voted').innerHTML =
    `<div class="result-banner">Wyrzucono ze społeczności:</div><div class="result-big" style="color:#ff4466">${name}</div>`;
  document.getElementById('result-impostors').innerHTML =
    `<div class="result-banner">Impostor${impostorNames.length>1?'zy':''}:</div><div class="result-big" style="color:#ff4466">${impostorNames.join(', ')}</div>`;
  document.getElementById('result-words').innerHTML =
    `<div class="result-banner">Hasło graczy: <strong style="color:#cc88ff">${normalWord}</strong></div>
     <div class="result-banner" style="margin-top:4px">Hasło impostora: <strong style="color:#ff4466">${impostorWord}</strong></div>`;
  document.getElementById('impostor-guess-input').value='';
  document.getElementById('guess-section').style.display = caught ? 'block' : 'none';
  document.getElementById('final-verdict').style.display = caught ? 'none' : 'block';
  if (!caught) document.getElementById('verdict-text').innerHTML =
    `<div class="result-big" style="color:#ff4466">🔴 Impostor wygrywa!</div><p>Wyrzucono niewinną osobę!</p>`;
  voterIndex=0; voteMap={};
  showScreen('screen-results');
}

function goToVote() {
  if (timerInterval) clearInterval(timerInterval);
  voterIndex=0; voteMap={};
  document.getElementById('vote-buttons').innerHTML = players.map(p =>
    `<button class="vote-btn" onclick="castVote('${p.replace(/'/g,"\\'")}')">
      <span>${p}</span><span class="votes" id="vote-${p.replace(/\s/g,'_')}">0</span>
    </button>`
  ).join('');
  showScreen('screen-vote');
}

function castVote(target) {
  if (voterIndex >= players.length) return;
  voteMap[target] = (voteMap[target]||0)+1;
  document.getElementById('vote-'+target.replace(/\s/g,'_')).textContent = voteMap[target];
  voterIndex++;
  if (voterIndex >= players.length) document.querySelectorAll('.vote-btn').forEach(b=>b.disabled=true);
}

function showResults() {
  let maxVotes=0, votedOut=[];
  for (const [p,v] of Object.entries(voteMap)) {
    if (v>maxVotes){maxVotes=v;votedOut=[p];}
    else if(v===maxVotes) votedOut.push(p);
  }
  const impostorNames = impostorIndices.map(i=>players[i]);
  const caught = votedOut.length===1 && impostorNames.includes(votedOut[0]);
  document.getElementById('result-voted').innerHTML =
    `<div class="result-banner">Wyrzucono ze społeczności:</div><div class="result-big" style="color:#ff4466">${votedOut.join(', ')}</div>`;
  document.getElementById('result-impostors').innerHTML =
    `<div class="result-banner">Impostor${impostorNames.length>1?'zy':''}:</div><div class="result-big" style="color:#ff4466">${impostorNames.join(', ')}</div>`;
  document.getElementById('result-words').innerHTML =
    `<div class="result-banner">Hasło graczy: <strong style="color:#cc88ff">${normalWord}</strong></div>
     <div class="result-banner" style="margin-top:4px">Hasło impostora: <strong style="color:#ff4466">${impostorWord}</strong></div>`;
  document.getElementById('impostor-guess-input').value='';
  document.getElementById('guess-section').style.display = caught ? 'block' : 'none';
  document.getElementById('final-verdict').style.display = caught ? 'none' : 'block';
  if (!caught) document.getElementById('verdict-text').innerHTML =
    `<div class="result-big" style="color:#ff4466">🔴 Impostor wygrywa!</div><p>Graczom nie udało się wykryć impostora.</p>`;
  voterIndex=0; voteMap={};
  showScreen('screen-results');
}

function checkGuess() {
  const guess = document.getElementById('impostor-guess-input').value.trim().toLowerCase();
  const correct = normalWord.toLowerCase();
  const win = guess===correct || correct.includes(guess) || guess.includes(correct);
  document.getElementById('guess-section').style.display='none';
  document.getElementById('final-verdict').style.display='block';
  document.getElementById('verdict-text').innerHTML = win
    ? `<div class="result-big" style="color:#ff4466">🔴 Impostor wygrywa!</div><p>Złapany, ale zgadł hasło: <strong>${normalWord}</strong>!</p>`
    : `<div class="result-big" style="color:#44ccff">🔵 Gracze wygrywają!</div><p>Impostor nie zgadł. Hasło to: <strong style="color:#cc88ff">${normalWord}</strong></p>`;
}

function resetGame() {
  players=[]; impostorIndices=[]; normalWord=''; impostorWord=''; currentTurn=0; voterIndex=0; voteMap={}; kickedPlayer=null;
  if(timerInterval) clearInterval(timerInterval);
  document.getElementById('players-list').innerHTML='';
  document.getElementById('guess-section').style.display='none';
  document.getElementById('final-verdict').style.display='none';
  showScreen('screen-setup');
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// Rejestracja Service Workera
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(()=>{});
  });
}