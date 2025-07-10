document.addEventListener('DOMContentLoaded', () => {
    // --- Variáveis Globais para Dados em Memória (Local Storage) ---
    // Chave para armazenar os posts no localStorage
    const POSTS_STORAGE_KEY = 'site_posts_v2'; // Alterada a chave para evitar conflitos
    // Chave para armazenar os downloads no localStorage
    const DOWNLOADS_STORAGE_KEY = 'site_downloads_v2'; // Alterada a chave

    // Variáveis que conterão os dados atuais (em memória/localStorage)
    let currentPosts = [];
    let currentDownloads = [];

    // --- Funções Auxiliares Comuns ---

    // Carrega dados, preferindo localStorage, senão do data.json
    async function initializeData() {
        // Tenta carregar os posts do localStorage
        const storedPosts = localStorage.getItem(POSTS_STORAGE_KEY);
        if (storedPosts) {
            currentPosts = JSON.parse(storedPosts);
        } else {
            // Se não houver no localStorage, carrega do data.json
            const data = await loadDataFromJson();
            currentPosts = data.posts;
            // Salva no localStorage para futuras navegações
            saveDataToLocalStorage();
        }

        // Tenta carregar os downloads do localStorage (ainda que não editáveis no admin)
        const storedDownloads = localStorage.getItem(DOWNLOADS_STORAGE_KEY);
        if (storedDownloads) {
            currentDownloads = JSON.parse(storedDownloads);
        } else {
            const data = await loadDataFromJson(); // Já carregado, mas para consistência
            currentDownloads = data.downloads;
            saveDataToLocalStorage();
        }
    }

    // Carrega dados diretamente do arquivo data.json
    async function loadDataFromJson() {
        try {
            const response = await fetch('data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Erro ao carregar os dados do data.json:', error);
            return { posts: [], downloads: [] };
        }
    }

    // Salva os dados atuais (currentPosts e currentDownloads) no localStorage
    function saveDataToLocalStorage() {
        localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(currentPosts));
        localStorage.setItem(DOWNLOADS_STORAGE_KEY, JSON.stringify(currentDownloads));
        console.log("Dados salvos no localStorage!"); // Para depuração
    }

    // --- Lógica de Autenticação (Simulada - persistente via localStorage) ---
    const LOGIN_STATUS_KEY = 'isLoggedIn';

    function setLoggedIn(isLoggedIn) {
        localStorage.setItem(LOGIN_STATUS_KEY, isLoggedIn ? 'true' : 'false');
    }

    function isLoggedIn() {
        return localStorage.getItem(LOGIN_STATUS_KEY) === 'true';
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
            // Ao fazer logout, opcionalmente, você pode limpar os dados do localStorage
            // para que na próxima vez que alguém acesse, veja os dados originais do JSON.
            // Para persistência real, isso não seria feito aqui.
            // localStorage.removeItem(POSTS_STORAGE_KEY);
            // localStorage.removeItem(DOWNLOADS_STORAGE_KEY);
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
                            <div class="post-description">${post.content}</div> 
                            <a href="#" class="btn" onclick="showFullPost('${post.id}', event)">Ver Postagem Completa</a>
                            ${post.downloadLink ? `<a href="${post.downloadLink}" class="btn" download="${post.title.replace(/\s/g, '-')}-download" target="_blank">Download</a>` : ''}
                        </div>
                    </div>
                `).join('');
            } else {
                postList.innerHTML = '<p>Nenhuma postagem disponível ainda.</p>';
            }

            // Renderizar Downloads (usando currentDownloads)
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

    // Função global para exibir postagem completa (com modal simulado)
    window.showFullPost = (postId, event) => {
        event.preventDefault(); // Previne o comportamento padrão do link
        const post = currentPosts.find(p => p.id === postId);
        if (post) {
            // Em vez de alert, criar um modal simples
            const modal = document.createElement('div');
            modal.classList.add('post-modal');
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close-button" onclick="this.parentElement.parentElement.remove()">X</span>
                    <h3>${post.title}</h3>
                    <img src="${post.thumbnail}" alt="${post.title}" style="max-width:100%; height:auto; margin-bottom:15px; border-radius:5px;">
                    <div class="modal-body">${post.content}</div>
                    ${post.downloadLink ? `<a href="${post.downloadLink}" class="btn" download="${post.title.replace(/\s/g, '-')}-download" target="_blank" style="margin-top:20px;">Download</a>` : ''}
                </div>
            `;
            document.body.appendChild(modal);

            // Estilos básicos para o modal (adicionar em style.css se quiser persistente)
            modal.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background-color: rgba(0,0,0,0.7); display: flex;
                justify-content: center; align-items: center; z-index: 1000;
            `;
            modal.querySelector('.modal-content').style.cssText = `
                background-color: var(--card-bg); padding: 30px; border-radius: 10px;
                max-width: 800px; width: 90%; max-height: 90vh; overflow-y: auto;
                position: relative; box-shadow: 0 5px 15px rgba(0,0,0,0.5);
            `;
            modal.querySelector('.close-button').style.cssText = `
                position: absolute; top: 10px; right: 20px; font-size: 24px;
                cursor: pointer; color: var(--light-blue); font-weight: bold;
            `;
            modal.querySelector('.modal-body').style.cssText = `
                color: var(--white);
            `;
             // Ajuste o estilo do conteúdo HTML do Quill para o modal
            const quillContent = modal.querySelector('.modal-body');
            if (quillContent) {
                // Remove estilos padrões de margem/padding que o Quill pode adicionar
                quillContent.querySelectorAll('p, ul, ol, h1, h2, h3, h4, h5, h6').forEach(el => {
                    el.style.margin = '0 0 10px 0';
                    el.style.padding = '0';
                });
                quillContent.querySelectorAll('img').forEach(img => {
                    img.style.maxWidth = '100%';
                    img.style.height = 'auto';
                    img.style.display = 'block';
                    img.style.margin = '10px auto';
                });
            }


        } else {
            alert('Postagem não encontrada.');
        }
    };


    // --- Lógica para o Painel Administrativo (admin.html) ---
    const postForm = document.getElementById('post-form');
    const postAdminList = document.getElementById('post-admin-list');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const postContentHtmlInput = document.getElementById('post-content-html'); // Input oculto

    let quillEditor; // Variável para a instância do editor Quill

    // Redireciona se não estiver logado ao tentar acessar admin.html
    if (window.location.pathname.endsWith('admin.html')) {
        if (!isLoggedIn()) {
            window.location.href = 'login.html';
        } else {
            // Inicializa o Quill editor apenas se estiver na página admin e logado
            if (document.getElementById('editor')) {
                quillEditor = new Quill('#editor', {
                    theme: 'snow', // Tema 'snow' para uma barra de ferramentas bonita
                    modules: {
                        toolbar: [
                            ['bold', 'italic', 'underline', 'strike'],        // negrito, itálico, sublinhado, tachado
                            ['blockquote', 'code-block'],                     // bloco de citação, bloco de código

                            [{ 'header': 1 }, { 'header': 2 }],               // títulos
                            [{ 'list': 'ordered'}, { 'list': 'bullet' }],    // listas ordenadas/desordenadas
                            [{ 'script': 'sub'}, { 'script': 'super' }],      // subscrito, sobrescrito
                            [{ 'indent': '-1'}, { 'indent': '+1' }],          // recuo/indentação
                            [{ 'direction': 'rtl' }],                         // direção do texto

                            [{ 'size': ['small', false, 'large', 'huge'] }],  // tamanhos de fonte
                            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],        // cabeçalhos

                            [{ 'color': [] }, { 'background': [] }],          // cores do texto, fundo
                            [{ 'font': [] }],                                 // fonte
                            [{ 'align': [] }],                                // alinhamento

                            ['link', 'image'],                                // links, imagens

                            ['clean']                                         // remover formatação
                        ]
                    }
                });

                // Quando o conteúdo do Quill muda, atualiza o input oculto
                quillEditor.on('text-change', () => {
                    postContentHtmlInput.value = quillEditor.root.innerHTML;
                });
            }

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
            // Pegar o conteúdo HTML do Quill editor
            const content = quillEditor.root.innerHTML;
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

            saveDataToLocalStorage(); // Salva as alterações no localStorage
            renderAdminPosts();
            postForm.reset();
            quillEditor.setContents([]); // Limpa o editor Quill
            document.getElementById('post-id').value = ''; // Limpa o ID de edição
            cancelEditBtn.style.display = 'none'; // Esconde o botão cancelar
        });
    }

    // Editar Postagem (preenche o formulário e o Quill editor)
    window.editPost = (id) => {
        const post = currentPosts.find(p => p.id === id);
        if (post) {
            document.getElementById('post-id').value = post.id;
            document.getElementById('post-title').value = post.title;
            document.getElementById('post-thumbnail').value = post.thumbnail;
            
            // Define o conteúdo HTML no editor Quill
            quillEditor.root.innerHTML = post.content;

            document.getElementById('post-download-link').value = post.downloadLink || ''; // Garante que não seja 'undefined'
            cancelEditBtn.style.display = 'inline-block'; // Mostra o botão cancelar
            alert('Formulário preenchido para edição. Salve para aplicar (permanecerá até o localStorage ser limpo)!');
        }
    };

    // Cancelar Edição
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', () => {
            postForm.reset();
            quillEditor.setContents([]); // Limpa o editor Quill
            document.getElementById('post-id').value = '';
            cancelEditBtn.style.display = 'none';
            alert('Edição cancelada.');
        });
    }

    // Excluir Postagem (salva no localStorage)
    window.deletePost = (id) => {
        if (confirm('Tem certeza que deseja excluir esta postagem (permanecerá até o localStorage ser limpo)?')) {
            currentPosts = currentPosts.filter(p => p.id !== id);
            saveDataToLocalStorage(); // Salva as alterações no localStorage
            renderAdminPosts();
            alert('Postagem excluída (permanecerá até o localStorage ser limpo)!');
        }
    };
});