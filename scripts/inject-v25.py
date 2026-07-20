#!/usr/bin/env python3
"""Inject HQ v2.5 Gate / Tips / Pipes into control-panel.html"""
from pathlib import Path
import re

path = Path(__file__).resolve().parent.parent / "control-panel.html"
html = path.read_text()

JS = r'''
/* ========== HQ v2.5: Gate · Tips · Pipes · Live metrics merge ========== */
const Tips = {
  el: null,
  init(){
    if(this.el) return;
    this.el = document.createElement('div');
    this.el.className = 'tip-bubble';
    this.el.id = 'tip-bubble';
    document.body.appendChild(this.el);
    document.addEventListener('pointerover', (e)=>{
      const t = e.target.closest('[data-tip]');
      if(!t) return;
      const tip = t.getAttribute('data-tip');
      if(!tip) return;
      const title = t.getAttribute('data-tip-title') || '';
      const advice = t.getAttribute('data-tip-advice') || '';
      this.show(e.clientX, e.clientY, tip, title, advice);
    });
    document.addEventListener('pointermove', (e)=>{
      if(this.el.classList.contains('show')) this.pos(e.clientX, e.clientY);
    });
    document.addEventListener('pointerout', (e)=>{
      if(e.target.closest('[data-tip]')) this.hide();
    });
  },
  show(x,y,body,title,advice){
    this.el.innerHTML = (title?('<div class="tip-title">'+title+'</div>'):'') +
      '<div>'+body+'</div>' +
      (advice?('<div class="tip-advice">💡 '+advice+'</div>'):'');
    this.el.classList.add('show');
    this.pos(x,y);
  },
  pos(x,y){
    const pad=14, w=this.el.offsetWidth||280, h=this.el.offsetHeight||80;
    let left=x+pad, top=y+pad;
    if(left+w > innerWidth-8) left = x-w-pad;
    if(top+h > innerHeight-8) top = y-h-pad;
    this.el.style.left = Math.max(8,left)+'px';
    this.el.style.top = Math.max(8,top)+'px';
  },
  hide(){ this.el.classList.remove('show'); }
};

const Gate = {
  KEY: 'hq_gate_v1',
  SESSION: 'hq_gate_session_v1',
  _key: null,
  cfg(){
    try{ return JSON.parse(localStorage.getItem(this.KEY)||'null'); }catch(_){ return null; }
  },
  isUnlocked(){ return sessionStorage.getItem(this.SESSION)==='1'; },
  async sha(buf){
    const h = await crypto.subtle.digest('SHA-256', buf);
    return [...new Uint8Array(h)].map(b=>b.toString(16).padStart(2,'0')).join('');
  },
  b64(u8){ let s=''; u8.forEach(b=>s+=String.fromCharCode(b)); return btoa(s); },
  unb64(s){ const bin=atob(s); const u=new Uint8Array(bin.length); for(let i=0;i<bin.length;i++) u[i]=bin.charCodeAt(i); return u; },
  async deriveBits(pw, saltU8){
    const enc = new TextEncoder();
    const base = await crypto.subtle.importKey('raw', enc.encode(pw), 'PBKDF2', false, ['deriveBits','deriveKey']);
    return crypto.subtle.deriveBits({name:'PBKDF2', salt:saltU8, iterations:120000, hash:'SHA-256'}, base, 256);
  },
  async deriveKey(pw, saltU8){
    const enc = new TextEncoder();
    const base = await crypto.subtle.importKey('raw', enc.encode(pw), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey({name:'PBKDF2', salt:saltU8, iterations:120000, hash:'SHA-256'}, base, {name:'AES-GCM', length:256}, false, ['encrypt','decrypt']);
  },
  async setup(){
    const p1 = document.getElementById('gate-pw1').value;
    const p2 = document.getElementById('gate-pw2').value;
    const hint = document.getElementById('gate-hint').value.trim();
    const err = document.getElementById('gate-err');
    if(!p1 || p1.length < 8){ err.textContent = 'Password min 8 characters'; return; }
    if(p1 !== p2){ err.textContent = 'Passwords do not match'; return; }
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const bits = new Uint8Array(await this.deriveBits(p1, salt));
    const hash = await this.sha(bits);
    localStorage.setItem(this.KEY, JSON.stringify({ v:1, salt: this.b64(salt), hash, hint }));
    this._key = await this.deriveKey(p1, salt);
    sessionStorage.setItem(this.SESSION, '1');
    err.textContent = '';
    toast('HQ password set — session unlocked','success');
    this.hide();
    await bootAfterGate();
  },
  async unlock(){
    const cfg = this.cfg();
    const err = document.getElementById('gate-err');
    if(!cfg){ err.textContent = 'No password configured'; return; }
    const pw = document.getElementById('gate-pw').value;
    if(!pw){ err.textContent = 'Enter password'; return; }
    try{
      const salt = this.unb64(cfg.salt);
      const bits = new Uint8Array(await this.deriveBits(pw, salt));
      const hash = await this.sha(bits);
      if(hash !== cfg.hash){ err.textContent = 'Wrong password'; return; }
      this._key = await this.deriveKey(pw, salt);
      sessionStorage.setItem(this.SESSION, '1');
      err.textContent = '';
      this.hide();
      await bootAfterGate();
    }catch(e){ err.textContent = 'Unlock failed: '+(e.message||e); }
  },
  lock(){
    sessionStorage.removeItem(this.SESSION);
    this._key = null;
    this.show();
    toast('HQ locked','info');
  },
  resetPrompt(){
    if(!confirm('Wipe gate password AND vault secrets on THIS browser? Cannot undo.')) return;
    localStorage.removeItem(this.KEY);
    localStorage.removeItem(Vault.KEY);
    localStorage.removeItem(Vault.KEY_ENC);
    sessionStorage.removeItem(this.SESSION);
    this._key = null;
    location.reload();
  },
  show(){
    document.body.classList.add('hq-locked');
    const g = document.getElementById('hq-gate');
    g.classList.remove('hidden');
    const cfg = this.cfg();
    const setup = document.getElementById('gate-setup');
    const unlock = document.getElementById('gate-unlock');
    if(!cfg){
      document.getElementById('gate-title').textContent = 'Create HQ password';
      document.getElementById('gate-sub').textContent = 'First visit on this browser: set a password so Vault keys stay private on the public site.';
      setup.classList.remove('hidden'); unlock.classList.add('hidden');
    } else {
      document.getElementById('gate-title').textContent = 'Unlock Give A Bit HQ';
      document.getElementById('gate-sub').textContent = 'Operator password protects Vault secrets. Metrics and graphs load after unlock.';
      setup.classList.add('hidden'); unlock.classList.remove('hidden');
      const hs = document.getElementById('gate-hint-show');
      hs.textContent = cfg.hint ? ('Hint: '+cfg.hint) : '';
      setTimeout(()=>document.getElementById('gate-pw') && document.getElementById('gate-pw').focus(), 100);
    }
    const chip = document.getElementById('gate-lock-chip');
    if(chip){ chip.textContent='locked'; chip.className='status-pill red shrink-0 lock-chip'; }
  },
  hide(){
    document.body.classList.remove('hq-locked');
    document.getElementById('hq-gate').classList.add('hidden');
    const chip = document.getElementById('gate-lock-chip');
    if(chip){ chip.textContent='unlocked'; chip.className='status-pill green shrink-0 lock-chip'; }
  },
  async ensure(){
    if(this.isUnlocked()){
      this.hide();
      return true;
    }
    this.show();
    return false;
  }
};

Vault.KEY_ENC = 'sovereign_deck_vault_enc_v1';
Vault.tab = function(name){
  document.querySelectorAll('.vault-tab').forEach(b=>b.classList.toggle('on', b.dataset.vtab===name));
  document.querySelectorAll('.vault-pane').forEach(p=>p.classList.remove('on'));
  if(name==='keys'){
    const a=document.getElementById('vp-keys'); if(a) a.classList.add('on');
    const b=document.getElementById('vp-keys-b'); if(b) b.classList.add('on');
  } else {
    const p=document.getElementById('vp-'+name); if(p) p.classList.add('on');
  }
};
(function wrapVault(){
  const _open = Vault.openModal.bind(Vault);
  Vault.openModal = function(){
    if(!Gate.isUnlocked()){ Gate.show(); toast('Unlock HQ first','info'); return; }
    _open();
    const sync = (id, val)=>{ const el=document.getElementById(id); if(el) el.value = val||''; };
    sync('vault-status-url-b', this.data.statusJsonUrl);
    sync('vault-satohash-api-b', this.data.satohashApi);
    sync('vault-nip05-url-b', this.data.nip05Url);
    sync('vault-satohash-metrics', this.data.satohashMetricsUrl||'https://api.satohash.io/metrics.json');
    sync('vault-thor-node', this.data.thorNodeUrl||'/metrics/thor-node.json');
    sync('vault-metrics-base', this.data.metricsBase||'/metrics');
    sync('vault-cf-note', this.data.cfNote);
    sync('vault-extra-a', this.data.extraA);
    sync('vault-extra-b', this.data.extraB);
    sync('vault-contact', this.data.contact);
    this.tab('keys');
  };
  const _save = Vault.save.bind(Vault);
  Vault.save = async function(){
    const pick = (ids)=>{
      for(const id of ids){ const el=document.getElementById(id); if(el && el.value.trim()) return el.value.trim(); }
      const el=document.getElementById(ids[0]); return el?el.value.trim():'';
    };
    this.data.statusJsonUrl = pick(['vault-status-url','vault-status-url-b']);
    this.data.satohashApi = pick(['vault-satohash-api','vault-satohash-api-b'])||'https://api.satohash.io';
    this.data.nip05Url = pick(['vault-nip05-url','vault-nip05-url-b'])||FEEDS_DEFAULT.nip05Url;
    const sm=document.getElementById('vault-satohash-metrics'); if(sm) this.data.satohashMetricsUrl=sm.value.trim()||'https://api.satohash.io/metrics.json';
    const th=document.getElementById('vault-thor-node'); if(th) this.data.thorNodeUrl=th.value.trim()||'/metrics/thor-node.json';
    const mb=document.getElementById('vault-metrics-base'); if(mb) this.data.metricsBase=mb.value.trim()||'/metrics';
    const cf=document.getElementById('vault-cf-note'); if(cf) this.data.cfNote=cf.value.trim();
    const ea=document.getElementById('vault-extra-a'); if(ea) this.data.extraA=ea.value.trim();
    const eb=document.getElementById('vault-extra-b'); if(eb) this.data.extraB=eb.value.trim();
    const ct=document.getElementById('vault-contact'); if(ct) this.data.contact=ct.value.trim();
    _save();
    await this.persistEnc();
  };
})();
Vault.persistEnc = async function(){
  try{
    if(!Gate._key) return;
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const pt = new TextEncoder().encode(JSON.stringify(this.data));
    const ct = new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM', iv}, Gate._key, pt));
    localStorage.setItem(this.KEY_ENC, JSON.stringify({ v:1, iv: Gate.b64(iv), ct: Gate.b64(ct) }));
  }catch(e){ console.warn('vault enc', e); }
};
Vault.loadEnc = async function(){
  try{
    if(!Gate._key) return false;
    const raw = localStorage.getItem(this.KEY_ENC); if(!raw) return false;
    const j = JSON.parse(raw);
    const iv = Gate.unb64(j.iv);
    const ct = Gate.unb64(j.ct);
    const pt = await crypto.subtle.decrypt({name:'AES-GCM', iv}, Gate._key, ct);
    const data = JSON.parse(new TextDecoder().decode(pt));
    this.data = Object.assign(this.data, data);
    this.persist();
    return true;
  }catch(e){ console.warn('vault dec', e); return false; }
};
Vault.exportEnc = function(){
  const blob = { exportedAt: new Date().toISOString(), note: 'Contains secrets — store offline', vault: this.data };
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([JSON.stringify(blob,null,2)],{type:'application/json'}));
  a.download='hq-vault-export-'+new Date().toISOString().slice(0,10)+'.json';
  a.click();
  toast('Vault exported — keep offline','info');
};
Vault.importEnc = function(ev){
  const f = ev.target.files && ev.target.files[0]; if(!f) return;
  const r = new FileReader();
  r.onload = ()=>{
    try{
      const j = JSON.parse(r.result);
      const data = j.vault || j;
      if(!data || typeof data !== 'object') throw new Error('bad file');
      this.data = Object.assign(this.data, data);
      this.persist();
      this.openModal();
      toast('Vault imported — click Save','success');
    }catch(e){ toast('Import failed: '+e.message,'error'); }
  };
  r.readAsText(f);
};

(function wrapMetrics(){
  const _meLoad = MetricsEngine.loadAll.bind(MetricsEngine);
  MetricsEngine.loadAll = async function(){
    await _meLoad();
    const p = PROJECTS.find(x=>x.id==='satohash');
    if(p){
      const candidates = [
        Vault.data.satohashMetricsUrl,
        'https://api.satohash.io/metrics.json',
        ...(p.metricsLiveCandidates||[]),
        '/metrics/satohash.json'
      ].filter(Boolean);
      for(const url of [...new Set(candidates)]){
        try{
          const r = await fetch(url + (url.includes('?')?'&':'?') + 't=' + Date.now(), { mode:'cors', cache:'no-store' });
          if(!r.ok) continue;
          const body = await r.json();
          if(body && (body.schema==='gab.product-metrics.v1' || body.kpis || body.productId==='satohash')){
            body.raw = Object.assign({}, body.raw||{}, { source: url, live: true });
            if(String(url).includes('api.satohash.io')) body.raw.demo = false;
            this.cache.satohash = body;
            const d = state.projects.satohash || (state.projects.satohash={id:'satohash'});
            d.metrics = body;
            break;
          }
        }catch(_){}
      }
    }
    this.renderNav();
    if(state.view==='metrics') this.renderBody();
    this.paintThorSummary();
    try{ Pipes.render(); }catch(_){}
  };
  const _spark = MetricsEngine.sparkline.bind(MetricsEngine);
  MetricsEngine.sparkline = function(series, w=280, h=56){
    if(!series || !series.points || series.points.length<2) return '';
    const pts = series.points;
    const vs = pts.map(p=>p.v);
    const min = Math.min(...vs), max = Math.max(...vs), span = (max-min)||1;
    const coords = pts.map((p,i)=>{
      const x = (i/(pts.length-1))*w;
      const y = h - ((p.v-min)/span)* (h-4) - 2;
      return [x,y];
    });
    const path = coords.map((c,i)=>(i?'L':'M')+c[0].toFixed(1)+','+c[1].toFixed(1)).join(' ');
    const area = path + ' L'+w+','+h+' L0,'+h+' Z';
    const color = series.color || 'var(--orange)';
    const last = pts[pts.length-1];
    const tip = series.label+': '+last.v+' '+(series.unit||'')+' · '+pts.length+' pts';
    return '<div class="mb-2 area-spark" data-tip="'+tip+'" data-tip-title="'+series.label+'" data-tip-advice="Rising slope = growth. Flat + high pending = calendar/fee pressure.">'+
      '<div class="flex justify-between text-[10px] mono text-[var(--ink-faint)] mb-0.5"><span>'+series.label+'</span><span>'+last.v+(series.unit?(' '+series.unit):'')+'</span></div>'+
      '<svg width="100%" height="'+h+'" viewBox="0 0 '+w+' '+h+'" preserveAspectRatio="none" class="block">'+
      '<path class="area" d="'+area+'" fill="'+color+'"/>'+
      '<path d="'+path+'" fill="none" stroke="'+color+'" stroke-width="2" vector-effect="non-scaling-stroke"/>'+
      '</svg></div>';
  };
})();

const Pipes = {
  render(){
    const board = document.getElementById('pipes-board');
    const advice = document.getElementById('advice-rail');
    if(!board) return;
    const sites = (state.statusFeed && state.statusFeed.sites) || {};
    const liveN = Object.values(sites).filter(s=>s && s.ok).length;
    const siteN = Object.values(sites).filter(s=>s && s.ok!=null).length;
    const sato = MetricsEngine.cache.satohash;
    const thor = MetricsEngine.thor;
    const apiOk = !!(state.satohash && (state.satohash.ok || state.satohash.metrics || (state.statusFeed && state.statusFeed.feeds && state.statusFeed.feeds.satohashApi && state.statusFeed.feeds.satohashApi.ok)));
    const wallets = PROJECTS.filter(p=>Vault.hasWallet(p.wallet)).length;
    const walletOk = PROJECTS.filter(p=>(state.projects[p.id]||{}).walletOk).length;
    const cards = [
      { n:'Suite sites', v: liveN+'/'+(siteN||PROJECTS.filter(p=>p.deployed).length), s: 'status.json', ok: liveN>0, tip:'Public product uptime from pinger', advice:'Red site → check CF Pages deploy' },
      { n:'Satohash API', v: apiOk?'live':'—', s: Vault.data.satohashApi||'api.satohash.io', ok: apiOk, tip:'Proof plane health', advice:'curl /health must 200' },
      { n:'Metrics env', v: sato?((sato.raw && (sato.raw.live || (sato.raw.source||'').includes('api')))?'LIVE':'cache'):'none', s: (sato && sato.schema)||'—', ok: !!sato, tip:'gab.product-metrics.v1 envelope', advice:'Prefer metrics.json over demo' },
      { n:'THOR node', v: (thor && thor.node && thor.node.status)||'—', s: (thor && thor.node && thor.node.hostLabel)||'snapshot', ok: !!(thor && thor.node && thor.node.status==='green'), tip:'Node aggregates JSON', advice:'Cron exporter keeps this fresh' },
      { n:'Vault keys', v: wallets+' set', s: walletOk+' balances', ok: wallets>0, tip:'LNbits invoice keys in browser', advice:'CORS if keys set but sats empty' },
      { n:'GitHub', v: Vault.hasGh()?'PAT':'public', s: state.ghRateRemaining!=null?('rate '+state.ghRateRemaining):'—', ok: true, tip:'Commits + CI + docs', advice:'PAT unlocks private + higher rate' },
      { n:'BTC FX', v: btcUsdPrice?('$'+(btcUsdPrice/1000).toFixed(1)+'k'):'—', s: (state.btcChange24h!=null?((state.btcChange24h>=0?'+':'')+state.btcChange24h.toFixed(2)+'%'):'CoinGecko'), ok: !!btcUsdPrice, tip:'Portfolio USD conversion', advice:'Manual FX in Vault if CG blocked' },
      { n:'Uptime pulse', v: (StatusHistory.uptimePct()!=null?StatusHistory.uptimePct()+'%':'—'), s: ((state.statusHist||[]).length)+' snaps', ok: true, tip:'Local suite live ratio history', advice:'Keep HQ open to accumulate' },
    ];
    board.innerHTML = cards.map(c=>
      '<div class="pipe-card" data-tip="'+c.tip+'" data-tip-title="'+c.n+'" data-tip-advice="'+c.advice+'">'+
      '<div class="pn"><span class="dot '+(c.ok?'dot-green':'dot-amber')+'" style="width:7px;height:7px;margin-right:4px"></span>'+c.n+'</div>'+
      '<div class="pv">'+c.v+'</div><div class="ps">'+c.s+'</div></div>'
    ).join('');
    if(advice){
      const items = [];
      if(wallets>0 && walletOk===0) items.push({t:'LNbits CORS', b:'Keys are set but no balances. Fix Access-Control-Allow-Origin for hq.giveabit.io on the node proxy.', c:'risk'});
      if(!apiOk) items.push({t:'Satohash API', b:'Health not green from this browser. Check api.satohash.io/health and CORS.', c:'risk'});
      if(sato && sato.raw && sato.raw.demo) items.push({t:'Demo metrics', b:'Satohash envelope still demo-shaped. Live metrics.json should set raw.demo=false.', c:'sky'});
      if(apiOk && sato && !(sato.raw && sato.raw.demo)) items.push({t:'Proof plane live', b:'Satohash metrics flowing. Mold stamps_total + confirm_rate into investor pitch.', c:'ok'});
      if(!Vault.hasGh()) items.push({t:'Add GitHub PAT', b:'Unlocks Actions status, private docs edit, higher API rate.', c:'sky'});
      if(!items.length) items.push({t:'All pipes quiet', b:'Suite looks healthy. Use Pitch (P) for partner view; Metrics (k) for deep KPIs.', c:'ok'});
      advice.innerHTML = items.map(i=>'<div class="advice-card '+i.c+'"><h4>'+i.t+'</h4><p>'+i.b+'</p></div>').join('');
    }
    const lb = document.getElementById('latency-bars');
    if(lb){
      const rows = Object.entries(sites).filter((pair)=>pair[1] && pair[1].ms!=null).sort((a,b)=>(b[1].ms||0)-(a[1].ms||0));
      const max = Math.max(1, ...rows.map(pair=>pair[1].ms||0));
      lb.innerHTML = rows.map(pair=>{
        const id=pair[0], s=pair[1];
        const p = PROJECTS.find(x=>x.id===id);
        const col = s.ok ? (s.ms<500?'var(--green)':s.ms<1200?'var(--amber)':'var(--red)') : 'var(--red)';
        return '<div class="latency-row" data-tip="'+(s.url||id)+' · HTTP '+(s.status||'—')+' · '+s.ms+'ms" data-tip-title="'+(p?p.name:id)+'" data-tip-advice="'+(s.ok?'Latency under 500ms is great for pitch.':'Site failed ping — check deploy.')+'">'+
          '<span class="nm">'+(p?p.name:id)+'</span>'+
          '<div class="trk"><div class="fl" style="width:'+((s.ms/max)*100)+'%;background:'+col+'"></div></div>'+
          '<span class="mono w-12 text-right">'+s.ms+'ms</span></div>';
      }).join('') || '<div class="text-xs text-[var(--ink-faint)]">No status.json latency yet — wait for pinger.</div>';
    }
    const ss = document.getElementById('sato-series');
    if(ss && sato){
      ss.innerHTML = (sato.series||[]).slice(0,4).map(s=>'<div class="glass-2 rounded p-2">'+MetricsEngine.sparkline(s, 320, 64)+'</div>').join('')
        || '<div class="text-xs text-[var(--ink-faint)]">No series in envelope</div>';
    }
  }
};

(function wrapCharts(){
  const _all = Charts.all.bind(Charts);
  Charts.uptime = function(){
    const c=document.getElementById('chart-uptime'); if(!c) return;
    const hist = state.statusHist || [];
    const ctx=c.getContext('2d');
    const dpr=window.devicePixelRatio||1;
    const W=c.clientWidth||300, H=c.clientHeight||200;
    c.width=W*dpr; c.height=H*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.clearRect(0,0,W,H);
    const faint=getComputedStyle(document.documentElement).getPropertyValue('--ink-faint').trim();
    if(hist.length<2){
      ctx.fillStyle=faint; ctx.font='12px IBM Plex Sans'; ctx.fillText('Collecting local uptime snapshots…', 12, H/2);
      return;
    }
    const pts = hist.slice(-48).map(h=>({ v: h.total? (h.live/h.total)*100 : 0 }));
    const green=getComputedStyle(document.documentElement).getPropertyValue('--green').trim()||'#1f6b3a';
    ctx.strokeStyle=green; ctx.lineWidth=2; ctx.beginPath();
    pts.forEach((p,i)=>{
      const x=(i/(pts.length-1))*(W-20)+10;
      const y=H-12-(p.v/100)*(H-24);
      if(i) ctx.lineTo(x,y); else ctx.moveTo(x,y);
    });
    ctx.stroke();
    const y99=H-12-(0.99)*(H-24);
    ctx.strokeStyle='rgba(0,0,0,.2)'; ctx.setLineDash([4,4]); ctx.beginPath(); ctx.moveTo(10,y99); ctx.lineTo(W-10,y99); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle=faint; ctx.font='10px IBM Plex Mono'; ctx.fillText('99%', 12, y99-4);
    const last=pts[pts.length-1].v;
    ctx.font='bold 14px IBM Plex Mono'; ctx.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--ink').trim();
    ctx.fillText(last.toFixed(1)+'% live', Math.max(12,W-110), 20);
  };
  Charts.all = function(){
    _all();
    this.uptime();
    try{ Pipes.render(); }catch(_){}
  };
})();

(function wrapTools(){
  ToolsHub.render = function(){
    const el = document.getElementById('tools-hub');
    if(!el) return;
    const groups = (this.data && this.data.groups) || [];
    if(!groups.length){
      el.innerHTML = '<span class="text-[var(--ink-faint)] text-xs">tools.json not loaded</span>';
      return;
    }
    el.innerHTML = groups.map(g =>
      '<div class="w-full" data-tip="'+(g.tip||'')+'" data-tip-title="'+g.label+'">'+
      '<div class="text-[9px] mono text-[var(--ink-faint)] mb-1">'+g.label+'</div>'+
      '<div class="tools-strip">'+(g.links||[]).map(l =>
        '<a href="'+l.url+'" target="_blank" rel="noopener" data-tip="'+(l.tip||l.name)+'" data-tip-title="'+l.name+'" data-tip-advice="'+(g.tip||'External tool')+'">'+l.name+'</a>'
      ).join('')+'</div></div>'
    ).join('');
  };
})();

UI.help = function(){
  document.getElementById('help-body').innerHTML = [
    ['/','Command search'],['g','Cards'],['l','List'],['p','Pipeline'],['y','Analytics + pipes'],['k','Metrics lab'],
    ['n','Network'],['t','Activity'],['m','Matrix'],['w','Wallets'],['d','Docs'],['a','Agents'],
    ['r','Refresh all pipes'],['v','Vault (keys)'],['P','Pitch mode'],['L','Lock HQ session'],
    ['?','This help'],['esc','Close overlays'],
    ['tip','Hover almost anything for advice'],
  ].map(pair=>'<span class="k">'+pair[0]+'</span><span>'+pair[1]+'</span>').join('');
  document.getElementById('help-backdrop').classList.remove('hidden');
};

document.addEventListener('keydown', e=>{
  if(typeof isTyping==='function' && isTyping()) return;
  if(e.key==='L' && !e.metaKey && !e.ctrlKey){ e.preventDefault(); Gate.lock(); }
});

let _booted = false;
async function bootAfterGate(){
  if(_booted) return;
  _booted = true;
  await Vault.loadEnc();
  Vault.updateStatusChip();
  await loadRegistry();
  Dash.loadCache();
  Dash.render();
  Dash.renderPortfolio();
  Dash.renderTicker();
  if(typeof Dash.renderInvestorStrip==='function') Dash.renderInvestorStrip();
  GrokUsage.render();
  OpsNotes.load();
  ToolsHub.load();
  try{ state.statusHist = JSON.parse(localStorage.getItem(StatusHistory.KEY)||'[]'); }catch(_){ state.statusHist=[]; }
  Charts.all();
  UI.clock(); setInterval(UI.clock,1000);
  setInterval(()=>{ if(GrokUsage.updateCountdown) GrokUsage.updateCountdown(); }, 30000);
  window.addEventListener('online', ()=>{ const b=document.getElementById('offline-banner'); if(b) b.classList.add('hidden'); toast('Back online','success'); });
  window.addEventListener('offline', ()=>{ const b=document.getElementById('offline-banner'); if(b) b.classList.remove('hidden'); });
  if(!navigator.onLine){ const b=document.getElementById('offline-banner'); if(b) b.classList.remove('hidden'); }
  const build = document.getElementById('hq-build');
  if(build) build.textContent = new Date().toISOString().slice(0,16).replace('T',' ')+' · v2.5';
  await Dash.refreshAll();
  try{ await MetricsEngine.loadAll(); }catch(_){}
  GrokUsage.render();
  Pipes.render();
  scheduleRefresh();
  scheduleRefreshEta();
  if(!Vault.hasGh() && Vault.keyCount()===0) setTimeout(()=>toast('Open Vault (v) to paste keys · hover chips for tips','info'),700);
  console.log('%cGive A Bit HQ v2.5 — gate + tips + live pipes','color:#c45f00;font-weight:bold');
}
'''

if "bootAfterGate" not in html:
    # Insert before BOOT marker
    if "/* BOOT */" in html:
        html = html.replace("/* BOOT */", JS + "\n/* BOOT */", 1)
        print("injected JS before BOOT")
    else:
        raise SystemExit("BOOT marker missing")

new_boot = """/* BOOT v2.5 — gate first */
(async function boot(){
  Tips.init();
  Vault.load();
  const ok = await Gate.ensure();
  if(ok) await bootAfterGate();
})();"""

# Replace existing boot IIFE
pat = re.compile(r"/\* BOOT(?: v2\.5)?[^*]*\*/\s*\(async function boot\(\)\{.*?\}\)\(\);", re.S)
m = pat.search(html)
if m:
    html = html[: m.start()] + new_boot + html[m.end() :]
    print("boot replaced via regex")
else:
    # try simple old boot
    old = """(async function boot(){
  Vault.load();
  await loadRegistry();"""
    if old in html:
        # nuke from boot to end of iife - fragile; use last occurrence
        idx = html.rfind("/* BOOT")
        if idx < 0:
            idx = html.rfind("(async function boot(){")
        end = html.rfind("})();")
        if idx > 0 and end > idx:
            # find the boot's closing
            end2 = html.find("})();", idx)
            html = html[:idx] + new_boot + html[end2 + 5 :]
            print("boot replaced via slice")
        else:
            raise SystemExit("could not locate boot end")
    else:
        raise SystemExit("boot pattern not found")

# Hook refreshAll
if "Pipes.render()" not in html.split("async refreshAll")[1][:2000]:
    html = html.replace(
        "await Feeds.all();",
        "await Feeds.all();\n    try{ await MetricsEngine.loadAll(); }catch(_e){}\n    try{ Pipes.render(); }catch(_e){}",
        1,
    )
    print("refreshAll hooked")

path.write_text(html)
print("wrote", path, "bytes", len(html))
for s in [
    "hq-gate",
    "bootAfterGate",
    "Pipes.render",
    "Gate.ensure",
    "pipes-board",
    "metrics.json",
    "BOOT v2.5",
]:
    print(s, s in html)
