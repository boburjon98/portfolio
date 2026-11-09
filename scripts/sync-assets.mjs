import { readFileSync, writeFileSync, copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const base=fileURLToPath(new URL('../',import.meta.url));
const read=name=>readFileSync(resolve(base,name),'utf8');
const write=(name,value)=>writeFileSync(resolve(base,name),value,'utf8');
const cssMarker='/* Animated AI workspace */';
const jsMarker='/* Decorative effects respect motion preferences';
const css=read('site.css').split(cssMarker)[0].trimEnd()+'\n'+read('effects.css')+'\n'+read('presentation.css')+'\n'+read('project-effects.css');
let coreJs=read('site.js').split(jsMarker)[0].replace(/\n  \/\* Additional projects:start \*\/[\s\S]*?\/\* Additional projects:end \*\/\n/g,'\n').trimEnd();
const projects=JSON.parse(read('lib/additionalProjects.json'));
const categories={en:{filterDocuments:'Documents',filterSearch:'Search & Chatbots',filterAnalytics:'Analytics'},uz:{filterDocuments:'Hujjatlar',filterSearch:'Qidiruv va chatbotlar',filterAnalytics:'Tahlil'},ru:{filterDocuments:'Документы',filterSearch:'Поиск и чатботы',filterAnalytics:'Аналитика'}};
let extra='\n  /* Additional projects:start */\n';
const presentation=JSON.parse(read('lib/presentationCopy.json'));
for(const lang of ['en','uz','ru'])extra+='  Object.assign(copy.'+lang+','+JSON.stringify(presentation[lang])+');\n';
for(const lang of ['en','uz','ru']){
 const values={...categories[lang],filterAll:({en:'All projects',uz:'Barcha loyihalar',ru:'Все проекты'})[lang]+' <span>11</span>'};
 for(const p of projects){values[p.id+'Title']=p[lang].title;values[p.id+'Desc']=p[lang].desc;}
 extra+='  Object.assign(copy.'+lang+','+JSON.stringify(values)+');\n';
}
for(const p of projects){const details={tags:p.tags,url:null};for(const lang of ['en','uz','ru'])details[lang]={...p[lang],category:p.category.toUpperCase(),link:''};extra+='  projectDetails['+JSON.stringify(p.id)+']='+JSON.stringify(details)+';\n';}
extra+='  /* Additional projects:end */\n';
coreJs=coreJs.replace('  const translationEls =',extra+'  const translationEls =');
const js=coreJs+'\n'+read('effects.js')+'\n'+read('presentation.js')+'\n'+read('project-effects.js');
write('site.css',css);write('site.js',js);
write('public/site.css',css);write('app/globals.css',css);write('public/site.js',js);
let markup=read('_markup.html').replaceAll('bobur-tukhtamurov-601a45315','bobur-tukhtamurodov-601a45315');
markup=markup.replace(/<!-- Additional projects:start -->[\s\S]*?<!-- Additional projects:end -->/g,'').replace(/<!-- Additional filters:start -->[\s\S]*?<!-- Additional filters:end -->/g,'');
const filters='<!-- Additional filters:start -->'+Object.entries(categories.en).map(([key,label])=>`<button class="filter-chip" data-filter="${key.replace('filter','').toLowerCase()}" aria-pressed="false" data-i18n="${key}">${label}</button>`).join('')+'<!-- Additional filters:end -->';
markup=markup.replace('</div>\n      <div class="projects-grid">',filters+'</div>\n      <div class="projects-grid">').replace('All projects <span>04</span>','All projects <span>11</span>');
const cards='<!-- Additional projects:start -->'+projects.map((p,index)=>`<article class="project-card reveal" data-category="${p.category}" data-project="${p.id}" tabindex="0" aria-label="${p.en.title}"><div class="project-art art-additional art-${p.category}"><div class="art-grid"></div><div class="art-kicker">${String(index+5).padStart(2,'0')} / ${p.category.toUpperCase()}</div><div class="additional-symbol" aria-hidden="true">${p.symbol}</div><div class="additional-art-tags">${p.tags.slice(0,2).map(t=>`<span>${t}</span>`).join('')}</div><div class="art-corner">↗</div></div><div class="project-body"><div class="project-meta"><span class="project-number">PROJECT / ${String(index+5).padStart(2,'0')}</span></div><div class="project-title-row"><h3 data-i18n="${p.id}Title">${p.en.title}</h3><button class="project-open" aria-label="${p.en.title}" type="button">↗</button></div><p data-i18n="${p.id}Desc">${p.en.desc}</p><div class="tags">${p.tags.map(t=>`<span>${t}</span>`).join('')}</div></div></article>`).join('\n')+'<!-- Additional projects:end -->';
const footnoteIndex=markup.indexOf('class="project-footnote');
const lastCardEnd=markup.lastIndexOf('</article>',footnoteIndex);
if(footnoteIndex<0||lastCardEnd<0)throw new Error('Project grid insertion point not found');
const insertion=lastCardEnd+'</article>'.length;
markup=markup.slice(0,insertion)+'\n'+cards+markup.slice(insertion);
if((markup.match(/class="project-card reveal"/g)||[]).length!==11)throw new Error('Expected 11 project cards');
const imageLabels={notarif:'Multimodal commodity classification',airo:'Multilingual airport assistant',xray:'Cargo X-ray analysis',infrastructure:'GPU inference infrastructure',...Object.fromEntries(projects.map(p=>[p.id,p.en.title]))};
for(const [id,label]of Object.entries(imageLabels)){
 const asset='projects/'+id+'-v1.webp';
 if(!existsSync(resolve(base,'public',asset)))continue;
 const cardStart=markup.indexOf('data-project="'+id+'"');
 const artStart=markup.indexOf('<div class="project-art',cardStart);
 const artEnd=markup.indexOf('<div class="project-body"',artStart);
 if(cardStart<0||artStart<0||artEnd<0)throw new Error('Project artwork target missing: '+id);
 markup=markup.slice(0,artStart)+`<div class="project-art project-art-image"><img class="project-cover" src="${asset}" alt="${label}" width="1280" height="720" loading="lazy" decoding="async"><div class="art-corner" aria-hidden="true">↗</div></div>`+markup.slice(artEnd);
 mkdirSync(resolve(base,'projects'),{recursive:true});copyFileSync(resolve(base,'public',asset),resolve(base,asset));
}
if(!markup.includes('class="scroll-top"'))markup=markup.replace(/\s*<\/div>\s*$/,'\n<button class="scroll-top" type="button" aria-label="Back to top" title="Back to top" hidden><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m6 12 6-6 6 6M12 6v12"/></svg></button>\n</div>\n');
write('_markup.html',markup);
write('lib/portfolioMarkup.ts','// Generated from _markup.html by scripts/sync-assets.mjs\nexport const portfolioMarkup: string = '+JSON.stringify(markup)+';\n');
const oldIndex=read('index.html');
const head=oldIndex.slice(0,oldIndex.indexOf('<body>'));
write('index.html',head+'<body>\n'+markup+'\n</body>\n</html>\n');
copyFileSync(resolve(base,'public/portrait.png'),resolve(base,'portrait.png'));
const image='data:image/png;base64,'+readFileSync(resolve(base,'public/portrait.png')).toString('base64');
const standaloneHead=head.replace(/\s*<link rel="icon"[^>]*>/,'').replace('<link rel="stylesheet" href="site.css">','<style>'+css+'</style>').replace(/\s*<script src="site.js" defer><\/script>/,'');
const standaloneMarkup=markup.replace('src="portrait.png"','src="'+image+'"').replace(/src="(projects\/[^\"]+\.webp)"/g,(_,asset)=>'src="data:image/webp;base64,'+readFileSync(resolve(base,'public',asset)).toString('base64')+'"');
write('bobur-ai-portfolio-standalone.html',standaloneHead+'<body>\n'+standaloneMarkup+'\n<script>'+js+'</script>\n</body>\n</html>\n');
console.log('Next.js, browser assets and standalone HTML synchronized.');
