const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
function render(pageItems) {
  const exports = {};
  const jsx = (type, props) => ({ type, props });
  const state = { sharedWithMe: [], sharedByMe: Array.from({length:pageItems}, (_,id)=>({id})), groupSharedNotes: [],
    totalWithMe: 0, totalByMe: 7, totalGroups: 4, pageWithMe: 1, pageByMe: 1, pageGroups: 1,
    totalPagesWithMe: 1, totalPagesByMe: 3, totalPagesGroups: 2, isLoading: false };
  const mocks = {
    react: { memo: fn=>fn, useState: value=>[value,()=>{}], useMemo: fn=>fn(), useEffect() {} },
    'react/jsx-runtime': { jsx, jsxs: jsx },
    'react-i18next': { useTranslation: ()=>({t:key=>key}) },
  };
  const source = fs.readFileSync(path.join(__dirname,'../src/pages/Dashboard/components/component-child/SharedNotesTab.tsx'),'utf8');
  vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,
    { exports, require: name=>mocks[name] || (name.includes('useSharedNotesState') ? {useSharedNotesState:()=>state} : name.includes('useSharedNotesHandlers') ? {useSharedNotesHandlers:()=>({})} : name.includes('useSharedNotesEffects') ? {useSharedNotesEffects(){}} : {}) });
  return exports.SharedNotesTab({searchTerm:'',currentUserId:1});
}
function textOf(node) {
  if (node == null || typeof node === 'boolean') return '';
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (typeof node !== 'object') return String(node);
  return textOf(node.props?.children);
}
function buttons(node, result=[]) {
  if (!node || typeof node !== 'object') return result;
  if (Array.isArray(node)) { node.forEach(child=>buttons(child,result)); return result; }
  if(node.type === 'button') result.push(textOf(node));
  buttons(node.props?.children,result); return result;
}
test('Shared Notes badges show API totals on both first and last page',()=>{
  for(const pageItems of [3,1]) {
    const labels=buttons(render(pageItems));
    assert.ok(labels.includes('sharedNotes.sent7'));
    assert.ok(labels.includes('sharedNotes.groups4'));
  }
});
