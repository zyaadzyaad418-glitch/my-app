// Demo trading front-end (fake data)
const balanceEl = document.getElementById('balance');
const lastPriceEl = document.getElementById('lastPrice');
const asksList = document.getElementById('asksList');
const bidsList = document.getElementById('bidsList');
const tradeFeed = document.getElementById('tradeFeed');
const qtyInput = document.getElementById('qty');
const priceInput = document.getElementById('price');
const buyBtn = document.getElementById('buyBtn');
const sellBtn = document.getElementById('sellBtn');

let balance = 1000.00; // USDT demo
let price = 30000; // starting price
let chart;
let priceHistory = [];

// utils
function rand(min,max){ return Math.random()*(max-min)+min; }
function format(n){ return Number(n).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:8}); }

// init sample orderbook
let asks = [], bids = [];
function genOrderbook(center){
  asks = []; bids = [];
  for(let i=1;i<=12;i++){
    asks.push({price: +(center + i*rand(0.3,2)).toFixed(2), amount: +(rand(0.001,0.5)).toFixed(4)});
    bids.push({price: +(center - i*rand(0.3,2)).toFixed(2), amount: +(rand(0.001,0.5)).toFixed(4)});
  }
  asks.sort((a,b)=>a.price-b.price);
  bids.sort((a,b)=>b.price-a.price);
}
genOrderbook(price);

// render orderbook
function renderBook(){
  asksList.innerHTML = ''; bidsList.innerHTML = '';
  asks.slice(0,8).forEach(a=>{
    const li = document.createElement('li'); li.className='ask';
    li.innerHTML = `<span>${a.price.toFixed(2)}</span><span>${a.amount}</span>`;
    asksList.appendChild(li);
  });
  bids.slice(0,8).forEach(b=>{
    const li = document.createElement('li'); li.className='bid';
    li.innerHTML = `<span>${b.price.toFixed(2)}</span><span>${b.amount}</span>`;
    bidsList.appendChild(li);
  });
}

// trade feed
function pushTrade(side, pr, amount){
  const li = document.createElement('li');
  const t = new Date().toLocaleTimeString();
  li.textContent = `[${t}] ${side==='buy'?'شراء':'بيع'} ${amount} BTC @ ${pr.toFixed(2)} USDT`;
  tradeFeed.prepend(li);
  while(tradeFeed.children.length>40) tradeFeed.removeChild(tradeFeed.lastChild);
}

// chart init
function initChart(){
  const ctx = document.getElementById('priceChart').getContext('2d');
  // seed history
  priceHistory = [];
  let p = price;
  for(let i=0;i<40;i++){
    p = +(p + rand(-100,100)).toFixed(2);
    priceHistory.push(p);
  }
  chart = new Chart(ctx, {
    type:'line',
    data:{
      labels: Array.from({length:priceHistory.length},(_,i)=>i),
      datasets:[{
        label:'BTC/USDT',
        data: priceHistory,
        borderColor: '#1e90ff',
        backgroundColor: 'rgba(30,144,255,0.08)',
        pointRadius:0,
        tension:0.2
      }]
    },
    options:{
      plugins:{legend:{display:false}},
      scales:{x:{display:false}, y:{grid:{color:'rgba(255,255,255,0.03)'}}
    }
  });
  updateTicker();
}

// update ticker displayed price and chart with new value
function updateTicker(){
  lastPriceEl.textContent = format(price);
  // push new data and update chart
  priceHistory.push(price);
  if(priceHistory.length>60) priceHistory.shift();
  chart.data.datasets[0].data = priceHistory;
  chart.update('none');
}

// simulate market ticks
function marketTick(){
  // small random walk
  const delta = rand(-150,150);
  price = +(Math.max(100, price + delta)).toFixed(2);
  // adjust orderbook around price
  genOrderbook(price);
  renderBook();
  updateTicker();
  // occasionally push simulated trade
  if(Math.random()<0.8){
    const side = Math.random() > 0.5 ? 'buy' : 'sell';
    const amt = +(rand(0.0005,0.8)).toFixed(4);
    pushTrade(side, price, amt);
  }
}
// start ticks
initChart();
renderBook();
setInterval(marketTick, 2500 + Math.random()*1600);

// handle user buy/sell
buyBtn.addEventListener('click', ()=>{
  const qty = parseFloat(qtyInput.value)||0;
  const pr = parseFloat(priceInput.value)||price;
  const cost = qty * pr;
  if(qty<=0){ alert('أدخل كمية صحيحة'); return; }
  if(cost > balance){ alert('الرصيد غير كافٍ'); return; }
  balance = +(balance - cost).toFixed(2);
  balanceEl.textContent = format(balance);
  price = +pr; // market moves to this price
  pushTrade('buy', pr, qty);
  // add executed order to bids/asks to visualize fill
  bids.unshift({price: pr, amount: qty});
  renderBook();
  updateTicker();
});

sellBtn.addEventListener('click', ()=>{
  const qty = parseFloat(qtyInput.value)||0;
  const pr = parseFloat(priceInput.value)||price;
  if(qty<=0){ alert('أدخل كمية صحيحة'); return; }
  // in demo we allow selling (even without BTC wallet) — add proceeds
  const proceeds = +(qty * pr).toFixed(2);
  balance = +(balance + proceeds).toFixed(2);
  balanceEl.textContent = format(balance);
  price = +pr;
  pushTrade('sell', pr, qty);
  asks.unshift({price: pr, amount: qty});
  renderBook();
  updateTicker();
});

// convenience: click on orderbook price to fill price field
asksList.addEventListener('click', e=>{
  const li = e.target.closest('li');
  if(!li) return;
  const p = parseFloat(li.firstElementChild.textContent);
  if(p) priceInput.value = p;
});
bidsList.addEventListener('click', e=>{
  const li = e.target.closest('li');
  if(!li) return;
  const p = parseFloat(li.firstElementChild.textContent);
  if(p) priceInput.value = p;
});
