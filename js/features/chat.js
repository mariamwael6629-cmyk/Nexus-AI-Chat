// ── Chat logic ──
async function initChatPage(){
  try{
    chatsCache=await apiFetch('/api/chats');
  }catch(e){ showToast(e.message,'info'); return; }
  if(chatsCache.length===0){
    await newChat();
    return;
  }
  if(!currentChatId || !chatsCache.find(c=>c.id===currentChatId)){
    currentChatId=chatsCache[0].id;
  }
  renderChatList();
  await loadChat(currentChatId);
  refreshMemoryBadge();
}

async function refreshMemoryBadge(){
  try{
    const mems=await apiFetch('/api/memories');
    const badge=document.getElementById('chat-memory-badge');
    if(badge) badge.textContent=`🧠 ${mems.length} memories active`;
    renderActiveMemoriesPanel(mems.slice(0,5));
  }catch(e){}
}

function renderActiveMemoriesPanel(mems){
  const panel=document.getElementById('active-memories-panel');
  if(!panel) return;
  const btn=panel.querySelector('button');
  const pillsHtml = mems.length
    ? mems.map(m=>`
        <div class="mem-pill">
          <span>🧠</span>
          <span>${escHtml(m.title)}</span>
        </div>`).join('')
    : `<p style="font-size:12px;color:var(--ivory-muted)">No memories yet — saved memories will show up here.</p>`;
  panel.innerHTML=pillsHtml;
  if(btn) panel.appendChild(btn);
}

function renderChatList(){
  const list=document.getElementById('chat-list');
  if(!list) return;
  list.innerHTML=chatsCache.map(c=>`
    <div class="chat-item ${c.id===currentChatId?'active':''}" onclick="loadChat(${c.id})">
      <div class="chat-item-name">${c.pinned?'📌 ':''}${escHtml(c.name)}</div>
      <div class="chat-item-preview">${escHtml(c.last_message_preview||'Start a new conversation...')}</div>
      <div class="chat-item-meta">
        <span class="chat-item-time">${formatRelativeTime(c.updated_at)}</span>
        <span class="chat-item-actions">
          <span class="icon-btn" title="Rename" onclick="event.stopPropagation();renameChat(${c.id})">✏️</span>
          <span class="icon-btn" title="Delete" onclick="event.stopPropagation();deleteChat(${c.id})">🗑</span>
        </span>
      </div>
    </div>
  `).join('');
}

function formatRelativeTime(iso){
  if(!iso) return '';
  const d=new Date(iso);
  return d.toLocaleDateString([],{month:'short',day:'numeric'})+', '+d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
}

async function loadChat(id){
  currentChatId=id;
  renderChatList();
  const chat=chatsCache.find(c=>c.id===id);
  const titleInput=document.getElementById('chat-title');
  if(titleInput) titleInput.value=chat?chat.name:'';
  const container=document.getElementById('messages-container');
  container.innerHTML=`<div style="text-align:center;padding:8px 0"><span id="chat-memory-notice" style="font-size:12px;color:var(--ivory-muted);background:var(--bg-elevated);padding:6px 14px;border-radius:var(--r-full);border:1px solid var(--border-subtle)">🧠 Loading…</span></div>`;
  try{
    const messages=await apiFetch(`/api/chats/${id}/messages`);
    const notice=document.getElementById('chat-memory-notice');
    if(notice) notice.textContent=messages.length ? `🧠 Nexus uses your memories to personalize replies` : `🧠 Send a message to start this conversation`;
    messages.forEach(m=>m.role==='user' ? appendUserMsg(m.content) : appendAIMsg(m.content,[],false));
    document.getElementById('msg-count').textContent=messages.length;
  }catch(e){
    showToast(e.message,'info');
  }
}

async function newChat(){
  try{
    const chat=await apiFetch('/api/chats',{method:'POST',body:JSON.stringify({name:'New Chat'})});
    chatsCache.unshift(chat);
    currentChatId=chat.id;
    renderChatList();
    await loadChat(chat.id);
    showToast('New chat created','success');
  }catch(e){ showToast(e.message,'info'); }
}

async function deleteChat(id){
  if(!confirm('Delete this conversation?')) return;
  try{
    await apiFetch(`/api/chats/${id}`,{method:'DELETE'});
    chatsCache=chatsCache.filter(c=>c.id!==id);
    showToast('Conversation deleted','info');
    if(currentChatId===id){
      currentChatId=chatsCache[0]?.id||null;
      if(currentChatId) await loadChat(currentChatId);
      else{ document.getElementById('messages-container').innerHTML=''; document.getElementById('chat-title').value=''; }
    }
    renderChatList();
  }catch(e){ showToast(e.message,'info'); }
}

async function renameChat(id){
  const chat=chatsCache.find(c=>c.id===id);
  const n=prompt('Rename chat:',chat?.name||'Chat');
  if(!n) return;
  try{
    const updated=await apiFetch(`/api/chats/${id}`,{method:'PUT',body:JSON.stringify({name:n})});
    const idx=chatsCache.findIndex(c=>c.id===id);
    if(idx>-1) chatsCache[idx]=updated;
    if(id===currentChatId) document.getElementById('chat-title').value=updated.name;
    renderChatList();
    showToast('Renamed ✓','success');
  }catch(e){ showToast(e.message,'info'); }
}

async function updateTitle(v){
  if(!currentChatId||!v.trim()) return;
  try{
    const updated=await apiFetch(`/api/chats/${currentChatId}`,{method:'PUT',body:JSON.stringify({name:v.trim()})});
    const idx=chatsCache.findIndex(c=>c.id===currentChatId);
    if(idx>-1) chatsCache[idx]=updated;
    renderChatList();
    showToast('Title saved ✓','success');
  }catch(e){ showToast(e.message,'info'); }
}

function filterChats(q){
  document.querySelectorAll('.chat-item').forEach(el=>{
    const t=el.querySelector('.chat-item-name')?.textContent||'';
    el.style.display=t.toLowerCase().includes(q.toLowerCase())?'':'none';
  });
}
