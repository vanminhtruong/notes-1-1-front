const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { Op } = require('../../back/node_modules/sequelize');
function service(file, repository) {
  const exports = {};
  const source = fs.readFileSync(path.join(__dirname, '../../back/src/service/notes-service', file), 'utf8');
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, allowJs: true,
  } }).outputText, { exports, require: name => name === 'sequelize' ? { Op } : name.includes('repositories')
    ? { noteRepository: repository, noteFolderRepository: { count: async () => 3 } } : {} });
  return new exports.default({});
}
test('Archived includes notes from folders while Active stays outside folders', async () => {
  const calls = [];
  const api = service('notes.basic.service.js', { findAndCountAll: async query => {
    calls.push(query); return { count: 1, rows: [] };
  } });
  for (const isArchived of ['true', 'false']) {
    await api.getNotes({ user: { id: 8 }, query: { isArchived } }, { json() {}, status: code => { throw Error(String(code)); } });
  }
  assert.equal(calls[0].where.isArchived, true);
  assert.equal('folderId' in calls[0].where, false);
  assert.equal(calls[1].where.folderId, null);
  assert.equal(calls[0].distinct, true);
});
test('dashboard counters use the same scopes as Archived and folder contents', async () => {
  const counts = [];
  const groups = [];
  const api = service('notes.stats.service.js', {
    count: async query => { counts.push(query.where); return 1; },
    findAll: async query => { groups.push(query); return []; },
    sequelize: { fn() {}, col() {} },
  });
  await api.getNoteStats({ user: { id: 8 } }, { json() {}, status: code => { throw Error(String(code)); } });
  assert.equal(counts[1].isArchived, true);
  assert.equal('folderId' in counts[1], false);
  assert.equal(counts[2].folderId, null);
  assert.equal(counts[3].isArchived, false);
  assert.equal(counts[3].folderId[Op.ne], null);
  assert.equal(groups[1].group[0], 'categoryId');
});

test('category view lists the same scope as category count, including folder and archived notes', async () => {
  let query;
  const api = service('notes.basic.service.js', { findAndCountAll: async options => {
    query = options; return { count: 24, rows: [] };
  } });
  await api.getNotes({ user: { id: 8 }, query: { category: '3', scope: 'category' } }, { json() {}, status: code => { throw Error(String(code)); } });
  assert.equal(query.where.userId, 8);
  assert.equal(query.where.categoryId, 3);
  assert.equal('folderId' in query.where, false);
  assert.equal('isArchived' in query.where, false);
});
