
// Simulação de Banco de Dados JSON no LocalStorage
let posts = JSON.parse(localStorage.getItem('download_posts')) || [];

// Função para criptografia SHA-256 (Hash da senha 123456)
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const ADMIN_HASH = "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92"; // Hash de '123456'

// Renderizar posts na Home
function renderPosts() {
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = posts.map(post => `
        <div class="post-box">
            <img src="${post.thumb}" alt="${post.name}">
            <div class="post-info">
                <h3>${post.name}</h3>
                <p>Postado por: <b>${post.author}</b></p>
                <p>Data: ${post.date}</p>
                <a href="${post.url}" class="btn-download" target="_blank">Detalhes & Download</a>
            </div>
        </div>
    `).join('');
}

// Logica do Admin
async function checkLogin() {
    const pass = document.getElementById('adminPass').value;
    const hash = await sha256(pass);
    
    if(hash === ADMIN_HASH) {
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        renderAdminList();
    } else {
        alert("Senha Incorreta!");
    }
}

// Salvar novo Post
document.getElementById('uploadForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const newPost = {
        id: Date.now(),
        name: document.getElementById('fileName').value,
        thumb: document.getElementById('fileThumb').value,
        url: document.getElementById('fileUrl').value,
        author: document.getElementById('uploaderName').value,
        date: new Date().toLocaleDateString('pt-BR')
    };
    
    posts.push(newPost);
    localStorage.setItem('download_posts', JSON.stringify(posts));
    renderPosts();
    renderAdminList();
    e.target.reset();
});

function deletePost(id) {
    posts = posts.filter(p => p.id !== id);
    localStorage.setItem('download_posts', JSON.stringify(posts));
    renderPosts();
    renderAdminList();
}

function renderAdminList() {
    const list = document.getElementById('editList');
    list.innerHTML = posts.map(post => `
        <div style="display:flex; justify-content:space-between; margin: 10px 0; background:#0f172a; padding:5px;">
            <span>${post.name}</span>
            <button onclick="deletePost(${post.id})" style="background:red; color:white; border:none; cursor:pointer;">Excluir</button>
        </div>
    `).join('');
}

// Abrir/Fechar Modal
const modal = document.getElementById("adminModal");
document.getElementById("btnOpenAdmin").onclick = () => modal.style.display = "block";
document.getElementsByClassName("close")[0].onclick = () => modal.style.display = "none";

// Inicialização
renderPosts();
