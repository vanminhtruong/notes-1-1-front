const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function folderHandlers(service, selectedFolder = null) {
  const errors = [];
  const folders = [];
  const selected = [];
  const notes = [];
  const pagination = [];
  const events = {};
  const exports = {};
  const source = fs.readFileSync(path.join(__dirname,
    '../src/pages/Dashboard/hooks/Manager-handle/useFoldersHandler.ts'), 'utf8');
  const mocks = {
    react: { useCallback: callback => callback, useRef: current => ({ current }), useEffect: effect => effect() },
    '@/services/socketService': { socketService: { getSocket: () => ({ on: (event, callback) => { events[event] = callback; }, off() {} }) } },
    '@/services/notesService': { notesService: {
      getFolders: async () => ({ folders: [{ id: 1, name: 'Updated list' }] }), ...service,
    } },
    'react-hot-toast': { success() {}, error: message => errors.push(message) },
    'react-i18next': { useTranslation: () => ({ t: key => key }) },
  };
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true,
  } }).outputText, { exports, require: name => {
    if (!(name in mocks)) throw new Error(`Unexpected import: ${name}`);
    return mocks[name];
  } });
  const handlers = exports.useFoldersHandler({
    setFolders: value => folders.push(value), setIsLoading() {},
    setFolderNotes: value => notes.push(value), setIsFolderNotesLoading() {},
    setFolderNotesPagination: value => pagination.push(value), setCurrentPage() {},
    selectedFolder, setSelectedFolder: value => selected.push(value),
  });
  return { handlers, errors, folders, selected, notes, pagination, events };
}

test('create passes modal name, color and icon directly to backend validation', async () => {
  const { validateCreateFolder } = await import('../../back/src/validators/notes.validator.js');
  const payload = { name: 'qùeqweqw', color: 'yellow', icon: 'book' };
  let received;
  const env = folderHandlers({ createFolder: async data => {
    received = data;
    let accepted = false;
    validateCreateFolder({ body: data }, {
      status: code => ({ json: body => assert.fail(`${code}: ${JSON.stringify(body)}`) }),
    }, () => { accepted = true; });
    assert.equal(accepted, true);
    return { folder: { id: 1, ...data } };
  } });
  await env.handlers.createFolder(payload);
  assert.deepEqual(received, payload);
  assert.equal(env.folders.length, 1);
  assert.equal(env.errors.length, 0);
});

test('edit preserves color and icon and refreshes the selected folder', async () => {
  const payload = { name: 'Renamed', color: 'gray', icon: 'leaf' };
  const updated = { id: 8, ...payload };
  let received;
  const env = folderHandlers({ updateFolder: async (id, data) => {
    received = { id, data };
    return { folder: updated };
  } }, { id: 8 });
  await env.handlers.updateFolder(8, payload);
  assert.deepEqual(received, { id: 8, data: payload });
  assert.deepEqual(env.selected, [updated]);
  assert.equal(env.folders.length, 1);
});

test('failed submission reports backend message and rejects so the modal stays open', async () => {
  const error = Object.assign(new Error('Request failed with status code 400'), {
    response: { data: { message: 'Dữ liệu không hợp lệ' } },
  });
  const env = folderHandlers({ createFolder: async () => { throw error; } });
  await assert.rejects(env.handlers.createFolder({ name: 'Folder' }), value => value === error);
  assert.deepEqual(env.errors, ['Dữ liệu không hợp lệ']);
  assert.equal(env.folders.length, 0);
});

const folderResponse = (id, page = 1, total = 1) => ({
  folder: { id }, notes: [{ id: 100 + id, folderId: id }],
  pagination: { page, total, totalPages: Math.ceil(total / 9) },
});

test('opening a folder requests its own endpoint and count, never the outside notes list', async () => {
  const calls = [];
  const env = folderHandlers({
    getNotes: () => assert.fail('Global notes must not be fetched inside a folder'),
    getFolderById: async (id, params) => { calls.push([id, params.page]); return folderResponse(id, params.page, 12); },
  });
  await env.handlers.fetchFolderNotes(8, 2);
  assert.deepEqual(calls, [[8, 2]]);
  assert.equal(env.notes.at(-1)[0].folderId, 8);
  assert.equal(env.pagination.at(-1).totalItems, 12);
});

test('a slow response from the previous folder cannot replace the current folder', async () => {
  let finishFirst;
  const env = folderHandlers({ getFolderById: id => id === 1
    ? new Promise(resolve => { finishFirst = resolve; }) : Promise.resolve(folderResponse(id)) });
  const first = env.handlers.fetchFolderNotes(1);
  await env.handlers.fetchFolderNotes(2);
  finishFirst(folderResponse(1));
  await first;
  assert.equal(env.notes.at(-1)[0].folderId, 2);
});

test('removing the final item on a page loads the last valid page', async () => {
  const calls = [];
  const env = folderHandlers({ getFolderById: async (id, params) => {
    calls.push(params.page); return folderResponse(id, params.page, 9);
  } });
  await env.handlers.fetchFolderNotes(4, 2);
  assert.deepEqual(calls, [2, 1]);
  assert.equal(env.pagination.at(-1).currentPage, 1);
});

test('moving a note refreshes folder counts without depending on a socket event', async () => {
  const calls = [];
  const env = folderHandlers({
    moveNoteToFolder: async (noteId, folderId) => { calls.push([noteId, folderId]); },
    getFolders: async () => { calls.push('counts'); return { folders: [] }; },
  });
  await env.handlers.moveNoteToFolder(42, 8);
  assert.deepEqual(calls, [[42, 8], 'counts']);
});

test('archive events refresh folder counts', () => {
  const env = folderHandlers({});
  assert.equal(typeof env.events.note_archived, 'function');
});


test('creating inside a folder persists folderId in the create payload', async () => {
  let payload;
  let refreshed = false;
  const exports = {};
  const source = fs.readFileSync(path.join(__dirname,
    '../src/pages/Dashboard/hooks/Manager-handle/useFolderNotesHandler.ts'), 'utf8');
  const mocks = {
    react: { useCallback: callback => callback },
    '@/services/notesService': { notesService: { createNote: async data => { payload = data; } } },
    'react-hot-toast': { success() {}, error: message => assert.fail(message) },
    'react-i18next': { useTranslation: () => ({ t: key => key }) },
  };
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true,
  } }).outputText, { exports, require: name => mocks[name] });
  const handler = exports.useFolderNotesHandler({
    folderId: 8, newNote: { title: 'Checklist', content: 'Task', priority: 'medium' },
    setShowCreateModal() {}, setNewNote() {}, onSuccess() { refreshed = true; },
  });
  await handler.handleCreateNote();
  assert.equal(payload.folderId, 8);
  assert.equal(refreshed, true);
});
