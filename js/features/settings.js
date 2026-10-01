// ── Settings ──
function escAttr(s){ return String(s||'').replace(/"/g,'&quot;'); }

function toggleRow(field,title,desc){
  const checked=currentSettings[field]?'checked':'';
  return `<div class="toggle-row"><div class="toggle-info"><div class="toggle-name">${title}</div><div class="toggle-desc">${desc}</div></div><label class="toggle"><input type="checkbox" ${checked} onchange="saveToggle('${field}',this.checked)"><span class="toggle-slider"></span></label></div>`;
}

async function saveToggle(field,value){
  try{
    currentSettings=await apiFetch('/api/settings',{method:'PUT',body:JSON.stringify({[field]:value})});
    showToast('Saved ✓','success');
  }catch(e){ showToast(e.message,'info'); }
}

async function loadSettingsPage(){
  try{
    const [user,settingsData]=await Promise.all([apiFetch('/api/auth/me'),apiFetch('/api/settings')]);
    currentUser=user;
    currentSettings=settingsData;
    selectedPersonality=currentSettings.ai_personality;
    updateUserChrome();
    renderSettingsTab(activeSettingsTab);
  }catch(e){ showToast(e.message,'info'); }
}

function showSettingsTab(tab,el){
  document.querySelectorAll('.settings-nav-item').forEach(e=>e.classList.remove('active'));
  el.classList.add('active');
  activeSettingsTab=tab;
  renderSettingsTab(tab);
}

function renderSettingsTab(tab){
  const c=document.getElementById('settings-content');
  if(!c||!currentUser||!currentSettings) return;
  const renderers={profile:renderProfileTab,ai:renderAiTab,privacy:renderPrivacyTab,notifications:renderNotificationsTab,billing:renderBillingTab};
  c.innerHTML=(renderers[tab]||renderProfileTab)();
}

function renderProfileTab(){
  return `
    <div class="settings-section">
      <div class="settings-section-title">Profile</div>
      <div class="settings-section-desc">Manage your account information.</div>
      <div class="profile-avatar-row">
        <div class="profile-avatar-large">${currentUser.initials}</div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <div class="form-field"><label class="form-label">First name</label><input class="form-input" id="profile-first-name" value="${escAttr(currentUser.first_name)}"></div>
        <div class="form-field"><label class="form-label">Last name</label><input class="form-input" id="profile-last-name" value="${escAttr(currentUser.last_name)}"></div>
      </div>
      <div class="form-field"><label class="form-label">Email</label><input class="form-input" type="email" value="${escAttr(currentUser.email)}" readonly></div>
      <div class="form-field"><label class="form-label">Role</label><input class="form-input" id="profile-role" value="${escAttr(currentUser.role)}"></div>
      <button class="btn btn-primary btn-sm" onclick="saveProfile()">Save changes</button>
    </div>`;
}

async function saveProfile(){
  const first_name=document.getElementById('profile-first-name').value.trim();
  const last_name=document.getElementById('profile-last-name').value.trim();
  const role=document.getElementById('profile-role').value.trim();
  try{
    currentUser=await apiFetch('/api/users/me',{method:'PUT',body:JSON.stringify({first_name,last_name,role})});
    updateUserChrome();
    showToast('Profile saved ✓','success');
  }catch(e){ showToast(e.message,'info'); }
}

function renderAiTab(){
  return `
    <div class="settings-section">
      <div class="settings-section-title">AI Personality</div>
      <div class="settings-section-desc">Customize how Nexus communicates with you.</div>
      <p style="font-size:13px;color:var(--ivory-dim);margin-bottom:16px">Select a personality style:</p>
      <div class="personality-grid">
        ${PERSONALITY_OPTS.map(p=>`
          <div class="personality-opt ${p.id===currentSettings.ai_personality?'selected':''}" onclick="selectPersonality(this,'${p.id}')">
            <div class="po-icon">${p.icon}</div>
            <div class="po-name">${p.name}</div>
            <div class="po-desc">${p.desc}</div>
          </div>`).join('')}
      </div>
      <div class="settings-divider"></div>
      <div class="form-field"><label class="form-label">Custom AI name</label><input class="form-input" id="settings-ai-name" value="${escAttr(currentSettings.ai_name)}" placeholder="e.g. Aria, Max"></div>
      <div class="form-field"><label class="form-label">Response language</label>
        <select class="form-select" id="settings-response-language">
          ${['English (UK)','English (US)','Arabic','French'].map(l=>`<option ${l===currentSettings.response_language?'selected':''}>${l}</option>`).join('')}
        </select>
      </div>
      <button class="btn btn-primary btn-sm" onclick="saveAiSettings()">Save personality</button>
    </div>`;
}

function selectPersonality(el,id){
  document.querySelectorAll('.personality-opt').forEach(e=>e.classList.remove('selected'));
  el.classList.add('selected');
  selectedPersonality=id;
}

async function saveAiSettings(){
  const ai_name=document.getElementById('settings-ai-name').value.trim()||'Nexus';
  const response_language=document.getElementById('settings-response-language').value;
  try{
    currentSettings=await apiFetch('/api/settings',{method:'PUT',body:JSON.stringify({ai_name,response_language,ai_personality:selectedPersonality})});
    showToast('AI personality saved ✓','success');
  }catch(e){ showToast(e.message,'info'); }
}

function renderPrivacyTab(){
  return `
    <div class="settings-section">
      <div class="settings-section-title">Privacy Controls</div>
      <div class="settings-section-desc">Control what Nexus remembers and how your data is used.</div>
      ${toggleRow('persistent_memory','Enable Persistent Memory','Allow Nexus to remember information across conversations')}
      ${toggleRow('auto_save_preferences','Auto-save Preferences','Automatically detect and save new preferences from chats')}
      ${toggleRow('share_usage_analytics','Share Usage Analytics','Help improve Nexus with anonymized usage data')}
      ${toggleRow('conversation_training','Conversation Training','Allow conversations to improve model quality')}
      <div class="settings-divider"></div>
      <button class="btn btn-ghost btn-sm" onclick="showPage('memory')" style="margin-right:12px">View all memories →</button>
      <button class="btn btn-ghost btn-sm" style="color:var(--danger);border-color:rgba(255,91,91,0.3)" onclick="clearAllMemories()">Clear all memories</button>
    </div>`;
}

function renderNotificationsTab(){
  return `
    <div class="settings-section">
      <div class="settings-section-title">Notifications</div>
      <div class="settings-section-desc">Choose what you want to be notified about.</div>
      ${toggleRow('notify_new_memory','New memory saved','Notify when Nexus learns something new about you')}
      ${toggleRow('notify_weekly_digest','Weekly digest','Summary of your AI usage and insights')}
      ${toggleRow('notify_new_releases','New model releases','Be first to know about Nexus improvements')}
    </div>`;
}

function renderBillingTab(){
  return `
    <div class="settings-section">
      <div class="settings-section-title">Billing</div>
      <div class="settings-section-desc">Manage your subscription and payment.</div>
      <div class="card" style="display:flex;align-items:center;gap:16px;margin-bottom:24px">
        <div style="font-size:28px">✦</div>
        <div><div style="font-weight:600;font-size:15px;color:var(--amethyst-light)">${escHtml(currentUser.plan)} Plan</div><div style="font-size:13px;color:var(--ivory-muted)">No billing provider connected yet.</div></div>
      </div>
      <p style="font-size:13px;color:var(--ivory-muted)">Payments aren't wired up in this demo backend — connect a provider like Stripe to enable upgrades and invoices.</p>
    </div>`;
}
