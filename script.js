document.addEventListener('DOMContentLoaded', () => {
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

    // --- Lógica para a Página Inicial (index.html) ---
    const postList = document.getElementById('post-list');
    const downloadList = document.getElementById('download-list');

    if (postList && downloadList) { // Verifica se estamos na página inicial
        loadData().then(data => {
            // Renderizar Postagens
            if (data.posts && data.posts.length > 0) {
                postList.innerHTML = data.posts.map(post => `
                    <div class="post-card">
                        <img src="${post.thumbnail}" alt="${post.title}">
                        <div class="post-content">
                            <h3>${post.title}</h3>
                            <p>${post.content.substring(0, 100)}...</p>
                            <a href="#" class="btn" onclick="showFullPost('${post.id}')">Ver Postagem Completa</a>
                        </div>
                    </div>
                `).join('');
            } else {
                postList.innerHTML = '<p>Nenhuma postagem disponível ainda.</p>';
            }

            // Renderizar Downloads
            if (data.downloads && data.downloads.length > 0) {
                downloadList.innerHTML = data.downloads.map(download => `
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
        const data = await loadData();
        const post = data.posts.find(p => p.id === postId);
        if (post) {
            alert(`Conteúdo da Postagem: \n\n${post.title}\n\n${post.content}`);
            // Em uma aplicação real, você exibiria isso em um modal, nova página, etc.
        } else {
            alert('Postagem não encontrada.');
        }
    };


    // --- Lógica para o Painel Administrativo (admin.html) ---
    const addPostForm = document.getElementById('add-post-form');
    const postAdminList = document.getElementById('post-admin-list');
    const addDownloadForm = document.getElementById('add-download-form');
    const downloadAdminList = document.getElementById('download-admin-list');

    // Funções auxiliares para simular o armazenamento (apenas em memória, não persistente)
    let currentPosts = [];
    let currentDownloads = [];

    // Carregar dados iniciais para o admin
    if (addPostForm || addDownloadForm) { // Verifica se estamos no painel admin
        loadData().then(data => {
            currentPosts = data.posts;
            currentDownloads = data.downloads;
            renderAdminPosts();
            renderAdminDownloads();
        });
    }

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

    function renderAdminDownloads() {
        if (!downloadAdminList) return; // Garante que o elemento existe
        if (currentDownloads.length === 0) {
            downloadAdminList.innerHTML = '<p>Nenhum download cadastrado.</p>';
            return;
        }
        downloadAdminList.innerHTML = currentDownloads.map(download => `
            <div class="item-admin-card" data-id="${download.id}">
                <h4>${download.title}</h4>
                <div class="admin-actions">
                    <button class="btn btn-edit" onclick="editDownload('${download.id}')">Editar</button>
                    <button class="btn btn-delete" onclick="deleteDownload('${download.id}')">Excluir</button>
                </div>
            </div>
        `).join('');
    }

    // Adicionar/Atualizar Postagem
    if (addPostForm) {
        addPostForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const postId = document.getElementById('edit-post-id').value;
            const title = document.getElementById('post-title').value;
            const thumbnail = document.getElementById('post-thumbnail').value;
            const content = document.getElementById('post-content').value;

            if (postId) {
                // Atualizar postagem existente
                const index = currentPosts.findIndex(p => p.id === postId);
                if (index !== -1) {
                    currentPosts[index] = { id: postId, title, thumbnail, content };
                }
                alert('Postagem atualizada (apenas visualmente)!');
            } else {
                // Adicionar nova postagem
                const newId = String(currentPosts.length ? Math.max(...currentPosts.map(p => parseInt(p.id))) + 1 : 1);
                currentPosts.push({ id: newId, title, thumbnail, content });
                alert('Postagem adicionada (apenas visualmente)!');
            }

            renderAdminPosts();
            addPostForm.reset();
            document.getElementById('edit-post-id').value = ''; // Limpa o ID de edição
        });
    }

    // Editar Postagem (apenas preenche o formulário)
    window.editPost = (id) => {
        const post = currentPosts.find(p => p.id === id);
        if (post) {
            document.getElementById('edit-post-id').value = post.id;
            document.getElementById('post-title').value = post.title;
            document.getElementById('post-thumbnail').value = post.thumbnail;
            document.getElementById('post-content').value = post.content;
            alert('Formulário preenchido para edição. Salve para aplicar (apenas visualmente)!');
        }
    };

    // Excluir Postagem (apenas visualmente)
    window.deletePost = (id) => {
        if (confirm('Tem certeza que deseja excluir esta postagem (apenas visualmente)?')) {
            currentPosts = currentPosts.filter(p => p.id !== id);
            renderAdminPosts();
            alert('Postagem excluída (apenas visualmente)!');
        }
    };

    // Adicionar/Atualizar Download
    if (addDownloadForm) {
        addDownloadForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const downloadId = document.getElementById('edit-download-id').value;
            const title = document.getElementById('download-title').value;
            const link = document.getElementById('download-link').value;
            const description = document.getElementById('download-description').value;

            if (downloadId) {
                // Atualizar download existente
                const index = currentDownloads.findIndex(d => d.id === downloadId);
                if (index !== -1) {
                    currentDownloads[index] = { id: downloadId, title, link, description };
                }
                alert('Download atualizado (apenas visualmente)!');
            } else {
                // Adicionar novo download
                const newId = String(currentDownloads.length ? Math.max(...currentDownloads.map(d => parseInt(d.id))) + 1 : 1);
                currentDownloads.push({ id: newId, title, link, description });
                alert('Download adicionado (apenas visualmente)!');
            }

            renderAdminDownloads();
            addDownloadForm.reset();
            document.getElementById('edit-download-id').value = ''; // Limpa o ID de edição
        });
    }

    // Editar Download (apenas preenche o formulário)
    window.editDownload = (id) => {
        const download = currentDownloads.find(d => d.id === id);
        if (download) {
            document.getElementById('edit-download-id').value = download.id;
            document.getElementById('download-title').value = download.title;
            document.getElementById('download-link').value = download.link;
            document.getElementById('download-description').value = download.description;
            alert('Formulário preenchido para edição. Salve para aplicar (apenas visualmente)!');
        }
    };

    // Excluir Download (apenas visualmente)
    window.deleteDownload = (id) => {
        if (confirm('Tem certeza que deseja excluir este download (apenas visualmente)?')) {
            currentDownloads = currentDownloads.filter(d => d.id !== id);
            renderAdminDownloads();
            alert('Download excluído (apenas visualmente)!');
        }
    };
});