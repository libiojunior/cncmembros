
// Configurações do GitHub
const githubConfig = {
    owner: 'libiojunior',
    repo: 'cncmembros',
    path: 'index.html'
};

// Inicializar Ícones
lucide.createIcons();

// Monitor de Busca e Senha
const searchInput = document.getElementById('main-search');

searchInput.addEventListener('keyup', (e) => {
    const value = e.target.value;

    // Se a senha secreta for digitada
    if (value === '000000') {
        openAdminPanel();
        e.target.value = ''; // Limpa o buscador
    }

    // Lógica simples de filtro de arquivos (visual)
    filterFiles(value);
});

function openAdminPanel() {
    document.getElementById('view-library').classList.add('hidden-admin');
    document.getElementById('view-editor').classList.remove('hidden-admin');
    alert("🔓 Modo Administrador Ativado");
    
    // Carrega o código se o editor estiver vazio
    const editor = document.getElementById('code-editor');
    if (editor && editor.value === "") {
        loadCurrentCode();
    }
}

function filterFiles(term) {
    const cards = document.querySelectorAll('#files-grid > div');
    cards.forEach(card => {
        const title = card.querySelector('h3').innerText.toLowerCase();
        if (title.includes(term.toLowerCase())) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Funções de API (loadCurrentCode, saveToGitHub, uploadFileToGitHub) 
// Devem ser coladas aqui conforme o código anterior...
