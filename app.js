// No topo do app.js, adicione estas referências
const jsonEditor = document.getElementById('json-editor');
const homeTitleInput = document.getElementById('edit-home-title');
const homeDescInput = document.getElementById('edit-home-desc');

async function loadAppConfig() {
    try {
        const response = await fetch('config.json');
        appConfig = await response.json();
        
        // Aplica textos na Home
        document.querySelector('h1').innerText = appConfig.ui.homeTitle;
        document.querySelector('#view-library p').innerText = appConfig.ui.homeDescription;
        
        // Preenche inputs no Admin
        homeTitleInput.value = appConfig.ui.homeTitle;
        homeDescInput.value = appConfig.ui.homeDescription;
        
        renderFiles(appConfig.files);
    } catch (e) { console.error("Erro ao carregar config.json"); }
}

// Modifique a função que detecta o Token para carregar ambos os arquivos
document.getElementById('gh-token').addEventListener('input', async (e) => {
    const token = e.target.value.trim();
    if (token.length >= 40) {
        loadSourceFile(token, 'config.json', jsonEditor);
        loadSourceFile(token, 'index.html', document.getElementById('code-editor'));
    }
});

async function loadSourceFile(token, path, targetElement) {
    const url = `https://api.github.com/repos/${appConfig.github.owner}/${appConfig.github.repo}/contents/${path}`;
    try {
        const res = await fetch(url, { headers: { 'Authorization': `token ${token}` } });
        if (res.ok) {
            const data = await res.json();
            const content = decodeURIComponent(escape(atob(data.content)));
            targetElement.value = content;
            targetElement.readOnly = false;
            targetElement.dataset.sha = data.sha; // Armazena o SHA para o salvamento
        }
    } catch (e) { console.error("Erro ao carregar " + path); }
}

async function saveConfigJSON() {
    // Atualiza o objeto com os novos textos dos inputs
    const updatedConfig = JSON.parse(jsonEditor.value);
    updatedConfig.ui.homeTitle = homeTitleInput.value;
    updatedConfig.ui.homeDescription = homeDescInput.value;
    
    await commitToGitHub('config.json', JSON.stringify(updatedConfig, null, 2), jsonEditor.dataset.sha);
}

async function commitToGitHub(path, content, sha) {
    const token = document.getElementById('gh-token').value;
    const url = `https://api.github.com/repos/${appConfig.github.owner}/${appConfig.github.repo}/contents/${path}`;
    
    const b64 = btoa(unescape(encodeURIComponent(content)));
    const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Authorization': `token ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `Update ${path} via Admin`, content: b64, sha: sha })
    });

    if (res.ok) alert(`✅ ${path} atualizado!`);
    else alert(`❌ Erro ao salvar ${path}.`);
}
