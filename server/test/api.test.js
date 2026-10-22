import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
process.env.JWT_SECRET = 'test-secret-test-secret-test-secret-123';
const { default: app } = await import('../src/app.js');
let server, base;
before(() => new Promise(r => { server = app.listen(0, () => { base = `http://127.0.0.1:${server.address().port}`; r(); }); }));
after(() => server.close());
const post = (p, body) => fetch(base + p, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
test('health check responds', async () => { const r = await fetch(base + '/api/health'); assert.equal(r.status, 200); assert.equal((await r.json()).ok, true); });
test('register rejects invalid input before touching the database', async () => {
  const r = await post('/api/auth/register', { name: 'A', email: 'nope', password: '123' });
  assert.equal(r.status, 400);
});
test('admin API rejects anonymous requests', async () => { assert.equal((await fetch(base + '/api/admin/stats')).status, 401); });
test('admin API rejects a forged token', async () => {
  const r = await fetch(base + '/api/admin/users', { headers: { Authorization: 'Bearer forged.token.value' } });
  assert.equal(r.status, 401);
});
