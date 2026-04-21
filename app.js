// Configuração de Segurança (Hash da senha 000000)
const ADMIN_HASH = "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92";
let appConfig = null;

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    lucide.createIcons();
    await loadAppConfig();
    setupEventListeners();
});

async function loadAppConfig() {
    try {
        const response = await fetch('config.json');
        appConfig = await response.json();
        renderFiles(appConfig.files);
    } catch (e) {
        console.error("Erro ao carregar config.json");
    }
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
                <p class="text-slate-400 text-sm mb-6">${file.description}</p>
                <a href="${file.downloadUrl}" class="flex items-center justify-center gap-3 bg-white text-slate-900 font-black py-4 rounded-2xl hover:bg-sky-400 transition-colors">
                    <i data-lucide="download" class="w-5 h-5"></i> BAIXAR
                </a>
            </div>
        </div>
    `).join('');
    lucide.createIcons();
}

function setupEventListeners() {
    const search = document.getElementById('main-search');
    search.addEventListener('keyup', async (e) => {
        const val = e.target.value;
        if (val.length === 6) {
            const hash = await computeHash(val);
            if (hash === ADMIN_HASH) {
                document.getElementById('view-library').classList.add('admin-hidden');
                document.getElementById('view-admin').classList.remove('admin-hidden');
                search.value = '';
            }
        }
        filterItems(val);
    });

    document.getElementById('gh-token').addEventListener('input', async (e) => {
        if (e.target.value.length >= 40) loadSourceCode(e.target.value);
    });
}

async function computeHash(str) {
    const msgBuffer = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function filterItems(term) {
    const filtered = appConfig.files.filter(f => f.title.toLowerCase().includes(term.toLowerCase()));
    renderFiles(filtered);
}

async function loadSourceCode(token) {
    const editor = document.getElementById('code-editor');
    const url = `https://api.github.com/repos/${appConfig.github.owner}/${appConfig.github.repo}/contents/${appConfig.github.mainPath}`;
    
    try {
        const res = await fetch(url, { headers: { 'Authorization': `token ${token}` } });
        if (res.ok) {
            const data = await res.json();
            editor.value = decodeURIComponent(escape(atob(data.content)));
            editor.readOnly = false;
            editor.placeholder = "Código carregado. Pode editar!";
        }
    } catch (e) { alert("Token inválido."); }
}

async function saveChanges() {
    const token = document.getElementById('gh-token').value;
    const content = document.getElementById('code-editor').value;
    const url = `https://api.github.com/repos/${appConfig.github.owner}/${appConfig.github.repo}/contents/${appConfig.github.mainPath}`;

    try {
        const getRes = await fetch(url, { headers: { 'Authorization': `token ${token}` } });
        const fileData = await getRes.json();
        const b64 = btoa(unescape(encodeURIComponent(content)));

        const putRes = await fetch(url, {
            method: 'PUT',
            headers: { 'Authorization': `token ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'Update via WebAdmin', content: b64, sha: fileData.sha })
        });

        if (putRes.ok) alert("✅ Sucesso! O GitHub atualizará o site em breve.");
    } catch (e) { alert("Erro ao salvar."); }
}
