const K={videos:'nexalor_videos',likes:'nexalor_likes',admin:'nexalor_admin_session',token:'nexalor_admin_token',history:'nexalor_history',visitor:'nexalor_visitor_id',comments:'nexalor_comments',categories:'nexalor_categories',settings:'nexalor_settings',sub:'nexalor_subscription'};
const ADMIN_PASSWORD='lvttr2010';
const CATS=['Tech','Gaming','Music','Education','Film','Sport','News','Voyage'];
const CAT_PAGES={Tech:'categorie-tech.html',Gaming:'categorie-gaming.html',Music:'categorie-music.html',Education:'categorie-education.html',Film:'categorie-film.html',Sport:'categorie-sport.html',News:'categorie-news.html',Voyage:'categorie-voyage.html'};
const API=window.NEXALOR_API_BASE||localStorage.getItem('nexalor_api_base')||'/api';
let apiOn=false;
const SEED=[];
const DEF_SETTINGS={preset:'violet',logoText:'NEXALOR',footerText:'BY YOUNSOUGLUOU',colorPrimary:'#6a0dad',colorSecondary:'#a34dff',colorBgMain:'#08070d',colorBgSoft:'#11101a'};
let categoriesCache=[...CATS];
let settingsCache={...DEF_SETTINGS};

const getSub=()=>{try{const uStr=localStorage.getItem('nexalor_user');if(uStr){const u=JSON.parse(uStr);if(u.premiumExpiry){if(new Date(u.premiumExpiry)<new Date()){u.premiumExpiry=null;localStorage.setItem('nexalor_user',JSON.stringify(u));return null;}return {expiry:u.premiumExpiry};}}const s=JSON.parse(localStorage.getItem(K.sub)||'null');if(!s)return null;if(new Date(s.expiry)<new Date()){localStorage.removeItem(K.sub);return null;}return s;}catch{return null;}};
const setSub=async(type)=>{if(apiOn){const r=await req('/premium/activate',{method:'POST',body:JSON.stringify({type})});if(r&&r.premiumExpiry){const u=JSON.parse(localStorage.getItem('nexalor_user')||'{}');u.premiumExpiry=r.premiumExpiry;localStorage.setItem('nexalor_user',JSON.stringify(u));updateSubTimer();return;}}const now=new Date();let expiry=new Date();if(type==='day')expiry.setHours(now.getHours()+24);else if(type==='week')expiry.setDate(now.getDate()+7);else if(type==='month')expiry.setMonth(now.getMonth()+1);localStorage.setItem(K.sub,JSON.stringify({type,expiry:expiry.toISOString()}));updateSubTimer();};

function updateSubTimer(){
  let el=document.getElementById('subTimer');
  const s=getSub();
  const userStr=localStorage.getItem('nexalor_user');
  let isAdmin=false;
  if(userStr){try{isAdmin=JSON.parse(userStr).role==='admin';}catch{}}
  
  if(!s){if(el)el.remove();return;}
  if(!el){
    el=document.createElement('div');el.id='subTimer';el.className='sub-timer-box';
    const sb=document.getElementById('sidebar');
    if(sb)sb.prepend(el);else document.body.appendChild(el);
  }
  const tick=()=>{
    if(isAdmin){
      el.innerHTML=`<div class="timer-title">💎 Premium Admin</div><div class="timer-val">Accès Illimité</div>`;
      return;
    }
    const now=new Date().getTime(),exp=new Date(s.expiry).getTime(),diff=exp-now;
    if(diff<=0){localStorage.removeItem(K.sub);el.remove();return;}
    const d=Math.floor(diff/(1000*60*60*24)),h=Math.floor((diff%(1000*60*60*24))/(1000*60*60)),m=Math.floor((diff%(1000*60*60))/(1000*60)),sec=Math.floor((diff%(1000*60))/1000);
    el.innerHTML=`<div class="timer-title">💎 Premium</div><div class="timer-val">${d>0?d+'j ':''}${h}h ${m}m ${sec}s</div>`;
  };
  tick();
  if(!window.subInterval)window.subInterval=setInterval(tick,1000);
}

const token=()=>{try{const u=JSON.parse(localStorage.getItem('nexalor_user')||'{}');return u.token||localStorage.getItem(K.token)||'';}catch{return localStorage.getItem(K.token)||'';}};
async function req(path,opt={}){
  const h={'Content-Type':'application/json',...(opt.headers||{})};
  const tk=token();
  if(tk)h.Authorization=`Bearer ${tk}`;
  try{
    const r=await fetch(API+path,{...opt,headers:h});
    if(!r.ok)return{error:await r.text(),status:r.status};
    const ct=r.headers.get('content-type')||'';
    return ct.includes('application/json')?await r.json():{};
  }catch(e){
    console.error("API error:",e);
    return null;
  }
}
async function pingApi(){
  try{
    const c=new AbortController();
    setTimeout(()=>c.abort(),2000);
    const r=await fetch(API+'/health',{signal:c.signal});
    apiOn=r.ok;
  }catch{
    apiOn=false;
  }
}

function initStore(){if(!localStorage.getItem(K.videos))localStorage.setItem(K.videos,JSON.stringify(SEED));if(!localStorage.getItem(K.likes))localStorage.setItem(K.likes,'{}');if(!localStorage.getItem(K.history))localStorage.setItem(K.history,'{}');if(!localStorage.getItem(K.comments))localStorage.setItem(K.comments,'{}');if(!localStorage.getItem(K.visitor))localStorage.setItem(K.visitor,`v_${Date.now()}_${Math.random().toString(36).slice(2,8)}`);if(!localStorage.getItem(K.categories))localStorage.setItem(K.categories,JSON.stringify(CATS));if(!localStorage.getItem(K.settings))localStorage.setItem(K.settings,JSON.stringify(DEF_SETTINGS));}
const visitor=()=>localStorage.getItem(K.visitor)||'visitor_unknown';
const gv=()=>{try{return JSON.parse(localStorage.getItem(K.videos)||'[]');}catch{return[];}};
const sv=(x)=>localStorage.setItem(K.videos,JSON.stringify(x));
const gl=()=>{try{return JSON.parse(localStorage.getItem(K.likes)||'{}');}catch{return{};}};
const sl=(x)=>localStorage.setItem(K.likes,JSON.stringify(x));
const gh=()=>{try{return JSON.parse(localStorage.getItem(K.history)||'{}');}catch{return{};}};
const sh=(x)=>localStorage.setItem(K.history,JSON.stringify(x));
const gc=()=>{try{return JSON.parse(localStorage.getItem(K.comments)||'{}');}catch{return{};}};
const sc=(x)=>localStorage.setItem(K.comments,JSON.stringify(x));
const gcat=()=>{try{return JSON.parse(localStorage.getItem(K.categories)||JSON.stringify(CATS));}catch{return[...CATS];}};
const scat=(x)=>localStorage.setItem(K.categories,JSON.stringify(x));
const gs=()=>{try{return {...DEF_SETTINGS,...JSON.parse(localStorage.getItem(K.settings)||'{}')};}catch{return {...DEF_SETTINGS};}};
const ss=(x)=>localStorage.setItem(K.settings,JSON.stringify(x));
function applyTheme(s){const r=document.documentElement;if(!r||!s)return;r.style.setProperty('--primary',s.colorPrimary||DEF_SETTINGS.colorPrimary);r.style.setProperty('--primary-2',s.colorSecondary||DEF_SETTINGS.colorSecondary);r.style.setProperty('--bg-main',s.colorBgMain||DEF_SETTINGS.colorBgMain);r.style.setProperty('--bg-soft',s.colorBgSoft||DEF_SETTINGS.colorBgSoft);document.querySelectorAll('.logo').forEach(el=>el.textContent=s.logoText||'NEXALOR');document.querySelectorAll('.site-footer').forEach(el=>el.textContent=s.footerText||'BY YOUNSOUGLUOU');}
async function syncSettingsAndCategories(){settingsCache=gs();categoriesCache=gcat();if(apiOn){const [sr,cr]=await Promise.all([req('/settings'),req('/categories')]);if(sr&&sr.settings){settingsCache={...DEF_SETTINGS,...sr.settings};ss(settingsCache);}if(cr&&Array.isArray(cr.categories)&&cr.categories.length>0){categoriesCache=[...new Set(cr.categories)];scat(categoriesCache);}}applyTheme(settingsCache);}
const fd=(s)=>{const d=new Date(s);return Number.isNaN(d.getTime())?'Date inconnue':new Intl.DateTimeFormat('fr-FR',{day:'2-digit',month:'short',year:'numeric'}).format(d);};
const fdt=(s)=>{const d=new Date(s);return Number.isNaN(d.getTime())?'Date inconnue':new Intl.DateTimeFormat('fr-FR',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(d);};

async function pull(){const d=await req('/videos');if(d&&!d.error&&Array.isArray(d.videos))sv(d.videos);} 
function loader(){const l=document.getElementById('loader');if(!l)return;setTimeout(()=>{l.classList.add('hide');setTimeout(()=>l.remove(),420);},420);} 
function burger(){const b=document.getElementById('burgerBtn'),s=document.getElementById('sidebar');if(!b||!s)return;b.onclick=()=>s.classList.toggle('open');document.addEventListener('click',e=>{if(!s.classList.contains('open'))return;const t=e.target;if(!(t instanceof HTMLElement))return;if(!s.contains(t)&&!b.contains(t))s.classList.remove('open');});}
function readFile(f){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(String(r.result||''));r.onerror=()=>rej(new Error('read'));r.readAsDataURL(f);});}

function card(v,i=0){const a=document.createElement('article');a.className='video-card';a.style.animationDelay=`${Math.min(i*0.06,0.45)}s`;a.innerHTML=`<img src="${v.thumbnail}" alt="${v.title}" loading="lazy"/><div class="card-body"><h2 class="card-title">${v.title}</h2><p class="meta"><span>${v.views} vues</span><span>${v.likes} likes</span><span>${fd(v.publishedAt)}</span></p></div>`;a.onclick=()=>location.href=`video.html?id=${encodeURIComponent(v.id)}`;return a;}
function grid(vs,id='videosGrid',eid='emptyState',q=''){const g=document.getElementById(id),e=document.getElementById(eid);if(!g||!e)return;const t=q.trim().toLowerCase();const f=vs.filter(v=>v.title.toLowerCase().includes(t)||v.description.toLowerCase().includes(t)||String(v.category||'').toLowerCase().includes(t));g.innerHTML='';f.forEach((v,i)=>g.appendChild(card(v,i)));e.classList.toggle('hidden',f.length>0);} 
function home(){const s=document.getElementById('searchInput');if(!s)return;const p=new URLSearchParams(location.search).get('q')||'';if(p)s.value=p;grid(gv(),'videosGrid','emptyState',p);s.oninput=()=>grid(gv(),'videosGrid','emptyState',s.value);} 

function incLocal(id){const v=gv(),i=v.findIndex(x=>x.id===id);if(i<0)return null;v[i].views++;sv(v);return v[i];}
async function incView(id){const local=incLocal(id);if(!apiOn)return local;const d=await req(`/videos/${encodeURIComponent(id)}/view`,{method:'POST'});if(!d||d.error||typeof d.views!=='number')return local;const v=gv(),i=v.findIndex(x=>x.id===id);if(i>=0){v[i].views=d.views;sv(v);return v[i];}return local;}
function addHistory(v){const m=gh(),k=visitor(),arr=Array.isArray(m[k])?m[k]:[];arr.unshift({videoId:v.id,title:v.title,thumbnail:v.thumbnail,watchedAt:new Date().toISOString()});m[k]=arr.slice(0,200);sh(m);} 

async function videoPage(){const p=document.getElementById('playerColumn'),r=document.getElementById('recommendations'),s=document.getElementById('searchInput');if(!p||!r)return;if(s)s.onkeydown=e=>{if(e.key==='Enter'&&s.value.trim())location.href=`index.html?q=${encodeURIComponent(s.value.trim())}`;};const id=new URLSearchParams(location.search).get('id');const list=gv();const v0=list.find(x=>x.id===id)||list[0];if(!v0){p.innerHTML='<p>Aucune video disponible.</p>';return;}const v=(await incView(v0.id))||v0;addHistory(v);const liked=Boolean(gl()[v.id]);
p.innerHTML=`<div class="video-player-wrap"><video id="mainVideo" controls src="${v.videoUrl}" poster="${v.thumbnail}"></video><button class="btn fullscreen-btn" id="fullscreenBtn">Plein ecran</button></div><div class="player-meta"><h1>${v.title}</h1><div class="player-stats"><span id="viewsCount">${v.views} vues</span><button class="btn like-btn ${liked?'liked':''}" id="likeBtn">Like <span id="likesCount">${v.likes}</span></button></div><p class="description">${v.description}</p><section class="comments-section"><h2>Commentaires</h2><form id="commentForm" class="comment-form"><input id="commentAuthor" type="text" placeholder="Ton nom (optionnel)"/><textarea id="commentInput" rows="3" placeholder="Ecris ton commentaire..." required></textarea><button type="submit" class="btn">Publier</button></form><div id="commentsList" class="comments-list"></div></section></div>`;
const lb=document.getElementById('likeBtn'),lc=document.getElementById('likesCount'),vw=document.getElementById('viewsCount'),fb=document.getElementById('fullscreenBtn'),mv=document.getElementById('mainVideo'),cf=document.getElementById('commentForm'),ca=document.getElementById('commentAuthor'),ci=document.getElementById('commentInput'),cl=document.getElementById('commentsList');
const renderComments=async()=>{if(!cl)return;let arr=[];if(apiOn){const d=await req(`/videos/${encodeURIComponent(v.id)}/comments`);arr=d&&Array.isArray(d.comments)?d.comments:[];}else{arr=Array.isArray(gc()[v.id])?gc()[v.id]:[];}cl.innerHTML='';if(arr.length===0){cl.innerHTML='<p class="meta">Aucun commentaire pour le moment.</p>';return;}arr.forEach(c=>{const canDel=c.authorId===visitor()||Boolean(token());const it=document.createElement('article');it.className='comment-item';it.innerHTML=`<div class="comment-top"><h4>${c.author}</h4>${canDel?'<button type="button" class="btn danger comment-delete-btn">Supprimer</button>':''}</div><p>${c.message}</p><span>${fdt(c.createdAt)}</span>`;if(canDel){const b=it.querySelector('.comment-delete-btn');if(b)b.onclick=async()=>{if(!confirm('Supprimer ce commentaire ?'))return;if(apiOn&&c.id){await req(`/comments/${encodeURIComponent(c.id)}`,{method:'DELETE',body:JSON.stringify({visitorId:visitor()})});}else{const m=gc(),a=Array.isArray(m[v.id])?m[v.id]:[];m[v.id]=a.filter(x=>x.id!==c.id);sc(m);}await renderComments();};}cl.appendChild(it);});};
if(apiOn&&typeof EventSource!=='undefined'){const es=new EventSource(`${API}/videos/${encodeURIComponent(v.id)}/stream`);es.onmessage=async(evt)=>{try{const payload=JSON.parse(evt.data||'{}');if(payload.video){if(vw)vw.textContent=`${payload.video.views} vues`;if(lc)lc.textContent=String(payload.video.likes);}if(Array.isArray(payload.comments)){const m=gc();m[v.id]=payload.comments;sc(m);}await pull();await renderComments();}catch{}};window.addEventListener('beforeunload',()=>es.close(),{once:true});}
if(lb&&lc)lb.onclick=async()=>{if(apiOn){const d=await req(`/videos/${encodeURIComponent(v.id)}/like`,{method:'POST',body:JSON.stringify({visitorId:visitor()})});if(d&&!d.error){lc.textContent=String(d.likes);if(d.liked)lb.classList.add('liked');return;}}const m=gl();if(m[v.id])return;const arr=gv();const i=arr.findIndex(x=>x.id===v.id);if(i<0)return;arr[i].likes++;sv(arr);m[v.id]=true;sl(m);lc.textContent=String(arr[i].likes);lb.classList.add('liked');};
if(fb&&mv)fb.onclick=()=>mv.requestFullscreen&&mv.requestFullscreen();
if(cf instanceof HTMLFormElement&&ci instanceof HTMLTextAreaElement){
  const userStr=localStorage.getItem('nexalor_user');
  if(!userStr){
    cf.innerHTML='<p class="meta" style="background:rgba(255,255,255,0.05);padding:15px;border-radius:10px;text-align:center;">Connectez-vous pour laisser un commentaire.</p>';
  }else{
    const user=JSON.parse(userStr);
    if(ca)ca.value=user.username;
    if(ca)ca.readOnly=true;
    cf.onsubmit=async(e)=>{
      e.preventDefault();
      const msg=ci.value.trim();
      if(!msg)return;
      const author=user.username;
      if(apiOn){
        await req(`/videos/${encodeURIComponent(v.id)}/comments`,{method:'POST',body:JSON.stringify({author,message:msg,visitorId:visitor()})});
      }else{
        const m=gc(),a=Array.isArray(m[v.id])?m[v.id]:[];
        a.unshift({id:`c_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,author,authorId:visitor(),message:msg,createdAt:new Date().toISOString()});
        m[v.id]=a.slice(0,200);sc(m);
      }
      ci.value='';await renderComments();
    };
  }
}
r.innerHTML=gv().filter(x=>x.id!==v.id).map(x=>`<a class="reco-item" href="video.html?id=${encodeURIComponent(x.id)}"><img src="${x.thumbnail}" alt="${x.title}" loading="lazy"/><div><h3>${x.title}</h3><p>${x.views} vues - ${fd(x.publishedAt)}</p></div></a>`).join('');
await renderComments();}

function adminRow(v){const d=document.createElement('div');d.className='admin-row';d.innerHTML=`<img src="${v.thumbnail}" alt="${v.title}"/><div><strong>${v.title}</strong><p class="meta">${v.views} vues - ${v.likes} likes - ${fd(v.publishedAt)} - ${v.category||'General'}</p></div><div class="admin-actions"><button class="btn edit-btn">Modifier</button><button class="btn danger delete-btn">Supprimer</button></div>`;return d;}
function adminPage(){const ls=document.getElementById('adminLogin'),ps=document.getElementById('adminPanel'),lf=document.getElementById('loginForm'),err=document.getElementById('loginError'),lo=document.getElementById('logoutBtn'),pf=document.getElementById('publishForm'),list=document.getElementById('adminVideosList'),st=document.getElementById('adminStatus');if(!ls||!ps||!lf||!err||!lo||!pf||!list)return;const msg=(m,e=false)=>{if(!st)return;st.textContent=m;st.style.color=e?'#ff8fa2':'';};const setS=b=>localStorage.setItem(K.admin,b?'1':'0');const isS=()=>{
  try {
    const u = JSON.parse(localStorage.getItem('nexalor_user') || '{}');
    if (u.role === 'admin') return true;
    return localStorage.getItem(K.admin)==='1';
  } catch {
    return localStorage.getItem(K.admin)==='1';
  }
};
const toggle=()=>{const c=isS();ls.classList.toggle('hidden',c);ps.classList.toggle('hidden',!c);lo.classList.toggle('hidden',!c);};
const render=async()=>{if(apiOn)await pull();const v=gv();list.innerHTML='';if(v.length===0){list.innerHTML='<p class="meta">Aucune video publiee pour le moment.</p>';return;}v.forEach(it=>{const row=adminRow(it),db=row.querySelector('.delete-btn'),eb=row.querySelector('.edit-btn');if(db)db.onclick=async()=>{if(!confirm(`Supprimer la video \"${it.title}\" ?`))return;if(apiOn){const r=await req(`/videos/${encodeURIComponent(it.id)}`,{method:'DELETE'});if(!r||r.error)return msg('Echec suppression.',true);await pull();}else sv(gv().filter(x=>x.id!==it.id));await render();msg('Video supprimee.');};if(eb)eb.onclick=async()=>{const t=prompt('Nouveau titre:',it.title);if(!t)return;const d=prompt('Nouvelle description:',it.description);if(!d)return;const c=prompt('Nouvelle categorie:',it.category||'General');if(!c)return;if(apiOn){const r=await req(`/videos/${encodeURIComponent(it.id)}`,{method:'PUT',body:JSON.stringify({title:t.trim(),description:d.trim(),category:c.trim()||'General'})});if(!r||r.error)return msg('Echec modification.',true);await pull();}else{const a=gv(),i=a.findIndex(x=>x.id===it.id);if(i<0)return;a[i].title=t.trim();a[i].description=d.trim();a[i].category=c.trim()||'General';sv(a);}await render();msg('Video modifiee.');};list.appendChild(row);});};
lf.onsubmit=async(e)=>{e.preventDefault();const i=document.getElementById('adminPassword');if(!(i instanceof HTMLInputElement))return;const p=i.value.trim();if(apiOn){const r=await req('/admin/login',{method:'POST',body:JSON.stringify({password:p})});if(r&&!r.error&&r.token){localStorage.setItem(K.token,r.token);setS(true);err.classList.add('hidden');i.value='';toggle();await render();return msg('Connecte au backend admin.');}return err.classList.remove('hidden');}if(p===ADMIN_PASSWORD){setS(true);err.classList.add('hidden');i.value='';toggle();await render();msg('Mode local actif.');}else err.classList.remove('hidden');};
const pi=document.getElementById('adminPassword');if(pi instanceof HTMLInputElement)pi.oninput=()=>err.classList.add('hidden');lo.onclick=()=>{setS(false);localStorage.removeItem(K.token);localStorage.removeItem('nexalor_user');toggle();location.href='index.html';};
pf.onsubmit=async(e)=>{
e.preventDefault();
const t=document.getElementById('titleInput'),d=document.getElementById('descriptionInput'),cs=document.getElementById('categorySelect'),cc=document.getElementById('customCategoryInput'),vu=document.getElementById('videoUrlInput'),vf=document.getElementById('videoFileInput'),tu=document.getElementById('thumbnailInput'),tf=document.getElementById('thumbnailFileInput'),sb=pf.querySelector("button[type='submit']");
if(!(t instanceof HTMLInputElement)||!(d instanceof HTMLTextAreaElement)||!(cs instanceof HTMLSelectElement)||!(cc instanceof HTMLInputElement)||!(vu instanceof HTMLInputElement)||!(vf instanceof HTMLInputElement)||!(tu instanceof HTMLInputElement)||!(tf instanceof HTMLInputElement))return;
const done=()=>{if(sb instanceof HTMLButtonElement){sb.disabled=false;sb.style.opacity='';sb.textContent='Publier';}};
let vs=vu.value.trim(),ts=tu.value.trim();
if(sb instanceof HTMLButtonElement){sb.disabled=true;sb.style.opacity='0.7';sb.textContent='Publication...';}
try{
const vfile=vf.files&&vf.files[0]?vf.files[0]:null,tfile=tf.files&&tf.files[0]?tf.files[0]:null;
if(!vs&&vfile)vs=await readFile(vfile);
if(!ts&&tfile)ts=await readFile(tfile);
}catch{msg('Erreur televersement.',true);done();return;}
if(!vs||!ts){msg('Ajoute URL ou fichier pour video et miniature.',true);done();return;}
if(!cs.value){msg('Choisis une categorie.',true);done();return;}
if(cs.value==='Autre'&&!cc.value.trim()){msg('Ecris une categorie personnalisee.',true);done();return;}
const nv={title:t.value.trim(),description:d.value.trim(),videoUrl:vs,thumbnail:ts,category:cs.value==='Autre'?cc.value.trim():cs.value,publishedAt:new Date().toISOString().slice(0,10)};
if(!nv.title||!nv.description){msg('Titre et description obligatoires.',true);done();return;}

if(apiOn){
const r=await req('/videos',{method:'POST',body:JSON.stringify(nv)});
if(!r||r.error){msg('Publication backend refusee.',true);done();return;}
await pull();
}else{
const a=gv();a.unshift({id:String(Date.now()),...nv,views:0,likes:0});sv(a);
}
pf.reset();cc.classList.add('hidden');await render();
msg(apiOn?'Video publiee et synchronisee globalement.':'Video publiee en mode local.');
done();
};
const csel=document.getElementById('categorySelect'),ccin=document.getElementById('customCategoryInput');if(csel instanceof HTMLSelectElement&&ccin instanceof HTMLInputElement)csel.onchange=()=>{const c=csel.value==='Autre';ccin.classList.toggle('hidden',!c);if(!c)ccin.value='';};toggle();if(!apiOn)msg('Backend API indisponible: mode local uniquement (non global).',true);if(isS())render();}

function trends(){const s=document.getElementById('searchInput'),f=()=>[...gv()].sort((a,b)=>b.views-a.views);grid(f());if(s)s.oninput=()=>grid(f(),'videosGrid','emptyState',s.value);} 
function subs(){
  const s=document.getElementById('searchInput'),m=gl(),f=()=>gv().filter(v=>Boolean(m[v.id]));
  grid(f());
  if(s)s.oninput=()=>grid(f(),'videosGrid','emptyState',s.value);
  
  document.querySelectorAll('.pricing-card').forEach((card,i)=>{
    const btn=card.querySelector('.pricing-btn');
    if(!btn)return;
    const types=['day','week','month'];
    btn.onclick=()=>location.href=`checkout.html?plan=${types[i]}`;
  });
}

function checkoutPage(){
  const userStr=localStorage.getItem('nexalor_user');
  if(!userStr){
    alert('Veuillez vous connecter pour souscrire à un abonnement.');
    location.href='auth.html';
    return;
  }
  const urlParams=new URLSearchParams(location.search),plan=urlParams.get('plan')||'day';
  const plans={day:{n:'Journée',p:'1€',d:'24 heures de Premium'},week:{n:'Semaine',p:'5€',d:'7 jours de Premium'},month:{n:'Mois',p:'20€',d:'1 mois de Premium'}};
  const info=plans[plan]||plans.day;
  
  const en=document.getElementById('planName'),ep=document.getElementById('planPrice'),ed=document.getElementById('planDesc'),form=document.getElementById('paymentForm');
  if(en)en.textContent=info.n;if(ep)ep.textContent=info.p;if(ed)ed.textContent=info.d;
  
  if(form instanceof HTMLFormElement){
    form.onsubmit=(e)=>{
      e.preventDefault();
      const btn=document.getElementById('payBtn');
      if(btn instanceof HTMLButtonElement){
        btn.disabled=true;btn.textContent='Traitement en cours...';
        setTimeout(async ()=>{
          await setSub(plan);
          alert('Paiement réussi ! Votre accès Premium est maintenant actif.');
          location.href='index.html';
        },2000);
      }
    };
  }
}
function byCat(v){return v.reduce((a,x)=>{const n=(x.category||'General').trim();if(!a[n])a[n]=[];a[n].push(x);return a;},{});} 
function catsPage(){const fi=document.getElementById('categoryFilters'),w=document.getElementById('categoriesWrap'),e=document.getElementById('emptyState'),s=document.getElementById('searchInput');if(!fi||!w||!e)return;let selected='Toutes';const render=(term='')=>{const g=byCat(gv()),all=Array.from(new Set([...(categoriesCache||CATS),...Object.keys(g)])).sort((a,b)=>a.localeCompare(b)),q=term.trim().toLowerCase(),cats=all.filter(k=>k.toLowerCase().includes(q)&&(selected==='Toutes'||k===selected));w.innerHTML='';cats.forEach(name=>{const sec=document.createElement('section');sec.className='category-block';sec.innerHTML=`<h2 class="section-subtitle"><a href="${CAT_PAGES[name]||'#'}">${name}</a></h2><div class="videos-grid"></div>`;const gd=sec.querySelector('.videos-grid');if(gd){const arr=g[name]||[];arr.forEach((v,i)=>gd.appendChild(card(v,i)));if(arr.length===0)gd.innerHTML='<p class="meta">Aucune video dans cette categorie pour le moment.</p>';}w.appendChild(sec);});e.classList.toggle('hidden',cats.length>0);fi.innerHTML='';['Toutes',...all].forEach(name=>{const b=document.createElement('button');b.type='button';b.className=`category-chip ${selected===name?'active':''}`;b.textContent=name;b.onclick=()=>{if(name!=='Toutes'&&CAT_PAGES[name])return(location.href=CAT_PAGES[name]);selected=name;render(s?s.value:'');};fi.appendChild(b);});};render();if(s)s.oninput=()=>render(s.value);} 
function oneCat(){const s=document.getElementById('searchInput'),t=document.getElementById('categoryPageTitle'),c=(document.body.dataset.category||'').trim();if(!t||!c)return;t.textContent=`Categorie: ${c}`;const f=()=>gv().filter(v=>(v.category||'General').trim().toLowerCase()===c.toLowerCase());grid(f());if(s)s.oninput=()=>grid(f(),'videosGrid','emptyState',s.value);} 
function history(){const l=document.getElementById('historyList'),e=document.getElementById('emptyState'),s=document.getElementById('searchInput'),b=document.getElementById('clearHistoryBtn');if(!l||!e||!s||!b)return;const id=visitor(),render=(q='')=>{const m=gh(),arr=Array.isArray(m[id])?m[id]:[],f=arr.filter(x=>x.title.toLowerCase().includes(q.trim().toLowerCase()));l.innerHTML='';f.forEach(x=>{const a=document.createElement('a');a.className='history-item';a.href=`video.html?id=${encodeURIComponent(x.videoId)}`;a.innerHTML=`<img src="${x.thumbnail}" alt="${x.title}" loading="lazy"/><div><h3>${x.title}</h3><p>Regarde le ${fdt(x.watchedAt)}</p></div>`;l.appendChild(a);});e.classList.toggle('hidden',f.length>0);};b.onclick=()=>{const m=gh();m[id]=[];sh(m);render(s.value);};s.oninput=()=>render(s.value);render();}

function authPage(){
  const tabL=document.getElementById('tabLogin'),tabR=document.getElementById('tabRegister'),form=document.getElementById('authForm'),btn=document.getElementById('authBtn'),err=document.getElementById('authError');
  let mode='login';
  if(!tabL||!tabR||!form||!btn||!err)return;
  const toggle=(m)=>{
    mode=m;
    tabL.classList.toggle('active',mode==='login');
    tabR.classList.toggle('active',mode==='register');
    btn.textContent=mode==='login'?'Se connecter':'S\'inscrire';
    err.classList.add('hidden');
  };
  tabL.onclick=()=>toggle('login');
  tabR.onclick=()=>toggle('register');
  form.onsubmit=async(e)=>{
    e.preventDefault();
    const u=document.getElementById('username').value.trim(),p=document.getElementById('password').value;
    if(!u||!p)return;
    btn.disabled=true;btn.style.opacity='0.7';
    const path=mode==='login'?'/auth/login':'/auth/register';
    const r=await req(path,{method:'POST',body:JSON.stringify({username:u,password:p})});
    btn.disabled=false;btn.style.opacity='';
    if(r&&!r.error){
      localStorage.setItem('nexalor_user',JSON.stringify({username:r.username,token:r.token,role:r.role||'user',premiumExpiry:r.premiumExpiry}));
      location.href='index.html';
    }else{
      err.textContent=r&&r.error?r.error:(mode==='login'?'Identifiants invalides':'Erreur lors de l\'inscription');
      err.classList.remove('hidden');
    }
  };
}

function updateTopbar(){
  const trs=document.querySelectorAll('.topbar-right');
  const userStr=localStorage.getItem('nexalor_user');
  trs.forEach(tr=>{
    if(userStr){
      const user=JSON.parse(userStr);
      // On affiche "Admin" si le rôle est admin, sinon le nom d'utilisateur
      const displayName = user.role === 'admin' ? 'Admin' : user.username;
      tr.innerHTML=`<span style="margin-right:10px; font-weight:600; color:var(--primary-2)">${displayName}</span>${user.role==='admin'?'<a href="admin.html" class="btn" style="margin-right:10px; padding:8px 15px;">Panel Admin</a>':''}<button class="btn danger" id="logoutBtn" style="padding:8px 15px;">Déconnexion</button>`;
      const lo=tr.querySelector('#logoutBtn');
      if(lo)lo.onclick=()=>{localStorage.removeItem('nexalor_user');location.reload();};
    }else{
      tr.innerHTML=`<a class="btn" href="auth.html">Connexion / Inscription</a>`;
    }
  });
}

async function init(){initStore();loader();burger();await pingApi();await pull();await syncSettingsAndCategories();updateSubTimer();updateTopbar();const p=document.body.dataset.page;if(p==='home')home();if(p==='video')await videoPage();if(p==='admin')adminPage();if(p==='trends')trends();if(p==='subscriptions')subs();if(p==='checkout')checkoutPage();if(p==='categories')catsPage();if(p==='category')oneCat();if(p==='history')history();if(p==='auth')authPage();}
document.addEventListener('DOMContentLoaded',()=>{init();});



