// ── Messaging ──
async function sendMessage(){
  const inp=document.getElementById('chat-input');
  const msg=inp.value.trim();
  if(!msg||isTyping||!currentChatId) return;
  inp.value='';
  inp.style.height='';
  const cc=document.getElementById('char-count');
  if(cc) cc.textContent='0 / ∞';
  appendUserMsg(msg);
  isTyping=true;
  showTyping();
  try{
    const res=await apiFetch(`/api/chats/${currentChatId}/messages`,{method:'POST',body:JSON.stringify({content:msg})});
    hideTyping();
    appendAIMsg(res.ai_message.content,res.memories_referenced);
    document.getElementById('msg-count').textContent=(parseInt(document.getElementById('msg-count').textContent)||0)+2;
    document.getElementById('session-memories-used').textContent=res.memories_referenced.length;
    const chat=chatsCache.find(c=>c.id===currentChatId);
    if(chat){ chat.message_count=(chat.message_count||0)+2; chat.last_message_preview=res.ai_message.content.slice(0,80); chat.updated_at=res.ai_message.created_at; }
    renderChatList();
  }catch(e){
    hideTyping();
    showToast(e.message,'info');
  }finally{
    isTyping=false;
  }
}

function appendUserMsg(text){
  const c=document.getElementById('messages-container');
  const now=new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
  const el=document.createElement('div');
  el.className='msg-row user-msg';
  el.innerHTML=`<div class="msg-avatar user-avatar-msg">${currentUser?currentUser.initials:'U'}</div>
    <div class="msg-content">
      <div class="msg-sender">You</div>
      <div class="msg-bubble user-bubble">${escHtml(text)}</div>
      <div class="msg-meta"><span>${now}</span></div>
    </div>`;
  c.appendChild(el);
  c.scrollTop=c.scrollHeight;
}

function copyMsg(btn){
  const bubble=btn.closest('.msg-content').querySelector('.msg-bubble');
  navigator.clipboard.writeText(bubble.textContent).then(()=>showToast('Copied!','success'));
}

async function saveMsgToMemory(btn){
  const bubble=btn.closest('.msg-content').querySelector('.msg-bubble');
  const text=bubble.textContent.trim();
  if(!text) return;
  try{
    await apiFetch('/api/memories',{method:'POST',body:JSON.stringify({category:'preference',title:text.slice(0,60),value:text,source:'Chat',tags:[]})});
    showToast('Saved to memory ✓','success');
  }catch(e){ showToast(e.message,'info'); }
}

function appendAIMsg(text,referenced,stream){
  referenced=referenced||[];
  if(stream===undefined) stream=true;
  const c=document.getElementById('messages-container');
  const now=new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
  const el=document.createElement('div');
  el.className='msg-row';
  const bubbleId='bubble-'+Date.now()+'-'+Math.floor(Math.random()*10000);
  el.innerHTML=`<div class="msg-avatar ai-avatar">N</div>
    <div class="msg-content">
      <div class="msg-sender">Nexus AI</div>
      <div class="msg-bubble ai-bubble" id="${bubbleId}"></div>
      <div class="msg-meta">
        <span>${now}</span>
        <div class="msg-actions">
          <button class="icon-btn" title="Copy" onclick="copyMsg(this)">📋</button>
          <button class="icon-btn" title="Save to memory" onclick="saveMsgToMemory(this)">🧠</button>
        </div>
      </div>
    </div>`;
  c.appendChild(el);
  c.scrollTop=c.scrollHeight;
  const bubble=document.getElementById(bubbleId);
  if(stream) streamText(bubble,text);
  else bubble.textContent=text;
}

function streamText(el,text){
  let i=0;
  el.textContent='';
  const interval=setInterval(()=>{
    if(!document.body.contains(el)){ clearInterval(interval); return; }
    if(i<text.length){
      el.textContent+=text[i];
      i++;
      const container=el.closest('.messages');
      if(container) container.scrollTop=99999;
    } else {
      clearInterval(interval);
      el.innerHTML=el.innerHTML.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>');
    }
  },18);
}

function showTyping(){
  isTyping=true;
  const c=document.getElementById('messages-container');
  const t=document.createElement('div');
  t.className='typing-indicator';
  t.id='typing-ind';
  t.innerHTML=`<div class="msg-avatar ai-avatar" style="width:34px;height:34px;font-size:12px">N</div>
    <div class="typing-dots"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>`;
  c.appendChild(t);
  c.scrollTop=c.scrollHeight;
}

function hideTyping(){
  isTyping=false;
  const t=document.getElementById('typing-ind');
  if(t) t.remove();
}

function handleKey(e){
  if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage();}
}

function autoResize(ta){
  ta.style.height='';
  ta.style.height=Math.min(ta.scrollHeight,120)+'px';
  document.getElementById('char-count').textContent=ta.value.length+' / ∞';
}

function triggerFileUpload(){document.getElementById('file-input').click();}

function handleFileUpload(e){
  const files=Array.from(e.target.files);
  const area=document.getElementById('file-preview');
  area.style.display='flex';
  files.forEach(f=>{
    const chip=document.createElement('div');
    chip.className='file-chip';
    const ext=f.name.split('.').pop().toUpperCase();
    chip.innerHTML=`<span>${ext==='PDF'?'📄':ext==='PNG'||ext==='JPG'?'🖼':'📎'}</span>
      <span>${f.name.length>20?f.name.substring(0,20)+'...':f.name}</span>
      <span class="fc-remove" onclick="this.closest('.file-chip').remove();checkFileArea()">×</span>`;
    area.appendChild(chip);
  });
  showToast(`${files.length} file(s) attached`,'success');
}

function checkFileArea(){
  const area=document.getElementById('file-preview');
  if(!area.querySelector('.file-chip')) area.style.display='none';
}

function summarizeChat(){
  showToast('Generating summary…','info');
  setTimeout(()=>showToast('Summary ready — 5 key points','success'),2000);
}

function escHtml(t){
  return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
