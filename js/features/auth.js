async function initApp(){
  renderAuthMode();
  if(authToken){
    try{ await loadCurrentUser(); }
    catch(e){ authToken=null; localStorage.removeItem(TOKEN_KEY); }
  }
}

async function loadCurrentUser(){
  currentUser=await apiFetch('/api/auth/me');
  updateUserChrome();
  return currentUser;
}

function updateUserChrome(){
  if(!currentUser) return;
  const avatar=document.getElementById('user-avatar-chip');
  const name=document.getElementById('user-name-chip');
  const plan=document.getElementById('user-plan-chip');
  if(avatar) avatar.textContent=currentUser.initials;
  if(name) name.textContent=currentUser.full_name;
  if(plan) plan.textContent=currentUser.plan+' plan';
}

function goAppOrAuth(target){
  if(authToken){ showPage(target); }
  else{ pendingTarget=target; showPage('auth'); }
}

function toggleAuthMode(e){
  e.preventDefault();
  authMode = authMode==='login' ? 'register' : 'login';
  renderAuthMode();
}

function renderAuthMode(){
  const nameFields=document.getElementById('auth-name-fields');
  const err=document.getElementById('auth-error');
  if(err) err.style.display='none';
  if(!nameFields) return;
  if(authMode==='login'){
    document.getElementById('auth-title').textContent='Welcome back';
    document.getElementById('auth-sub').textContent='Sign in to continue to Nexus AI';
    nameFields.style.display='none';
    document.getElementById('auth-submit-btn').textContent='Sign in';
    document.getElementById('auth-toggle-text').textContent="Don't have an account?";
    document.getElementById('auth-toggle-link').textContent='Sign up';
  }else{
    document.getElementById('auth-title').textContent='Create your account';
    document.getElementById('auth-sub').textContent='Start building your memory-first AI';
    nameFields.style.display='grid';
    document.getElementById('auth-submit-btn').textContent='Create account';
    document.getElementById('auth-toggle-text').textContent='Already have an account?';
    document.getElementById('auth-toggle-link').textContent='Sign in';
  }
}

async function submitAuthForm(e){
  e.preventDefault();
  const errEl=document.getElementById('auth-error');
  errEl.style.display='none';
  const email=document.getElementById('auth-email').value.trim();
  const password=document.getElementById('auth-password').value;
  const btn=document.getElementById('auth-submit-btn');
  btn.disabled=true;
  try{
    let data;
    if(authMode==='login'){
      data=await apiFetch('/api/auth/login',{method:'POST',body:JSON.stringify({email,password})});
    }else{
      const first_name=document.getElementById('auth-first-name').value.trim();
      const last_name=document.getElementById('auth-last-name').value.trim();
      if(!first_name) throw new Error('First name is required');
      data=await apiFetch('/api/auth/register',{method:'POST',body:JSON.stringify({first_name,last_name,email,password})});
    }
    authToken=data.access_token;
    localStorage.setItem(TOKEN_KEY,authToken);
    document.getElementById('auth-form').reset();
    await loadCurrentUser();
    showToast(authMode==='login' ? 'Welcome back!' : 'Account created ✓','success');
    showPage(pendingTarget||'chat');
  }catch(err){
    errEl.textContent=err.message;
    errEl.style.display='block';
  }finally{
    btn.disabled=false;
  }
}

function logout(silent){
  authToken=null;
  currentUser=null;
  currentSettings=null;
  chatsCache=[];
  allMemories=[];
  currentChatId=null;
  localStorage.removeItem(TOKEN_KEY);
  if(!silent) showToast('Logged out','info');
  showPage('landing');
}
