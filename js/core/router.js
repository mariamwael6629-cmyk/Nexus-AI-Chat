// ── Page routing ──
function showPage(name){
  closeSidebar();
  if(PROTECTED_PAGES.includes(name) && !authToken){
    pendingTarget=name;
    name='auth';
  }
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  const pg=document.getElementById('page-'+name);
  if(pg){
    pg.classList.add('active');
    if(name==='chat') initChatPage();
    if(name==='memory') loadMemories();
    if(name==='settings') loadSettingsPage();
    if(name==='dashboard') loadDashboard();
  }
}

// ── Mobile sidebar ──
function toggleSidebar(){
  document.getElementById('chat-sidebar').classList.toggle('open');
  document.getElementById('sidebar-backdrop').classList.toggle('open');
}
function closeSidebar(){
  document.getElementById('chat-sidebar')?.classList.remove('open');
  document.getElementById('sidebar-backdrop')?.classList.remove('open');
}
