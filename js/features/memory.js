// ── Memory page ──
async function loadMemories(){
  try{
    allMemories=await apiFetch('/api/memories');
  }catch(e){ showToast(e.message,'info'); return; }
  updateMemoryCounts();
  applyMemoryFilters();
}

function applyMemoryFilters(){
  const search=(document.querySelector('.mem-search')?.value||'').toLowerCase();
  let data=activeMemCategory==='all'?allMemories:allMemories.filter(m=>m.category===activeMemCategory);
  if(search) data=data.filter(m=>m.title.toLowerCase().includes(search)||m.value.toLowerCase().includes(search));
  renderMemoryGrid(data);
}

function renderMemoryGrid(data){
  const grid=document.getElementById('memory-grid');
  if(!grid) return;
  if(!data.length){
    grid.innerHTML=`<p style="color:var(--ivory-muted);font-size:13px">No memories yet. Add one, or chat with Nexus to start building your memory.</p>`;
    return;
  }
  grid.innerHTML=data.map(m=>`
    <div class="memory-card-item">
      <div class="mci-header">
        <span class="mci-category chip ${getCatChip(m.category)}">${capitalize(m.category)}</span>
        <div class="mci-actions">
          <button class="icon-btn" onclick="openEditMemoryModal(${m.id})">✏️</button>
          <button class="icon-btn" onclick="deleteMemoryItem(${m.id})">🗑</button>
        </div>
      </div>
      <div class="mci-title">${escHtml(m.title)}</div>
      <div class="mci-value">${escHtml(m.value)}</div>
      <div class="mci-tags">${m.tags.map(t=>`<span class="mci-tag">#${escHtml(t)}</span>`).join('')}</div>
      <div class="mci-footer">
        <span class="mci-date">${formatDate(m.created_at)}</span>
        <span class="mci-source">from ${escHtml(m.source)}</span>
      </div>
    </div>
  `).join('');
}

function getCatChip(cat){
  const map={preference:'chip-purple',work:'chip-teal',project:'chip-magenta',profile:'chip-teal',interest:'chip-purple'};
  return map[cat]||'chip-purple';
}

function capitalize(s){ return s ? s.charAt(0).toUpperCase()+s.slice(1) : s; }
function formatDate(iso){ return new Date(iso).toLocaleDateString([],{month:'short',day:'numeric',year:'numeric'}); }

function updateMemoryCounts(){
  const chip=document.getElementById('memory-total-chip');
  if(chip) chip.textContent=`${allMemories.length} memories`;
  const counts={preference:0,work:0,project:0,profile:0,interest:0};
  allMemories.forEach(m=>{ if(counts[m.category]!==undefined) counts[m.category]++; });
  const order=['all','preference','work','project','profile','interest'];
  document.querySelectorAll('.mem-cat').forEach((el,i)=>{
    const countEl=el.querySelector('.mc-count');
    if(!countEl) return;
    const cat=order[i];
    countEl.textContent=cat==='all'?allMemories.length:(counts[cat]||0);
  });
}

function filterMemory(cat,el){
  document.querySelectorAll('.mem-cat').forEach(e=>e.classList.remove('active'));
  el.classList.add('active');
  activeMemCategory=cat;
  applyMemoryFilters();
}

function searchMemories(q){
  applyMemoryFilters();
}

function openAddMemoryModal(){
  editingMemoryId=null;
  document.getElementById('memory-modal-title').textContent='Add Memory';
  document.getElementById('memory-form-id').value='';
  document.getElementById('memory-form-category').value='preference';
  document.getElementById('memory-form-title').value='';
  document.getElementById('memory-form-value').value='';
  document.getElementById('memory-form-tags').value='';
  document.getElementById('memory-modal').classList.add('open');
}

function openEditMemoryModal(id){
  const m=allMemories.find(x=>x.id===id);
  if(!m) return;
  editingMemoryId=id;
  document.getElementById('memory-modal-title').textContent='Edit Memory';
  document.getElementById('memory-form-id').value=id;
  document.getElementById('memory-form-category').value=m.category;
  document.getElementById('memory-form-title').value=m.title;
  document.getElementById('memory-form-value').value=m.value;
  document.getElementById('memory-form-tags').value=m.tags.join(', ');
  document.getElementById('memory-modal').classList.add('open');
}

function closeMemoryModal(){
  document.getElementById('memory-modal').classList.remove('open');
}

async function submitMemoryForm(e){
  e.preventDefault();
  const category=document.getElementById('memory-form-category').value;
  const title=document.getElementById('memory-form-title').value.trim();
  const value=document.getElementById('memory-form-value').value.trim();
  const tags=document.getElementById('memory-form-tags').value.split(',').map(t=>t.trim()).filter(Boolean);
  try{
    if(editingMemoryId){
      await apiFetch(`/api/memories/${editingMemoryId}`,{method:'PUT',body:JSON.stringify({category,title,value,tags})});
      showToast('Memory updated ✓','success');
    }else{
      await apiFetch('/api/memories',{method:'POST',body:JSON.stringify({category,title,value,tags,source:'Manual entry'})});
      showToast('Memory saved ✓','success');
    }
    closeMemoryModal();
    await loadMemories();
  }catch(e){ showToast(e.message,'info'); }
}

async function deleteMemoryItem(id){
  if(!confirm('Delete this memory?')) return;
  try{
    await apiFetch(`/api/memories/${id}`,{method:'DELETE'});
    showToast('Memory deleted','info');
    await loadMemories();
  }catch(e){ showToast(e.message,'info'); }
}

async function clearAllMemories(){
  if(!confirm('This will permanently delete all your memories. Continue?')) return;
  try{
    await apiFetch('/api/memories',{method:'DELETE'});
    showToast('All memories cleared','info');
    await loadMemories();
  }catch(e){ showToast(e.message,'info'); }
}
