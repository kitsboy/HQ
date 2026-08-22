// Smoke test: extract Trust Glass pure logic from hq.js and verify honest rendering.
// We pull the functions via a stubbed DOM shell isn't feasible; instead we re-implement
// the pure decision helpers by extracting them from the source and eval'ing with a mock
// state, to prove the state-derivation (chips/gate/ELI16/proof cell) behaves correctly.

const fs = require('fs');
const src = fs.readFileSync('/root/hq/public/hq.js', 'utf8');

// Extract the helper function bodies by matching from "function trustChipState" etc.
function extract(fname) {
  const start = src.indexOf('function ' + fname + '(');
  if (start < 0) throw new Error('not found ' + fname);
  // find opening brace
  const ob = src.indexOf('{', src.indexOf(')', start));
  let depth = 0, i = ob;
  for (; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') { depth--; if (depth === 0) break; }
  }
  return src.slice(start, i + 1);
}

const fns = ['trustChipState','trustELI16','trustGate','trustProofCell','trustGlassOfferings'];
let code = '';
for (const f of fns) code += '\n' + extract(f) + '\n';
// trustGlassOfferings uses state.projects
const state = {
  projects: [
    { id:'motopass', name:'MotoPass', url:'https://motopass.giveabit.io' },
    { id:'satohash', name:'Satohash', url:'https://satohash.io' },
  ],
  trust: {},
  agents: [{name:'Nova',nip05:'nova@giveabit.io'},{name:'Cam',nip05:'cam@giveabit.io'}]
};
// esc for ELI16 (not needed for these pure fns except none call esc)
function esc(s){ return String(s); }
eval(code);

let pass = 0, fail = 0;
function check(name, cond, got) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + ' → got ' + JSON.stringify(got)); }
}

console.log('\n— No envelopes (Phase-0 honest EMPTY) —');
state.trust = {}; state.agents = [{name:'Nova'},{name:'Cam'}];
let off = trustGlassOfferings()[0]; // motopass
let cs = trustChipState(off);
check('motopass chip EMPTY when no envelope', cs.key === 'EMPTY' && cs.cls === 'muted', cs);
check('motopass gate NOT READY with real blocker', trustGate(off).ready === false && /no live trust-state envelope/i.test(trustGate(off).blocker), trustGate(off));
check('motopass proof none', trustProofCell(state.trust['motopass']).txt === 'none', trustProofCell(state.trust['motopass']));
check('motopass ELI16 honest', /isn't wired into the trust spine/i.test(trustELI16(off)), trustELI16(off));

// identity
let idOff = trustGlassOfferings().find(o => o.id === 'identity');
check('identity PENDING (no ots)', trustChipState(idOff).key === 'PENDING', trustChipState(idOff));
check('identity gate NOT READY', trustGate(idOff).ready === false, trustGate(idOff));

console.log('\n— Populated envelope (must show PROVEN, gate ready) —');
state.trust['motopass'] = {
  schema:'gab.trust-state.v1', productId:'motopass', name:'MotoPass', generatedAt:'2026-08-22T17:00:00Z',
  freshness:{ status:'fresh', days_stale:2, verifiedAt:'2026-08-20T17:00:00Z' },
  confidence:{ tiers:{ verified_primary:50, verified_secondary_x2:2, unverified_candidate:0 } },
  proofs:[ { claim:'SKN CBI in effect', status:'confirmed', bitcoin_block:963700, sha256_slice:'a1b2c3', ots_file:'/proofs/motopass/st-kitts.ots', verify:'ots verify st-kitts.ots countries.json' } ],
  sources:{ count:5, avg_score:4.6, min_score:4.2, tiers:{ primary_official:4, secondary_trusted:1 } },
  recent_drifts:[ { field:'EU_visa_waiver', changed_at:'2026-08-18', old_hash:'d4e5', new_hash:'f6a7', state:'re-stamped' } ],
  conflicts:[],
  pipeline:{ last_run:'2026-08-22T17:00:00Z', status:'ok', summary:'14 claims verified' },
  gate:{ automation_ready:true, blockers:[] }
};
cs = trustChipState(off);
check('motopass chip PROVEN when fresh+confirmed', cs.key === 'PROVEN' && cs.cls === 'green', cs);
check('motopass gate READY', trustGate(off).ready === true, trustGate(off));
check('motopass proof confirmed@block', trustProofCell(state.trust['motopass']).txt.includes('confirmed@block 963,700'), trustProofCell(state.trust['motopass']));
check('motopass ELI16 fresh', /stamped into Bitcoin/i.test(trustELI16(off)), trustELI16(off));

console.log('\n— Conflict → ACTION (red), gate blocked —');
state.trust['motopass'].conflicts = [{ field:'min_investment_usd', sources:['a','b'], values:{a:250000,b:300000}, status:'review' }];
cs = trustChipState(off);
check('motopass chip ACTION on conflict', cs.key === 'ACTION' && cs.cls === 'red', cs);
check('motopass ELI16 conflict copy', /Two sources disagree/i.test(trustELI16(off)), trustELI16(off));

console.log('\n— Stale → STALE amber —');
state.trust['motopass'].conflicts = [];
state.trust['motopass'].freshness = { status:'stale', days_stale:60 };
cs = trustChipState(off);
check('motopass chip STALE', cs.key === 'STALE' && cs.cls === 'amber', cs);
check('motopass ELI16 stale copy', /60 days/i.test(trustELI16(off)), trustELI16(off));

console.log('\n— Pipeline failed → ACTION red —');
state.trust['motopass'].freshness = { status:'fresh', days_stale:1 };
state.trust['motopass'].pipeline = { last_run:'2026-08-22', status:'failed' };
cs = trustChipState(off);
check('motopass chip ACTION on pipeline fail', cs.key === 'ACTION' && cs.cls === 'red', cs);

console.log('\n=== RESULT: ' + pass + ' passed, ' + fail + ' failed ===');
process.exit(fail ? 1 : 0);
