(() => {
  'use strict';
  const DEFAULTS = Object.freeze({ branch: 'main', configPath: 'content.js', imageDir: 'images' });
  const $ = (id) => document.getElementById(id);
  const state = { owner: '', repo: '', token: '', branch: '', site: null, sha: '', dirty: false, ready: false };
  const api = 'https://api.github.com';
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function status(id, message, error = false) { const el=$(id); el.textContent=message; el.classList.toggle('error', error); }
  function setDirty(message='Unsaved edits') { state.dirty=true; $('publish').disabled=!state.ready; status('editorStatus',message); }
  function slug(s) { return String(s||'photo').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,50)||'photo'; }
  async function request(path, options={}) {
    const response=await fetch(api+path,{...options,headers:{Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28',Authorization:`Bearer ${state.token}`,...(options.headers||{})}});
    const text=await response.text(); let data={}; try{data=text?JSON.parse(text):{};}catch{throw new Error(`GitHub returned an unreadable response (${response.status}).`)}
    if(!response.ok) throw new Error(data.message||`GitHub request failed (${response.status}).`); return data;
  }
  function stripComments(source) {
    let out='', quote='', escape=false, line=false, block=false;
    for(let i=0;i<source.length;i++) { const c=source[i], n=source[i+1];
      if(line){if(c==='\n'){line=false;out+=c;}else out+=' ';continue;}
      if(block){if(c==='*'&&n==='/'){out+='  ';i++;block=false;}else out+=c==='\n'?'\n':' ';continue;}
      if(quote){out+=c;if(escape)escape=false;else if(c==='\\')escape=true;else if(c===quote)quote='';continue;}
      if(c==='"'||c==="'"||c==='`'){quote=c;out+=c;continue;}
      if(c==='/'&&n==='/'){line=true;out+='  ';i++;continue;}
      if(c==='/'&&n==='*'){block=true;out+='  ';i++;continue;}out+=c;
    } return out;
  }
  function parseConfig(source) {
    let body=stripComments(source).trim().replace(/^window\s*\.\s*SITE\s*=\s*/, '').replace(/;\s*$/, '').trim();
    body=body.replace(/([{,]\s*)([A-Za-z_$][\w$]*)(\s*:)/g,'$1"$2"$3').replace(/,\s*([}\]])/g,'$1');
    const site=JSON.parse(body); if(!site||typeof site!=='object') throw new Error('The config file does not contain a site object.'); return site;
  }
  const lines = v => String(v||'').split('\n').map(s=>s.trim()).filter(Boolean);
  const fill = (id,v) => { if($(id)) $(id).value=v??''; };
  function paintImage(id,src){const el=$(id);if(el)el.src=src||'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22240%22 height=%22160%22%3E%3Crect width=%22100%25%22 height=%22100%25%22 fill=%22%23e9e9e9%22/%3E%3C/svg%3E';}
  function renderSocial() {
    const list=$('socialList');list.innerHTML='';(state.site.contact.social||[]).forEach((item,i)=>{const row=document.createElement('div');row.className='text-row';row.innerHTML=`<input type="text" aria-label="Social label" placeholder="Platform" value="${esc(item.label)}"><input type="url" aria-label="Social URL" placeholder="https://" value="${esc(item.url)}"><button type="button" class="danger" aria-label="Remove social link">Remove</button>`;const [label,url,remove]=row.querySelectorAll('input,button');label.oninput=()=>{item.label=label.value;setDirty();};url.oninput=()=>{item.url=url.value;setDirty();};remove.onclick=()=>{state.site.contact.social.splice(i,1);renderSocial();setDirty();};list.append(row);});
  }
  function renderProjects() {
    const list=$('projectList');list.innerHTML='';(state.site.projects||[]).forEach((project,index)=>{
      const card=document.createElement('article');card.className='project-card';card.innerHTML=`<div class="project-head"><strong>Project ${index+1}</strong><div class="project-actions"><button type="button" class="button-secondary up" aria-label="Move project up">↑</button><button type="button" class="button-secondary down" aria-label="Move project down">↓</button><button type="button" class="danger remove">Remove</button></div></div><div class="project-grid"><div class="field"><label>Title</label><input data-key="title" type="text" value="${esc(project.title)}"></div><div class="field"><label>Client</label><input data-key="client" type="text" value="${esc(project.client)}"></div><div class="field"><label>Year</label><input data-key="year" type="number" value="${esc(project.year)}"></div><div class="field"><label>Image ratio</label><select data-key="ratio"><option ${project.ratio==='3/2'?'selected':''}>3/2</option><option ${project.ratio==='4/5'?'selected':''}>4/5</option><option ${project.ratio==='1/1'?'selected':''}>1/1</option><option ${project.ratio==='16/9'?'selected':''}>16/9</option></select></div><div class="field full"><label>Project ID</label><input data-key="id" type="text" value="${esc(project.id)}"><p class="help">Lowercase letters, numbers and hyphens.</p></div><div class="field full"><label>Description</label><textarea data-key="text">${esc(project.text)}</textarea></div><div class="field full"><label>Cover photograph</label><img class="cover-preview" alt="Cover preview"><label class="upload">Choose cover<input class="cover-file" type="file" accept="image/*"></label></div><div class="field full"><label>Project photographs</label><div class="image-strip"></div><button type="button" class="button-secondary add-photo" style="margin-top:.6rem">+ Add photograph</button></div></div>`;
      card.querySelectorAll('[data-key]').forEach(input=>input.addEventListener('input',()=>{project[input.dataset.key]=input.dataset.key==='year'?Number(input.value):input.value;setDirty();}));
      card.querySelector('.up').onclick=()=>moveProject(index,-1);card.querySelector('.down').onclick=()=>moveProject(index,1);card.querySelector('.remove').onclick=()=>{state.site.projects.splice(index,1);renderProjects();setDirty();};
      const cover=card.querySelector('.cover-preview');paintDirect(cover,project.cover);card.querySelector('.cover-file').onchange=async e=>{if(e.target.files[0]){project.cover=await imageData(e.target.files[0]);paintDirect(cover,project.cover);setDirty('Cover added. Publish to save it.');}};
      const strip=card.querySelector('.image-strip');(project.images||[]).forEach((src,n)=>{const box=document.createElement('div');box.className='image-card';box.innerHTML=`<img alt="Project photograph ${n+1}"><button type="button" class="danger">Remove</button>`;paintDirect(box.querySelector('img'),src);box.querySelector('button').onclick=()=>{project.images.splice(n,1);renderProjects();setDirty();};strip.append(box);});
      card.querySelector('.add-photo').onclick=()=>{const input=document.createElement('input');input.type='file';input.accept='image/*';input.onchange=async()=>{if(input.files[0]){project.images.push(await imageData(input.files[0]));renderProjects();setDirty('Photograph added. Publish to save it.');}};input.click();};list.append(card);
    });
  }
  function paintDirect(el,src){el.src=src||'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22200%22%3E%3Crect width=%22100%25%22 height=%22100%25%22 fill=%22%23e9e9e9%22/%3E%3C/svg%3E';}
  function moveProject(i,delta){const j=i+delta;if(j<0||j>=state.site.projects.length)return;[state.site.projects[i],state.site.projects[j]]=[state.site.projects[j],state.site.projects[i]];renderProjects();setDirty();}
  function render() {
    const s=state.site;s.info=s.info||{};s.contact=s.contact||{};s.contact.social=s.contact.social||[];s.projects=s.projects||[];
    fill('siteName',s.name);fill('logo',s.logo);fill('titleLines',(s.titleLines||[]).join('\n'));fill('description',s.description);fill('paragraphs',(s.info.paragraphs||[]).join('\n'));fill('clients',(s.info.clients||[]).join('\n'));fill('awards',(s.info.awards||[]).join('\n'));fill('email',s.contact.email);fill('phone',s.contact.phone);fill('location',s.contact.location);fill('representation',s.contact.rep);
    paintImage('heroPreview',s.hero);paintImage('portraitPreview',s.info.portrait);paintImage('logoImgPreview',s.logoImg);renderSocial();renderProjects();
  }
  function bindSimple(id,fn){$(id).addEventListener('input',()=>{fn($(id).value);setDirty();});}
  function bind() {
    bindSimple('siteName',v=>state.site.name=v);bindSimple('logo',v=>state.site.logo=v);bindSimple('description',v=>state.site.description=v);bindSimple('titleLines',v=>state.site.titleLines=lines(v));bindSimple('paragraphs',v=>state.site.info.paragraphs=lines(v));bindSimple('clients',v=>state.site.info.clients=lines(v));bindSimple('awards',v=>state.site.info.awards=lines(v));bindSimple('email',v=>state.site.contact.email=v);bindSimple('phone',v=>state.site.contact.phone=v);bindSimple('location',v=>state.site.contact.location=v);bindSimple('representation',v=>state.site.contact.rep=v);
    $('addSocial').onclick=()=>{state.site.contact.social.push({label:'',url:''});renderSocial();setDirty();};$('addProject').onclick=()=>{state.site.projects.push({id:`project-${state.site.projects.length+1}`,title:'New Project',client:'',year:new Date().getFullYear(),cover:'',ratio:'3/2',text:'',images:[]});renderProjects();setDirty();};
    bindImage('heroFile',img=>{state.site.hero=img;paintImage('heroPreview',img);});bindImage('portraitFile',img=>{state.site.info.portrait=img;paintImage('portraitPreview',img);});bindImage('logoImgFile',img=>{state.site.logoImg=img;paintImage('logoImgPreview',img);});$('clearLogoImage').onclick=()=>{state.site.logoImg='';paintImage('logoImgPreview','');setDirty();};
    $('export').onclick=()=>{const blob=new Blob([JSON.stringify(state.site,null,2)],{type:'application/json'});download(blob,`${slug(state.site.name)}-portfolio-backup.json`);};$('importFile').onchange=async e=>{try{const data=JSON.parse(await e.target.files[0].text());state.site=data;render();setDirty('Backup imported. Publish when ready.');}catch(err){status('editorStatus',`Could not import backup: ${err.message}`,true);}};
    $('login').onclick=login;$('logout').onclick=logout;$('publish').onclick=publish;
  }
  function bindImage(id,callback){$(id).onchange=async e=>{if(e.target.files[0]){try{callback(await imageData(e.target.files[0]));setDirty('Image added. Publish to save it.');}catch(err){status('editorStatus',err.message,true);}}};}
  function imageData(file){return new Promise((resolve,reject)=>{if(!file.type.startsWith('image/'))return reject(new Error('Choose an image file.'));const reader=new FileReader();reader.onerror=()=>reject(new Error('Could not read the image.'));reader.onload=()=>{const img=new Image();img.onerror=()=>reject(new Error('Could not open the image.'));img.onload=()=>{const max=1800,scale=Math.min(1,max/Math.max(img.width,img.height)),canvas=document.createElement('canvas');canvas.width=Math.round(img.width*scale);canvas.height=Math.round(img.height*scale);canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);resolve(canvas.toDataURL('image/jpeg',.82));};img.src=reader.result;};reader.readAsDataURL(file);});}
  async function login(){const owner=$('repoOwner').value.trim(),repo=$('repoName').value.trim(),token=$('repoToken').value.trim();if(!owner||!repo||!token){status('loginStatus','Enter the repository owner, repository name and token.',true);return;}$('login').disabled=true;status('loginStatus','Checking repository access…');state.owner=owner;state.repo=repo;state.token=token;
    try{const info=await request(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`);state.branch=info.default_branch||DEFAULTS.branch;$('connectionLabel').textContent=`Connected to ${info.full_name||`${owner}/${repo}`} · ${state.branch}`;$('loginPanel').hidden=true;$('managerApp').hidden=false;state.ready=true;$('publish').disabled=true;status('editorStatus','Loading portfolio content…');
      try{const file=await request(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${DEFAULTS.configPath}?ref=${encodeURIComponent(state.branch)}`);state.sha=file.sha;const source=decodeURIComponent(escape(atob(file.content.replace(/\s/g,''))));state.site=parseConfig(source);render();$('publish').disabled=false;status('editorStatus','Portfolio loaded. Changes stay in this tab until published.');}
      catch(err){state.ready=false;$('publish').disabled=true;state.site=window.SITE||{name:'',logo:'',titleLines:[],hero:'',description:'',info:{},contact:{},projects:[]};render();status('editorStatus',`Manager opened, but content.js could not be loaded: ${err.message}`,true);}
    }catch(err){state.token='';status('loginStatus',`Could not log in: ${err.message}`,true);}finally{$('login').disabled=false;}
  }
  function logout(){state.owner='';state.repo='';state.token='';state.branch='';state.site=null;state.sha='';state.ready=false;state.dirty=false;$('repoToken').value='';$('repoOwner').value='';$('repoName').value='';$('managerApp').hidden=true;$('loginPanel').hidden=false;$('publish').disabled=true;status('loginStatus','Logged out. Enter repository details to connect.');}
  function download(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
  function contentSource(site){return `/* Portfolio content. Edit with the owner manager or update this file directly. */\nwindow.SITE = ${JSON.stringify(site,null,2)};\n`;}
  function collectImages(site){const files=[];const add=(holder,key,label)=>{const val=holder[key];if(typeof val==='string'&&val.startsWith('data:image/')){const m=val.match(/^data:image\/(\w+);base64,(.+)$/);if(!m)throw new Error('An uploaded image could not be prepared.');const name=`${slug(label)}-${Date.now().toString(36)}-${files.length+1}.jpg`;holder[key]=`${DEFAULTS.imageDir}/${name}`;files.push({path:holder[key],content:m[2]});}};
    add(site,'hero','home');add(site.info,'portrait','portrait');add(site,'logoImg','logo');site.projects.forEach((p,i)=>{add(p,'cover',`${i+1}-${p.title}-cover`);p.images=(p.images||[]).map((src,j)=>{if(typeof src==='string'&&src.startsWith('data:image/')){const holder={image:src};add(holder,'image',`${i+1}-${p.title}-${j+1}`);return holder.image;}return src;});});return files;
  }
  async function publish(){if(!state.ready||!state.token)return;try{if(!confirm('Publish these changes to the connected GitHub repository?'))return;$('publish').disabled=true;status('editorStatus','Preparing portfolio update…');const site=JSON.parse(JSON.stringify(state.site));const images=collectImages(site);const base=`/repos/${encodeURIComponent(state.owner)}/${encodeURIComponent(state.repo)}`;const ref=await request(`${base}/git/ref/heads/${encodeURIComponent(state.branch||DEFAULTS.branch)}`);const parent=ref.object.sha;const treeItems=[];
      for(let i=0;i<images.length;i++){status('editorStatus',`Uploading image ${i+1} of ${images.length}…`);const file=images[i];const blob=await request(`${base}/git/blobs`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({content:file.content,encoding:'base64'})});treeItems.push({path:file.path,mode:'100644',type:'blob',sha:blob.sha});}
      const configBlob=await request(`${base}/git/blobs`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({content:contentSource(site),encoding:'utf-8'})});treeItems.push({path:DEFAULTS.configPath,mode:'100644',type:'blob',sha:configBlob.sha});
      status('editorStatus','Saving portfolio commit…');const commit=await request(`${base}/git/commits/${parent}`);const tree=await request(`${base}/git/trees`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({base_tree:commit.tree.sha,tree:treeItems})});const newCommit=await request(`${base}/git/commits`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:'Update photographer portfolio',tree:tree.sha,parents:[parent]})});await request(`${base}/git/refs/heads/${encodeURIComponent(state.branch||DEFAULTS.branch)}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({sha:newCommit.sha})});state.site=site;state.sha=configBlob.sha;state.dirty=false;status('editorStatus','Published successfully. Your portfolio will update shortly.');
    }catch(err){status('editorStatus',`Could not publish: ${err.message}`,true);}finally{$('publish').disabled=!state.ready;}}
  bind();
})();
