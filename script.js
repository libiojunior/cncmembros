document.addEventListener('DOMContentLoaded', () => {
    // --- Funções Auxiliares Comuns ---
    // Função para carregar os dados do JSON
    async function loadData() {
        try {
            const response = await fetch('data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Erro ao carregar os dados:', error);
            return { posts: [], downloads: [] };
        }
    }

    // Função para simular o armazenamento local (NÃO É PERSISTENTE ENTRE NAVEGADORES OU APÓS REINÍCIO DO SERVIDOR)
    let currentPosts = [];
    let currentDownloads = [];

    async function initializeData() {
        const data = await loadData();
        currentPosts = data.posts;
        currentDownloads = data.downloads;
    }

    // --- Lógica de Autenticação (Simulada) ---
    function setLoggedIn(isLoggedIn) {
        sessionStorage.setItem('isLoggedIn', isLoggedIn ? 'true' : 'false');
    }

    function isLoggedIn() {
        return sessionStorage.getItem('isLoggedIn') === 'true';
    }

    // --- Lógica para a Página de Login (login.html) ---
    const loginForm = document.getElementById('login-form');
    const loginMessage = document.getElementById('login-message');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            // Credenciais de teste fixas (ATENÇÃO: NÃO SEGURO PARA PRODUÇÃO!)
            const correctUsername = 'admin';
            const correctPassword = 'senha123';

            if (username === correctUsername && password === correctPassword) {
                setLoggedIn(true);
                alert('Login bem-sucedido! Redirecionando para o painel.');
                window.location.href = 'admin.html'; // Redireciona para o painel
            } else {
                loginMessage.textContent = 'Usuário ou senha incorretos.';
                loginMessage.classList.add('error-message');
                loginMessage.style.display = 'block';
            }
        });
    }

    // --- Lógica para o Logout ---
    const logoutButton = document.getElementById('logout-btn');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            setLoggedIn(false);
            alert('Você foi desconectado.');
            window.location.href = 'login.html'; // Redireciona para a página de login
        });
    }

    // --- Lógica para a Página Inicial (index.html) ---
    const postList = document.getElementById('post-list');
    const downloadList = document.getElementById('download-list');

    if (postList && downloadList) { // Verifica se estamos na página inicial
        initializeData().then(() => {
            // Renderizar Postagens
            if (currentPosts && currentPosts.length > 0) {
                postList.innerHTML = currentPosts.map(post => `
                    <div class="post-card">
                        <img src="${post.thumbnail}" alt="${post.title}">
                        <div class="post-content">
                            <h3>${post.title}</h3>
                            <p>${post.content.substring(0, 150)}...</p>
                            <a href="#" class="btn" onclick="showFullPost('${post.id}')">Ver Postagem Completa</a>
                            ${post.downloadLink ? `<a href="${post.downloadLink}" class="btn" download="${post.title.replace(/\s/g, '-')}-download" target="_blank">Download</a>` : ''}
                        </div>
                    </div>
                `).join('');
            } else {
                postList.innerHTML = '<p>Nenhuma postagem disponível ainda.</p>';
            }

            // Renderizar Downloads
            if (currentDownloads && currentDownloads.length > 0) {
                downloadList.innerHTML = currentDownloads.map(download => `
                    <div class="download-card">
                        <div class="download-content">
                            <h3>${download.title}</h3>
                            <p>${download.description}</p>
                            <a href="${download.link}" class="btn" download="${download.title.replace(/\s/g, '-')}" target="_blank">Download</a>
                        </div>
                    </div>
                `).join('');
            } else {
                downloadList.innerHTML = '<p>Nenhum item de download disponível ainda.</p>';
            }
        });
    }

    // Função global para exibir postagem completa (exemplo simples com alert)
    window.showFullPost = async (postId) => {
        // Usa currentPosts que já foi carregado ou carrega se necessário
        if (currentPosts.length === 0) await initializeData();

        const post = currentPosts.find(p => p.id === postId);
        if (post) {
            alert(`Conteúdo da Postagem: \n\n${post.title}\n\n${post.content}`);
            // Em uma aplicação real, você exibiria isso em um modal, nova página, etc.
        } else {
            alert('Postagem não encontrada.');
        }
    };


    // --- Lógica para o Painel Administrativo (admin.html) ---
    const postForm = document.getElementById('post-form');
    const postAdminList = document.getElementById('post-admin-list');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');

    // Redireciona se não estiver logado ao tentar acessar admin.html
    if (window.location.pathname.endsWith('admin.html')) {
        if (!isLoggedIn()) {
            window.location.href = 'login.html';
        } else {
            // Se estiver logado, inicializa e renderiza o painel
            initializeData().then(() => {
                renderAdminPosts();
            });
        }
    }

    // Renderizar Postagens no Admin
    function renderAdminPosts() {
        if (!postAdminList) return; // Garante que o elemento existe
        if (currentPosts.length === 0) {
            postAdminList.innerHTML = '<p>Nenhuma postagem cadastrada.</p>';
            return;
        }
        postAdminList.innerHTML = currentPosts.map(post => `
            <div class="item-admin-card" data-id="${post.id}">
                <h4>${post.title}</h4>
                <div class="admin-actions">
                    <button class="btn btn-edit" onclick="editPost('${post.id}')">Editar</button>
                    <button class="btn btn-delete" onclick="deletePost('${post.id}')">Excluir</button>
                </div>
            </div>
        `).join('');
    }

    // Adicionar/Atualizar Postagem
    if (postForm) {
        postForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const postId = document.getElementById('post-id').value;
            const title = document.getElementById('post-title').value;
            const thumbnail = document.getElementById('post-thumbnail').value;
            const content = document.getElementById('post-content').value;
            const downloadLink = document.getElementById('post-download-link').value;

            if (postId) {
                // Atualizar postagem existente
                const index = currentPosts.findIndex(p => p.id === postId);
                if (index !== -1) {
                    currentPosts[index] = { id: postId, title, thumbnail, content, downloadLink };
                }
                alert('Postagem atualizada (apenas visualmente)!');
            } else {
                // Adicionar nova postagem
                const newId = String(currentPosts.length ? Math.max(...currentPosts.map(p => parseInt(p.id))) + 1 : 1);
                currentPosts.push({ id: newId, title, thumbnail, content, downloadLink });
                alert('Postagem adicionada (apenas visualmente)!');
            }

            renderAdminPosts();
            postForm.reset();
            document.getElementById('post-id').value = ''; // Limpa o ID de edição
            cancelEditBtn.style.display = 'none'; // Esconde o botão cancelar
        });
    }

    // Editar Postagem (apenas preenche o formulário)
    window.editPost = (id) => {
        const post = currentPosts.find(p => p.id === id);
        if (post) {
            document.getElementById('post-id').value = post.id;
            document.getElementById('post-title').value = post.title;
            document.getElementById('post-thumbnail').value = post.thumbnail;
            document.getElementById('post-content').value = post.content;
            document.getElementById('post-download-link').value = post.downloadLink || ''; // Garante que não seja 'undefined'
            cancelEditBtn.style.display = 'inline-block'; // Mostra o botão cancelar
            alert('Formulário preenchido para edição. Salve para aplicar (apenas visualmente)!');
        }
    };

    // Cancelar Edição
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', () => {
            postForm.reset();
            document.getElementById('post-id').value = '';
            cancelEditBtn.style.display = 'none';
            alert('Edição cancelada.');
        });
    }

    // Excluir Postagem (apenas visualmente)
    window.deletePost = (id) => {
        if (confirm('Tem certeza que deseja excluir esta postagem (apenas visualmente)?')) {
            currentPosts = currentPosts.filter(p => p.id !== id);
            renderAdminPosts();
            alert('Postagem excluída (apenas visualmente)!');
        }
    };

    // (Removida a lógica de downloads do admin.html, pois o pedido era editar postagens)
    // Se você precisar editar os "Downloads" de forma separada no admin,
    // precisaremos adicionar os campos e a lógica de volta para eles.
});