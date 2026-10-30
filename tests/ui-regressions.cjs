const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
function load(relative, extra = {}) {
  const exports = {};
  const jsx = (type, props) => ({type,props});
  const mocks = { react: {memo:fn=>fn}, 'react/jsx-runtime':{jsx,jsxs:jsx},
    'react-i18next':{useTranslation:()=>({t:key=>key})}, ...extra };
  const source=fs.readFileSync(path.join(__dirname,'../src',relative),'utf8');
  vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,
    {exports,require:name=>mocks[name]||{__esModule:true,default:name}});
  return exports.default;
}
function find(node,type) {
  if(!node || typeof node!=='object') return null;
  if(Array.isArray(node)) return node.map(n=>find(n,type)).find(Boolean);
  if(node.type===type) return node;
  return find(node.props?.children,type);
}
test('Contact cannot report successful delivery without a configured service',()=>{
  const errors=[];
  const Contact=load('pages/Contact/Contact.tsx',{'react-hot-toast':{__esModule:true,default:{error:key=>errors.push(key),success:()=>assert.fail('No delivery happened')}}});
  const form=find(Contact(),'form');
  let prevented=false;
  form.props.onSubmit({preventDefault(){prevented=true;}});
  assert.equal(prevented,true);
  assert.deepEqual(errors,['form.notConfigured']);
});
test('archived notes shown through Tags retain Restore behavior',()=>{
  const calls=[];
  const NotesGrid=load('pages/Dashboard/components/NotesGrid.tsx');
  const tree=NotesGrid({notes:[{id:8,isArchived:true}],isLoading:false,showArchived:false,
    selectedIds:[],dueReminderNoteIds:[],currentPage:1,totalPages:1,onArchive:(...args)=>calls.push(args)});
  const card=find(tree,'./NoteCard');
  assert.equal(card.props.showArchived,true);
  card.props.onArchive();
  assert.deepEqual(calls,[[8,true]]);
});
