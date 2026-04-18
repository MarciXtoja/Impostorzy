const WORDS = {
  all: [
    {innocent: 'Pizza', impostor: ['Okrągłe', 'ciasto', 'ser', 'sos']},
    {innocent: 'Hamburger', impostor: ['Chleb', 'mięso', 'kotlet']},
    {innocent: 'Lody', impostor: ['Mrożone', 'słodkie', 'łyżka']},
    {innocent: 'Sushi', impostor: ['Ryż', 'ryba', 'wodorosty']},
    {innocent: 'Kawa', impostor: ['Gorąca', 'napój', 'kofeina']},
    {innocent: 'Czekolada', impostor: ['Słodka', 'kakao', 'brąz']},
    {innocent: 'Frytki', impostor: ['Smażone', 'ziemniaki', 'paski']},
    {innocent: 'Zapiekanka', impostor: ['Baguette', 'ser', 'sos']},
    {innocent: 'Pies', impostor: ['Czworonóg', 'ogon', 'szczekanie']},
    {innocent: 'Kot', impostor: ['Czworonóg', 'miauczenie', 'niezależny']},
    {innocent: 'Słoń', impostor: ['Szary', 'trąba', 'gigant']},
    {innocent: 'Żyrafa', impostor: ['Wysoka', 'szyja', 'plamy']},
    {innocent: 'Pingwin', impostor: ['Czarno-biały', 'ptak', 'lód']},
    {innocent: 'Delfin', impostor: ['Morski', 'inteligentny', 'dziób']},
    {innocent: 'Orzeł', impostor: ['Ptak', 'szpony', 'latanie']},
    {innocent: 'Królik', impostor: ['Futrzak', 'uszy', 'skok']},
    {innocent: 'Plaża', impostor: ['Piasek', 'morze', 'słoneczko']},
    {innocent: 'Zamek', impostor: ['Mury', 'wieże', 'fortyfikacja']},
    {innocent: 'Las', impostor: ['Drzewa', 'gęsty', 'zielony']},
    {innocent: 'Góry', impostor: ['Wysokie', 'szczyty', 'wspinaczka']},
    {innocent: 'Biblioteka', impostor: ['Książki', 'publiczna', 'cicho']},
    {innocent: 'Stadion', impostor: ['Duża', 'arena', 'sport']},
    {innocent: 'Lotnisko', impostor: ['Samoloty', 'terminal', 'pasażerowie']},
    {innocent: 'Rynek', impostor: ['Handlowe', 'straganki', 'ludzie']},
    {innocent: 'Piłka nożna', impostor: ['Piłka', 'drużyny', 'bramka', 'kopanie']},
    {innocent: 'Koszykówka', impostor: ['Piłka', 'koszyk', 'odbijanie']},
    {innocent: 'Tenis', impostor: ['Rakieta', 'piłka', 'kort', 'siatka']},
    {innocent: 'Pływanie', impostor: ['Woda', 'ruch', 'sport']},
    {innocent: 'Narciarstwo', impostor: ['Śnieg', 'narty', 'zjazd']},
    {innocent: 'Boks', impostor: ['Pięści', 'ring', 'walka']},
    {innocent: 'Golf', impostor: ['Piłka', 'dziura', 'pas']},
    {innocent: 'Kolarstwo', impostor: ['Rower', 'jazda', 'trasa']},
    {innocent: 'Titanic', impostor: ['Statek', 'lód', 'tonięcie']},
    {innocent: 'Matrix', impostor: ['Maszyny', 'sztuczny', 'świat']},
    {innocent: 'Avatar', impostor: ['Niebieski', 'humanoidy', 'planeta']},
    {innocent: 'Harry Potter', impostor: ['Czarodziej', 'mały', 'zło']},
    {innocent: 'Shrek', impostor: ['Ogr', 'zielony', 'księżniczka']},
    {innocent: 'Star Wars', impostor: ['Miecze', 'świetlne', 'epoka']},
    {innocent: 'Hobbit', impostor: ['Mały', 'pierścień', 'zagubiony']},
    {innocent: 'Interstellar', impostor: ['Czarna', 'dziura', 'gwiazdy']},
    {innocent: 'Telefon', impostor: ['Rozmowy', 'wiadomości', 'ekran']},
    {innocent: 'Samochód', impostor: ['Pojazd', 'koła', 'silnik']},
    {innocent: 'Gitara', impostor: ['Instrument', 'struny', 'muzyka']},
    {innocent: 'Zegarek', impostor: ['Czas', 'noszony', 'nadgarstek']},
    {innocent: 'Lampa', impostor: ['Oświetlenie', 'elektryczna', 'pokój']},
    {innocent: 'Klucz', impostor: ['Metal', 'drzwi', 'otwarcie']},
    {innocent: 'Parasol', impostor: ['Deszcz', 'ochrona', 'składany']},
    {innocent: 'Piłka', impostor: ['Okrągła', 'zabawa', 'sport']}
  ]
};

let players=[], impostorIndices=[], normalWord='', impostorWords={};
let currentTurn=0, playerOrder=[], voteMap={}, voterIndex=0, timerInterval=null;
let selectedMinutes=5, kickedPlayer=null, eliminatedPlayers=[];

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
  const pair = WORDS.all[Math.floor(Math.random()*WORDS.all.length)];
  normalWord = pair.innocent;
  
  // Fisher-Yates shuffle for truly random impostor selection
  const indices = [...Array(players.length).keys()];
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  impostorIndices = indices.slice(0, impostorCount);
  
  // Assign each impostor a different random word from the impostor array
  impostorWords = {};
  const impostorWordPool = [...pair.impostor];
  impostorIndices.forEach(idx => {
    const randomIdx = Math.floor(Math.random() * impostorWordPool.length);
    impostorWords[idx] = impostorWordPool[randomIdx];
    impostorWordPool.splice(randomIdx, 1); // Remove to avoid same word twice
  });
  
  eliminatedPlayers = [];
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
  const wordEl = document.getElementById('role-word');
  if (isImpostor) {
    wordEl.textContent = impostorWords[currentTurn];
  } else {
    wordEl.textContent = normalWord;
  }
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
  const activePlayers = players.filter(p => !eliminatedPlayers.includes(p));
  const activePlayerOrder = playerOrder.filter(p => !eliminatedPlayers.includes(p));
  
  document.getElementById('speak-order').innerHTML = activePlayerOrder.map((p,i) =>
    `<div style="padding:8px 0;border-bottom:1px solid #22223a;color:#e8e8ff;font-size:0.95rem">${i+1}. ${p}</div>`
  ).join('');

  // Kick list
  document.getElementById('kick-list').innerHTML = activePlayers.map(p =>
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
  const isImpostor = impostorNames.includes(name);
  const stillActiveImpostors = impostorNames.filter(n => !eliminatedPlayers.includes(n) && n !== name).length;

  document.getElementById('result-voted').innerHTML =
    `<div class="result-banner">Wyrzucono ze społeczności:</div><div class="result-big" style="color:#ff4466">${name}</div>`;
  document.getElementById('result-impostors').innerHTML =
    `<div class="result-banner">Impostorów pozostało: <strong>${stillActiveImpostors}</strong></div>`;
  document.getElementById('result-words').innerHTML = '';
  document.getElementById('impostor-guess-input').value='';
  
  // Mark player as eliminated
  eliminatedPlayers.push(name);
  
  // Check win conditions
  const activePlayers = players.filter(p => !eliminatedPlayers.includes(p));
  const remainingInnocents = activePlayers.length - stillActiveImpostors;
  
  if (stillActiveImpostors === 0 && !isImpostor) {
    // All impostors eliminated - innocents win
    document.getElementById('guess-section').style.display = 'none';
    document.getElementById('final-verdict').style.display = 'block';
    document.getElementById('verdict-text').innerHTML =
      `<div class="result-big" style="color:#44ccff">🔵 Gracze wygrywają!</div><p>Wszyscy impostorzy zostali wyeliminowani!</p>`;
    
    const resultsScreen = document.getElementById('screen-results');
    const continueBtn = resultsScreen.querySelector('.btn-secondary');
    continueBtn.textContent = 'NOWA GRA';
    continueBtn.onclick = () => resetGame();
  } else if (isImpostor) {
    // Impostor kicked - they get to guess
    document.getElementById('guess-section').style.display = 'block';
    document.getElementById('final-verdict').style.display = 'none';
  } else if (stillActiveImpostors >= remainingInnocents) {
    // Impostors equal or outnumber innocents - impostors win
    document.getElementById('guess-section').style.display = 'none';
    document.getElementById('final-verdict').style.display = 'block';
    document.getElementById('verdict-text').innerHTML =
      `<div class="result-big" style="color:#ff4466">🔴 Impostor wygrywa!</div><p>Impostorów jest tyle samo lub więcej niż graczy!</p>`;
    
    const resultsScreen = document.getElementById('screen-results');
    const continueBtn = resultsScreen.querySelector('.btn-secondary');
    continueBtn.textContent = 'NOWA GRA';
    continueBtn.onclick = () => resetGame();
  } else {
    // Game continues
    document.getElementById('guess-section').style.display = 'none';
    document.getElementById('final-verdict').style.display = 'block';
    document.getElementById('verdict-text').innerHTML =
      `<div class="result-big" style="color:#ffaa44">Gra trwa...</div><p>${name} został wyrzucony!</p>`;
    
    const resultsScreen = document.getElementById('screen-results');
    const continueBtn = resultsScreen.querySelector('.btn-secondary');
    continueBtn.textContent = 'WZNÓW DYSKUSJĘ →';
    continueBtn.onclick = () => showGameScreen();
  }
  
  voterIndex=0; voteMap={};
  showScreen('screen-results');
}

function goToVote() {
  if (timerInterval) clearInterval(timerInterval);
  voterIndex=0; voteMap={};
  const activePlayers = players.filter(p => !eliminatedPlayers.includes(p));
  document.getElementById('vote-buttons').innerHTML = activePlayers.map(p =>
    `<button class="vote-btn" onclick="castVote('${p.replace(/'/g,"\\'")}')">
      <span>${p}</span><span class="votes" id="vote-${p.replace(/\s/g,'_')}">0</span>
    </button>`
  ).join('');
  // Store active player count for vote limit
  window.activePlayerCount = activePlayers.length;
  showScreen('screen-vote');
}

function castVote(target) {
  if (voterIndex >= window.activePlayerCount) return;
  voteMap[target] = (voteMap[target]||0)+1;
  document.getElementById('vote-'+target.replace(/\s/g,'_')).textContent = voteMap[target];
  voterIndex++;
  if (voterIndex >= window.activePlayerCount) document.querySelectorAll('.vote-btn').forEach(b=>b.disabled=true);
}

function showResults() {
  let maxVotes=0, votedOut=[];
  for (const [p,v] of Object.entries(voteMap)) {
    if (v>maxVotes){maxVotes=v;votedOut=[p];}
    else if(v===maxVotes) votedOut.push(p);
  }
  
  // Check for tie
  if (votedOut.length > 1) {
    document.getElementById('result-voted').innerHTML =
      `<div class="result-banner">Remis!</div><div class="result-big" style="color:#ffaa44">Nikt nie został wyrzucony</div>`;
    document.getElementById('result-impostors').innerHTML =
      `<div class="result-banner">Głosy:</div>`;
    document.getElementById('result-words').innerHTML = '';
    
    // Show vote breakdown
    let voteBreakdown = '';
    for (const [p,v] of Object.entries(voteMap)) {
      voteBreakdown += `<div style="padding:8px 0;border-bottom:1px solid #22223a">${p}: <strong>${v}</strong></div>`;
    }
    document.getElementById('result-impostors').innerHTML += voteBreakdown;
    
    document.getElementById('guess-section').style.display = 'none';
    document.getElementById('final-verdict').style.display = 'none';
    
    // Change button to continue discussion
    const resultsScreen = document.getElementById('screen-results');
    const continueBtn = resultsScreen.querySelector('.btn-secondary');
    continueBtn.textContent = 'WZNÓW DYSKUSJĘ →';
    continueBtn.onclick = () => showGameScreen();
    
    voterIndex=0; voteMap={};
    showScreen('screen-results');
    return;
  }
  
  const impostorNames = impostorIndices.map(i=>players[i]);
  
  document.getElementById('result-voted').innerHTML =
    `<div class="result-banner">Wyrzucono ze społeczności:</div><div class="result-big" style="color:#ff4466">${votedOut.join(', ')}</div>`;
  document.getElementById('result-impostors').innerHTML =
    `<div class="result-banner">Impostorów pozostało: <strong>${0}</strong></div>`;
  document.getElementById('result-words').innerHTML = '';
  document.getElementById('impostor-guess-input').value='';
  
  // Remove voted out player(s) from the game
  votedOut.forEach(name => {
    if (!eliminatedPlayers.includes(name)) {
      eliminatedPlayers.push(name);
    }
  });
  
  // Check win conditions
  const stillActiveImpostors = impostorNames.filter(n => !eliminatedPlayers.includes(n)).length;
  const activePlayers = players.filter(p => !eliminatedPlayers.includes(p));
  const remainingInnocents = activePlayers.length - stillActiveImpostors;
  
  // Update impostor count display
  document.getElementById('result-impostors').innerHTML =
    `<div class="result-banner">Impostorów pozostało: <strong>${stillActiveImpostors}</strong></div>`;
  
  // Check if an impostor was voted out
  const votedOutImpostor = votedOut.find(name => impostorNames.includes(name));
  
  if (stillActiveImpostors === 0 && !votedOutImpostor) {
    // All impostors eliminated - innocents win
    document.getElementById('guess-section').style.display = 'none';
    document.getElementById('final-verdict').style.display = 'block';
    document.getElementById('verdict-text').innerHTML =
      `<div class="result-big" style="color:#44ccff">🔵 Gracze wygrywają!</div><p>Wszyscy impostorzy zostali wyeliminowani!</p>`;
    
    const resultsScreen = document.getElementById('screen-results');
    const continueBtn = resultsScreen.querySelector('.btn-secondary');
    continueBtn.textContent = 'NOWA GRA';
    continueBtn.onclick = () => resetGame();
  } else if (votedOutImpostor) {
    // Impostor voted out - they get to guess
    document.getElementById('guess-section').style.display = 'block';
    document.getElementById('final-verdict').style.display = 'none';
  } else if (stillActiveImpostors >= remainingInnocents) {
    // Impostors equal or outnumber innocents - impostors win
    document.getElementById('guess-section').style.display = 'none';
    document.getElementById('final-verdict').style.display = 'block';
    document.getElementById('verdict-text').innerHTML =
      `<div class="result-big" style="color:#ff4466">🔴 Impostor wygrywa!</div><p>Impostorów jest tyle samo lub więcej niż graczy!</p>`;
    
    const resultsScreen = document.getElementById('screen-results');
    const continueBtn = resultsScreen.querySelector('.btn-secondary');
    continueBtn.textContent = 'NOWA GRA';
    continueBtn.onclick = () => resetGame();
  } else {
    // Game continues
    document.getElementById('guess-section').style.display = 'none';
    document.getElementById('final-verdict').style.display = 'block';
    document.getElementById('verdict-text').innerHTML =
      `<div class="result-big" style="color:#ffaa44">Gra trwa...</div><p>${votedOut.join(', ')} został wyrzucony!</p>`;
    
    const resultsScreen = document.getElementById('screen-results');
    const continueBtn = resultsScreen.querySelector('.btn-secondary');
    continueBtn.textContent = 'WZNÓW DYSKUSJĘ →';
    continueBtn.onclick = () => showGameScreen();
  }
  
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
  impostorIndices=[]; normalWord=''; impostorWords={}; currentTurn=0; voterIndex=0; voteMap={}; kickedPlayer=null; eliminatedPlayers=[];
  if(timerInterval) clearInterval(timerInterval);
  document.getElementById('guess-section').style.display='none';
  document.getElementById('final-verdict').style.display='none';
  renderPlayers();
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