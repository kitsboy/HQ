const https = require('https');
// read token from env or github-auth.sh output
const fs = require('fs');
let token = process.env.GITHUB_AUTH || '';
if (!token) {
  try {
    const sh = fs.readFileSync('/root/.hermes/github-auth.sh', 'utf8');
    const m = sh.match(/GITHUB_AUTH=([^\s]+)/);
    if (m) token = m[1].replace(/["']/g, '');
  } catch {}
}
const req = https.get({
  host: 'api.github.com', path: '/repos/kitsboy/HQ/actions/runs?per_page=5',
  headers: { 'User-Agent': 'nova', 'Authorization': 'token ' + token },
}, (res) => {
  let d = '';
  res.on('data', (c) => d += c);
  res.on('end', () => {
    try {
      const j = JSON.parse(d);
      (j.workflow_runs || []).forEach((r) => {
        console.log([r.id, r.name, r.head_branch, r.status, r.conclusion, r.head_sha.slice(0,7), r.created_at].join(' | '));
      });
    } catch (e) { console.log('parse err', e.message, d.slice(0,300)); }
  });
});
req.on('error', (e) => console.log('err', e.message));
