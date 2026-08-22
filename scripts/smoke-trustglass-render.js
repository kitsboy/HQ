// Full render smoke test: stub a minimal DOM and run renderTrustGlass from the built file,
// verifying it produces the expected honest sections for both empty and populated state.
const fs = require('fs');
const src = fs.readFileSync('/root/hq/public/hq.js', 'utf8');

// --- minimal DOM stub ---
const elements = {};
function el(id) {
  if (!elements[id]) {
    elements[id] = {
      id, innerHTML: '', style: {},
      querySelectorAll(sel){ return []; },
      querySelector(sel){ return null; },
      addEventListener(){},
      classList: { add(){}, remove(){}, toggle(){} },
      appendChild(){}, setAttribute(){}, prepend(){},
    };
  }
  return elements[id];
}
const documentStub = {
  getElementById: (id) => el(id),
  createElement: () => el('_new'),
  querySelectorAll: () => [],
  querySelector: () => null,
  documentElement: { setAttribute(){} },
  body: { classList: { add(){}, toggle(){} } },
};
const localStorageStub = { getItem:()=>null, setItem(){}, };
const locationStub = { search:'', hash:'', href:'http://hq.giveabit.io', pathname:'/' };
global.document = documentStub;
global.localStorage = localStorageStub;
global.location = locationStub;

// Pull the whole file up to the IIFE body, but we can't run it (binds to window).
// Instead: extract the state derivation helpers + renderTrustGlass + helpers + the
// esc/escAttr helpers, then run in a harness that provides the stubs and a mock state.
function extractRange(fname) {
  const start = src.indexOf('function ' + fname + '(');
  if (start < 0) throw new Error('nf ' + fname);
  const ob = src.indexOf('{', src.indexOf(')', start));
  let depth = 0, i = ob;
  for (; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') { depth--; if (depth===0) break; }
  }
  return src.slice(start, i+1);
}
function esc(s){ return String(s).replace(/[&<>"']/g, (c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function escAttr(s){ return esc(s).replace(/`/g,'&#96;'); }
function fmtNum(n){ return Number(n).toLocaleString(); }

const state = {
  projects: [{id:'motopass',name:'MotoPass',url:'https://motopass.giveabit.io'},{id:'satohash',name:'Satohash',url:'https://satohash.io'}],
  trust: {},
  agents: [{name:'Nova',role:'Product',nip05:'nova@giveabit.io'},{name:'Cam',role:'Founder',nip05:'cam@giveabit.io'}],
  metrics: {},
  _trustOpen: null,
};

let harness = '';
for (const f of ['trustGlassOfferings','trustChipState','trustELI16','trustGate','trustProofCell','renderTrustDrawer','renderTrustGlass']) {
  harness += '\n' + extractRange(f) + '\n';
}
eval(harness);

// capture render output
const view = el('view-trustglass');
renderTrustGlass();

let html = view.innerHTML;
let pass=0, fail=0;
function check(n,c,g){ if(c){pass++;console.log('  PASS '+n);} else {fail++;console.log('  FAIL '+n+' → '+JSON.stringify(g));} }

console.log('— Empty-envelope render (Phase 0) —');
check('has Trust Glass title', /Trust Glass/.test(html));
check('has 9 chips', (html.match(/class="tg-chip"/g)||[]).length === 9, (html.match(/class="tg-chip"/g)||[]).length);
check('8 product chips EMPTY/muted + Identity PENDING (honest)', (html.match(/tg-chip-state muted/g)||[]).length === 8 && /Identity<\/strong>\s*<span class="tg-chip-state amber">PENDING/.test(html), [(html.match(/tg-chip-state muted/g)||[]).length, /PENDING/.test(html)]);
check('Identity namespace block present', /Identity namespace/.test(html));
check('Identity shows pending agents', /pending/.test(html) && /registered, awaiting OTS seal/.test(html));
check('table header has 7 columns', ['Offering','Freshness','Confidence','Proof state','Source score','Drift','Run'].every(h=>html.includes(h)));
check('foot shows Safe Harbour', /Safe Harbour/.test(html));

console.log('— Populated-envelope render (MotoPass PROVEN + drawer) —');
state.trust['motopass'] = {
  schema:'gab.trust-state.v1', productId:'motopass', name:'MotoPass', generatedAt:'2026-08-22T17:00:00Z',
  freshness:{ status:'fresh', days_stale:2, verifiedAt:'2026-08-20T17:00:00Z' },
  confidence:{ tiers:{ verified_primary:50, verified_secondary_x2:2, unverified_candidate:0 } },
  proofs:[ { claim:'SKN CBI biometric enrolment in effect', status:'confirmed', bitcoin_block:963700, sha256_slice:'a1b2c3', ots_file:'/proofs/motopass/st-kitts.ots', verify:'ots verify st-kitts.ots countries.json' } ],
  sources:{ count:5, avg_score:4.6, min_score:4.2 },
  recent_drifts:[ { field:'EU_visa_waiver', changed_at:'2026-08-18', old_hash:'d4e5', new_hash:'f6a7', state:'re-stamped' } ],
  conflicts:[],
  pipeline:{ last_run:'2026-08-22T17:00:00Z', status:'ok', summary:'14 claims verified' },
  gate:{ automation_ready:true, blockers:[] }
};
state._trustOpen = 'motopass';
renderTrustGlass();
html = view.innerHTML;
check('MotoPass chip PROVEN green', /tg-chip-state green/.test(html));
check('drawer open shows proof ledger', /Proof ledger/.test(html));
check('drawer shows confirmed@block 963,700', /confirmed@block 963,700/.test(html));
check('drawer shows AUTOMATION: READY', /AUTOMATION: READY/.test(html));
check('drawer shows sha256 + verify + .ots', /sha256:a1b2c3/.test(html) && /ots verify/.test(html) && /\.ots<\/a>/.test(html));
check('drift history shown', /EU_visa_waiver/.test(html));
check('source scores shown', /4\.6\/5/.test(html));
check('ELI16 fresh copy', /stamped into Bitcoin/.test(html));

console.log('\n=== RESULT: '+pass+' passed, '+fail+' failed ===');
process.exit(fail?1:0);
