const ADMIN_HASH = "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92"; // Hash de 000000
let appConfig = null;
let currentEditingId = null;

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    lucide.createIcons();
    await loadAppConfig();
    setupListeners();
});

async function loadAppConfig() {
    try {
        const response = await fetch('config.json?v=' + Date.now());
        appConfig = await response.json();
        updateUI();
        renderFiles(appConfig.files);
    } catch (e) { console.error("Erro ao carregar config.json", e); }
}

function updateUI() {
    document.getElementById('ui-home-title').innerText = appConfig.ui.homeTitle;
    document.getElementById('ui-home-desc').innerText = appConfig.ui.homeDescription;
}

function renderFiles(files) {
    const grid = document.getElementById('files-grid');
    grid.innerHTML = files.map(file => `
        <div class="glass rounded-3xl overflow-hidden group hover:scale-[1.02] transition-all duration-300">
            <div class="h-48 overflow-hidden relative">
                <img src="${file.thumb}" class="w-full h-full object-cover opacity-80">
            </div>
            <div class="p-8">
                <h3 class="text-xl font-bold mb-2">${file.title}</h3>
                <p class="text-slate-400 text-sm mb-6 h-10 overflow-hidden">${file.description}</p>
                <a href="${file.downloadUrl}" target="_blank" class="flex items-center justify-center gap-3 bg-white text-slate-900 font-black py-4 rounded-2xl hover:bg-sky-400 transition-colors">
                    <i data-lucide="download" class="w-5 h-5"></i> BAIXAR
                </a>
            </div>
        </div>
    `).join('');
    lucide.createIcons();
}

function setupListeners() {
    const search = document.getElementById('main-search');
    search.addEventListener('keyup', async (e) => {
        const val = e.target.value;
        if (val === '000000') { // Gatilho de acesso
            document.getElementById('view-library').classList.add('admin-hidden');
            document.getElementById('view-admin').classList.remove('admin-hidden');
            search.value = '';
            renderAdminList();
        }
        filterItems(val);
    });

    document.getElementById('gh-token').addEventListener('input', async (e) => {
        const token = e.target.value.trim();
        if (token.length >= 40) {
            await loadFileFromGitHub(token, 'config.json', 'json-editor');
            await loadFileFromGitHub(token, 'index.html', 'code-editor');
        }
    });
}

async function loadFileFromGitHub(token, path, targetId) {
    const url = `https://api.github.com/repos/${appConfig.github.owner}/${appConfig.github.repo}/contents/${path}`;
    const el = document.getElementById(targetId);
    try {
        const res = await fetch(url, { headers: { 'Authorization': `token ${token}` } });
        if (res.ok) {
            const data = await res.json();
            el.value = decodeURIComponent(escape(atob(data.content)));
            el.dataset.sha = data.sha;
            el.readOnly = false;
        }
    } catch (e) { console.error("Erro GitHub:", e); }
}

async function saveNewOrEditedFile() {
    const title = document.getElementById('form-title').value;
    const thumb = document.getElementById('form-thumb').value;
    const url = document.getElementById('form-url').value;
    const cat = document.getElementById('form-category').value;
    const desc = document.getElementById('form-desc').value;
    const token = document.getElementById('gh-token').value;

    if (!title || !url || !token) return alert("Preencha Título, URL e Token!");

    const newEntry = {
        id: currentEditingId || Date.now().toString(),
        title, thumb, downloadUrl: url, category: cat, description: desc
    };

    if (currentEditingId) {
        appConfig.files = appConfig.files.map(f => f.id === currentEditingId ? newEntry : f);
    } else {
        appConfig.files.unshift(newEntry);
    }

    await syncAndCommit();
    clearForm();
}

async function syncAndCommit() {
    const jsonStr = JSON.stringify(appConfig, null, 2);
    const sha = document.getElementById('json-editor').dataset.sha;
    const token = document.getElementById('gh-token').value;

    const url = `https://api.github.com/repos/${appConfig.github.owner}/${appConfig.github.repo}/contents/config.json`;
    const b64 = btoa(unescape(encodeURIComponent(jsonStr)));

    const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Authorization': `token ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Update via Admin Panel', content: b64, sha })
    });

    if (res.ok) {
        const data = await res.json();
        document.getElementById('json-editor').dataset.sha = data.content.sha;
        alert("✅ Sincronizado com sucesso!");
        renderAdminList();
        renderFiles(appConfig.files);
    } else { alert("❌ Erro ao salvar. Verifique o Token/SHA."); }
}

function renderAdminList() {
    const list = document.getElementById('admin-files-list');
    list.innerHTML = appConfig.files.map(f => `
        <div class="flex items-center gap-4 p-3 bg-slate-950/50 rounded-xl border border-slate-800">
            <img src="${f.thumb}" class="w-10 h-10 object-cover rounded-md opacity-50">
            <div class="flex-1 truncate text-sm font-bold text-slate-300">${f.title}</div>
            <div class="flex gap-2">
                <button onclick="prepareEdit('${f.id}')" class="p-2 hover:text-sky-400"><i data-lucide="edit-3" class="w-4 h-4"></i></button>
                <button onclick="deleteItem('${f.id}')" class="p-2 hover:text-red-400"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
            </div>
        </div>
    `).join('');
    lucide.createIcons();
}

function prepareEdit(id) {
    const f = appConfig.files.find(x => x.id === id);
    currentEditingId = id;
    document.getElementById('form-title').value = f.title;
    document.getElementById('form-thumb').value = f.thumb;
    document.getElementById('form-url').value = f.downloadUrl;
    document.getElementById('form-desc').value = f.description;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function deleteItem(id) {
    if (!confirm("Excluir arquivo?")) return;
    appConfig.files = appConfig.files.filter(f => f.id !== id);
    await syncAndCommit();
}

function clearForm() {
    currentEditingId = null;
    document.querySelectorAll('[id^="form-"]').forEach(i => i.value = "");
}

function filterItems(term) {
    const filtered = appConfig.files.filter(f => f.title.toLowerCase().includes(term.toLowerCase()));
    renderFiles(filtered);
}
