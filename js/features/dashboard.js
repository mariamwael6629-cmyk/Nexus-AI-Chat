// ── Dashboard ──
async function loadDashboard(){
  try{
    const data=await apiFetch('/api/dashboard');
    document.getElementById('dash-stat-conversations').textContent=data.stats.total_conversations;
    document.getElementById('dash-stat-memories').textContent=data.stats.saved_memories;
    document.getElementById('dash-stat-messages').textContent=data.stats.messages_sent;
    document.getElementById('dash-stat-accuracy').textContent=data.stats.ai_accuracy+'%';
    renderChart(data.chart);
    renderActivityList(data.recent_activity);
    if(currentUser){
      const heading=document.getElementById('dash-welcome-heading');
      if(heading) heading.textContent=`Good to see you, ${currentUser.first_name||currentUser.full_name} ☀️`;
    }
  }catch(e){ showToast(e.message,'info'); }
}

function renderChart(data){
  const chart=document.getElementById('dash-chart');
  if(!chart||!data) return;
  const max=Math.max(1,...data.map(d=>d.value));
  chart.innerHTML=data.map(d=>`
    <div class="chart-bar-wrap">
      <div class="chart-bar" style="height:${Math.round((d.value/max)*140)}px" title="${d.value} messages"></div>
      <span class="chart-label">${d.label}</span>
    </div>
  `).join('');
}

function renderActivityList(items){
  const list=document.getElementById('dash-activity-list');
  if(!list) return;
  if(!items.length){
    list.innerHTML=`<p style="font-size:13px;color:var(--ivory-muted)">No activity yet — start a conversation to see it here.</p>`;
    return;
  }
  list.innerHTML=items.map(a=>`
    <div class="activity-item">
      <span class="ai-dot" style="background:var(--${a.color})"></span>
      <span class="activity-text">${escHtml(a.text)}</span>
      <span style="font-size:11px;color:var(--ivory-muted)">${escHtml(a.time)}</span>
    </div>
  `).join('');
}
