const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function loadConfirmation() {
  const removed = [];
  let render;
  const toast = {
    custom: callback => { render = callback; return 'confirmation'; },
    remove: id => removed.push(id),
    dismiss: () => assert.fail('Must remove immediately without the dismiss timer'),
  };
  const jsx = (type, props) => ({ type, props });
  const mocks = {
    react: { useCallback: callback => callback },
    'react-hot-toast': toast,
    'react/jsx-runtime': { jsx, jsxs: jsx },
  };
  const exports = {};
  const source = fs.readFileSync(path.join(__dirname,
    '../src/pages/Dashboard/hooks/Manager-handle/useConfirmationToastHandler.tsx'), 'utf8');
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
    jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
  } }).outputText, { exports, require: name => mocks[name] });
  const { confirmWithToast } = exports.useConfirmationToast({ t: (_key, fallback) => fallback });
  function buttons(node) {
    if (!node || typeof node !== 'object') return [];
    if (node.type === 'button') return [node];
    return [node.props?.children].flat(Infinity).flatMap(buttons);
  }
  return { confirmWithToast, removed, buttons: () => buttons(render({ visible: true })) };
}

test('Cancel removes the confirmation synchronously and prevents the action', async () => {
  const env = loadConfirmation();
  let performed = false;
  const result = env.confirmWithToast('Delete?').then(confirmed => { if (confirmed) performed = true; });
  env.buttons()[0].props.onClick();
  assert.deepEqual(env.removed, ['confirmation']);
  await result;
  assert.equal(performed, false);
});

test('Confirm removes the confirmation synchronously and accepts the action', async () => {
  const env = loadConfirmation();
  const result = env.confirmWithToast('Delete?');
  env.buttons()[1].props.onClick();
  assert.deepEqual(env.removed, ['confirmation']);
  assert.equal(await result, true);
});
