// بيانات تجريبية تُظهِر كيف يتصرف Dashboard — للتعلّم فقط
const usersEl = document.getElementById('users');
const depositsEl = document.getElementById('deposits');
const botsEl = document.getElementById('bots');
const profitEl = document.getElementById('profit');
const feedEl = document.getElementById('feed');
const refreshBtn = document.getElementById('refresh');

function rand(min, max){ return Math.floor(Math.random()*(max-min+1))+min; }

function generateDemo(){
  const users = rand(500, 5200);
  const deposits = (rand(1000, 120000) + Math.random()).toFixed(2);
  const bots = rand(1, 20);
  const profit = (Math.random()*500).toFixed(2);

  usersEl.textContent = users.toLocaleString();
  depositsEl.textContent = `${deposits} USDT`;
  botsEl.textContent = bots;
  profitEl.textContent = `${profit} USDT`;

  // سجل عمليات توضيحي
  feedEl.innerHTML = '';
  for(let i=0;i<8;i++){
    const t = new Date(Date.now() - rand(1,3600)*1000);
    const item = document.createElement('li');
    item.textContent = `[${t.toLocaleTimeString()}] مستخدم${rand(100,999)} - إيداع ${rand(1,5000)} USDT`;
    feedEl.appendChild(item);
  }
}

refreshBtn.addEventListener('click', () => {
  generateDemo();
  refreshBtn.textContent = 'تم التحديث';
  setTimeout(()=> refreshBtn.textContent='تحديث البيانات (توضيحي)',1200);
});

// تشغيل أولي
generateDemo();