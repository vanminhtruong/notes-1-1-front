const fs=require('fs'),path=require('path');
process.chdir(path.resolve(__dirname, '../..'));
const ts=require('typescript');
const languages=['en','vi','ko','zh-CN','zh-TW'];
const result=[];
for(const project of ['Front','admin']) {
 const config=fs.readFileSync(project+(project==='Front'?'/src/libs/i18n.ts':'/src/i18n/index.ts'),'utf8');
 const imports={}; for(const m of config.matchAll(/import (\w+) from ['"]([^'"]+\.json)['"]/g)) imports[m[1]]=m[2].replace(/^@pages\//,project+'/src/pages/').replace(/^@\//,project+'/src/').replace(/^\.\//,project+'/src/i18n/');
 const resources={};const body=config.slice(config.indexOf('const resources'));
 for(const m of body.matchAll(/(?:^|\n)\s*(?:'([^']+)'|(en|vi|ko)):\s*\{([^}]+)\}/g)) {const lang=m[1]||m[2]; resources[lang]={};for(const n of m[3].matchAll(/(\w+):\s*(\w+)/g)) if(imports[n[2]]) resources[lang][n[1]]=JSON.parse(fs.readFileSync(imports[n[2]],'utf8'));}
 function get(o,key){return key.split('.').reduce((a,k)=>a?.[k],o);}
 function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const f=path.join(dir,e.name);if(e.isDirectory()){walk(f);continue;}if(!/\.tsx?$/.test(f))continue;const text=fs.readFileSync(f,'utf8');const source=ts.createSourceFile(f,text,99,true);const ns=text.match(/useTranslation\(['"]([^'"]+)/)?.[1] || (f.includes('Dashboard')?'dashboard':null);function visit(n){if(ts.isCallExpression(n)&& /^(?:t|tt|toastI18n\.t|i18n\.t)$/.test(n.expression.getText(source)) && n.arguments[0]&&ts.isStringLiteral(n.arguments[0])){let parent=n.parent,found=false;while(parent){if(ts.isCallExpression(parent)&&/toast|confirmWithToast|confirmDelete/i.test(parent.expression.getText(source))){found=true;break;}parent=parent.parent;}if(found){let key=n.arguments[0].text,namespace=ns;if(key.includes(':'))[namespace,key]=key.split(':');if(namespace){const missing=languages.filter(l=>typeof get(resources[l]?.[namespace],key)!=='string');if(missing.length)result.push({project,ns:namespace,key,missing,file:f, fallback:n.arguments[1]?.getText(source)});}}}ts.forEachChild(n,visit);}visit(source);}}
 walk(project+'/src');
}
const unique=[...new Map(result.map(x=>[x.project+':'+x.ns+':'+x.key,x])).values()];if(unique.length) throw new Error(JSON.stringify(unique,null,2));
console.log('Toast translation keys exist in all five languages (Front and admin).');
