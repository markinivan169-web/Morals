const fs=require('fs'),vm=require('vm');
const source=fs.readFileSync('build.py','utf8');
const pages=source.split('\n').filter(l=>l.startsWith('dict(')).map(l=>vm.runInNewContext('('+l.trim().replace(/\]$/,'').replace(/^dict\(/,'{').replace(/\),?$/,'}').replace(/(\w+)=/g,'$1:').replace(/\(/g,'[').replace(/\)/g,']')+')'));
const css=source.split("css='''")[1].split("'''")[0];
fs.writeFileSync('dist/style.css',css);
const template=source.split("html=f'''")[1].split("'''")[0];
for(const [n,p] of pages.entries()){
 const nav=pages.map(x=>`<a href="${x.file}"${x===p?' aria-current="page"':''}>${x.name}</a>`).join('');
 const acts=p.activities.map(([num,title,desc])=>`<article class="activity"><span class="number">${num}</span><h3>${title}</h3><p>${desc}</p></article>`).join('');
 const tips=p.tips.map(t=>`<li><span class="tick" aria-hidden="true">✓</span>${t}</li>`).join('');
 const html=template.replace(/\{([^{}]+)\}/g,(_,e)=>{
 if(e.startsWith("p['"))return p[e.slice(3,-2)];
 if(e==='n+1')return n+1;
 if(e==='nav')return nav;
 if(e==='acts')return acts;
 if(e==='tips')return tips;
 if(e.includes(' if n==0 '))return ['Морские волны у берега','Горные вершины','Солнечный свет в лесу'][n];
 throw Error(e);
 });
 if((html.match(/<section /g)||[]).length!==3)throw Error('Incorrect section count');
 fs.writeFileSync('dist/'+p.file,html);
}
for(const p of pages)if(!fs.existsSync('dist/'+p.file))throw Error('Missing navigation target');
console.log('Verified 3 pages, each containing exactly 3 sections. Navigation targets exist.');
