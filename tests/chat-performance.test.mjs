import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { transform } from 'esbuild';
import { EventEmitter } from 'node:events';

async function load(path, mocks = {}, globals = {}) {
  const source = await readFile(new URL(path, import.meta.url), 'utf8');
  const { code } = await transform(source, { loader: 'ts', format: 'cjs', define: { 'import.meta': '{"env":{}}' } });
  const module = { exports: {} };
  vm.runInNewContext(code, { module, exports: module.exports, require: id => {
    if (!(id in mocks)) throw new Error(`Unexpected import ${id}`);
    return mocks[id];
  }, console, setTimeout, clearTimeout, ...globals });
  return module.exports;
}
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

test('burst refreshes coalesce, never overlap, and retain a trailing invalidation', async () => {
  const { createChatRefreshScheduler } = await load('../src/utils/chatRefreshScheduler.ts');
  const scheduler = createChatRefreshScheduler(5);
  let calls = 0, release;
  const work = new Promise(resolve => { release = resolve; });
  const run = async () => { calls++; if (calls === 1) await work; };
  for (let i = 0; i < 1000; i++) scheduler.schedule('list', run);
  await sleep(20); assert.equal(calls, 1);
  for (let i = 0; i < 1000; i++) scheduler.schedule('list', run);
  await sleep(20); assert.equal(calls, 1);
  release(); await sleep(20); assert.equal(calls, 2);
  scheduler.schedule('list', run); scheduler.dispose();
  await sleep(20); assert.equal(calls, 2);
});

test('chat reuses one socket while connecting/reconnecting and replaces it on token change', async () => {
  const created = [];
  let token = 'first-token';
  const mocks = {
    'socket.io-client': { io: () => {
      const socket = new EventEmitter();
      socket.connected = false;
      socket.disconnect = () => { socket.connected = false; socket.disconnectedByTest = true; };
      created.push(socket); return socket;
    } },
    'react-hot-toast': { default: { error() {} } },
    '@/store': { store: { dispatch() {} } },
    '@/store/slices/authSlice': { resetAuth() {} },
    '@/libs/i18n': { default: { t: key => key } },
  };
  const { getSocket, disconnectSocket } = await load('../src/services/socket.ts', mocks, {
    localStorage: { getItem: () => token }, window: { location: { hostname: 'localhost' } },
  });
  const first = getSocket();
  for (let i = 0; i < 1000; i++) assert.equal(getSocket(), first);
  assert.equal(created.length, 1);
  first.connected = true;
  token = 'second-token';
  assert.notEqual(getSocket(), first);
  assert.equal(created.length, 2);
  assert.equal(first.disconnectedByTest, true);
  token = null;
  assert.equal(getSocket(), null);
  assert.equal(created[1].disconnectedByTest, true);
  disconnectSocket();
});
