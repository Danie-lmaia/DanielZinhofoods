// ================= VARIÁVEIS GLOBAIS =================
let descontoAtivo = 0;

// ================= UTILITÁRIOS / SEGURANÇA =================

function verificarLogin() {
    if (!localStorage.getItem("usuarioLogado")) {
        window.location.href = "index.html";
    }
}

function getChavePedidos() {
    const email = localStorage.getItem("usuarioLogado");
    return `pedidos_${email}`;
}

function getChaveCarrinho() {
    const email = localStorage.getItem("usuarioLogado");
    return `carrinho_${email}`;
}

// MELHORIA 3: chave e funções para persistir o cupom
function getChaveDesconto() {
    const email = localStorage.getItem("usuarioLogado");
    return `desconto_${email}`;
}

function salvarDesconto(valor) {
    descontoAtivo = valor;
    localStorage.setItem(getChaveDesconto(), valor);
}

function carregarDesconto() {
    const salvo = localStorage.getItem(getChaveDesconto());
    descontoAtivo = salvo ? parseFloat(salvo) : 0;
}

// ================= LOGIN =================

async function login() {
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    if (!email || !senha) return alert("Preencha todos os campos!");

    // 1. Tenta login como Administrador via Servidor Python
    if (email === "admin") {
        try {
            const resposta = await fetch("http://127.0.0.1:5001/api/admin/login", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario: email, senha: senha })
            });

            if (resposta.ok) {
                const resultado = await resposta.json();
                if (resultado.success) {
                    localStorage.setItem("usuarioLogado", "admin");
                    window.location.href = "admin.html";
                    return;
                }
            }
        } catch (erro) {
            console.error("Erro ao conectar com servidor admin:", erro);
        }
    }

    // 2. Se não for admin ou o servidor falhar, tenta usuários comuns no LocalStorage
    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    const user = usuarios.find(u => u.email === email && u.senha === senha);

    if (user) {
        localStorage.setItem("usuarioLogado", email);
        window.location.href = "home.html";
    } else {
        alert("Login ou senha inválidos!");
    }
}

function cadastrar() {
    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    const email = document.getElementById("novoEmail").value;
    const senha = document.getElementById("novaSenha").value;

    if (!email || !senha) return alert("Preencha tudo!");

    usuarios.push({ email, senha });
    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    alert("Cadastro realizado!");
    voltarLogin();
}

function mostrarCadastro() {
    document.querySelectorAll(".box")[0].classList.add("hidden");
    document.getElementById("cadastroBox").classList.remove("hidden");
}

function voltarLogin() {
    document.querySelectorAll(".box")[0].classList.remove("hidden");
    document.getElementById("cadastroBox").classList.add("hidden");
}

function logout() {
    localStorage.removeItem("usuarioLogado");
    window.location.href = "index.html";
}

// ================= HOME (CONECTADO AO PYTHON) =================

async function carregarRestaurantes() {
    const lista = document.getElementById("lista");
    if (!lista) return;

    // MELHORIA 1: spinner de loading
    lista.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <p>Carregando restaurantes...</p>
        </div>`;

    try {
        const resposta = await fetch("http://127.0.0.1:5001/api/restaurantes");
        const restaurantes = await resposta.json();

        lista.innerHTML = "";
        restaurantes.forEach(r => {
            const taxa = r.taxa ? r.taxa.toFixed(2) : "0.00";

            const div = document.createElement("div");
            div.classList.add("card");
            div.innerHTML = `
                <span>${r.nome} <br> <small>Entrega: R$ ${taxa}</small></span>
                <button onclick="abrirRestaurante('${r.nome}')">Ver menu</button>
            `;
            lista.appendChild(div);
        });
    } catch (erro) {
        console.error("Erro no fetch:", erro);
        lista.innerHTML = "❌ Erro ao conectar ao servidor Python.";
    }
}

function abrirRestaurante(nome) {
    localStorage.setItem("restauranteAtual", nome);
    window.location.href = "restaurant.html";
}

// ================= MENU E CARRINHO =================

async function carregarMenu() {
    const nome = localStorage.getItem("restauranteAtual");
    const tituloMenu = document.getElementById("nomeRestaurante");
    if (tituloMenu) tituloMenu.innerText = "🍽 " + (nome || "Restaurante");

    const div = document.getElementById("menu");
    if (!div) return;

    // MELHORIA 1: spinner de loading
    div.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <p>Buscando cardápio...</p>
        </div>`;

    try {
        const resposta = await fetch(`http://127.0.0.1:5001/api/menu/${nome}`);
        const menu = await resposta.json();

        div.innerHTML = "";
        menu.forEach(item => {
            const card = document.createElement("div");
            card.classList.add("card");
            card.innerHTML = `
                <div><strong>${item.nome}</strong><br>R$ ${item.preco.toFixed(2)}</div>
                <button onclick="adicionarCarrinho('${item.nome}', ${item.preco}, '${nome}')">Adicionar</button>
            `;
            div.appendChild(card);
        });
    } catch (erro) {
        console.error("Erro no fetch do menu:", erro);
        div.innerHTML = "❌ Erro ao carregar menu.";
    }

    // MELHORIA 3: carrega o desconto salvo ao abrir a página
    carregarDesconto();
    atualizarCarrinho();
}

function adicionarCarrinho(nomeItem, precoItem, nomeRestaurante) {
    const chave = getChaveCarrinho();
    const carrinho = JSON.parse(localStorage.getItem(chave)) || [];

    carrinho.push({ nome: nomeItem, preco: precoItem, restaurante: nomeRestaurante });
    localStorage.setItem(chave, JSON.stringify(carrinho));

    atualizarCarrinho();
}

function removerItem(index) {
    const chave = getChaveCarrinho();
    const carrinho = JSON.parse(localStorage.getItem(chave)) || [];

    carrinho.splice(index, 1);
    localStorage.setItem(chave, JSON.stringify(carrinho));

    atualizarCarrinho();
}

function atualizarCarrinho() {
    const ul = document.getElementById("listaCarrinho");
    if (!ul) return;

    ul.innerHTML = "";
    let subtotal = 0;

    const chave = getChaveCarrinho();
    const carrinho = JSON.parse(localStorage.getItem(chave)) || [];

    carrinho.forEach((item, index) => {
        subtotal += item.preco;
        const li = document.createElement("li");
        li.innerHTML = `
            <small style="color: #666; font-size: 11px;">(${item.restaurante})</small><br>
            ${item.nome} - R$ ${item.preco.toFixed(2)}
            <button onclick="removerItem(${index})" class="btn-remover">Remover</button>
            <hr style="border: 0.5px solid #eee; margin: 5px 0;">
        `;
        ul.appendChild(li);
    });

    let totalFinal = subtotal - descontoAtivo;
    if (totalFinal < 0) totalFinal = 0;

    const totalEl = document.getElementById("total");
    if (totalEl) {
        if (descontoAtivo > 0) {
            totalEl.innerHTML = `
                <small style="text-decoration: line-through; color: gray;">Subtotal: R$ ${subtotal.toFixed(2)}</small><br>
                <strong>Total: R$ ${totalFinal.toFixed(2)}</strong> <br>
                <small style="color: green;">Desconto: -R$ ${descontoAtivo.toFixed(2)}</small>
            `;
        } else {
            totalEl.innerText = "Total: R$ " + totalFinal.toFixed(2);
        }
    }
}

async function aplicarCupom() {
    const campo = document.getElementById("inputCupom");
    if (!campo) return;

    const codigo = campo.value.trim();
    if (!codigo) return alert("Digite um cupom!");

    try {
        const resposta = await fetch(`http://127.0.0.1:5001/api/cupom/${codigo}`);
        const data = await resposta.json();

        if (data.desconto > 0) {
            // MELHORIA 3: salva o desconto no localStorage
            salvarDesconto(data.desconto);
            alert("Cupom aplicado com sucesso!");
            atualizarCarrinho();
        } else {
            salvarDesconto(0);
            alert("Cupom inválido!");
            atualizarCarrinho();
        }
    } catch (erro) {
        alert("Erro ao validar cupom no servidor.");
    }
}

function finalizarPedido() {
    const chaveCarrinho = getChaveCarrinho();
    const carrinho = JSON.parse(localStorage.getItem(chaveCarrinho)) || [];

    if (carrinho.length === 0) return alert("Carrinho vazio!");

    const subtotal = carrinho.reduce((acc, i) => acc + i.preco, 0);
    let totalFinal = subtotal - descontoAtivo;
    if (totalFinal < 0) totalFinal = 0;

    // MELHORIA 2: confirmação antes de finalizar com resumo do pedido
    const itensTexto = carrinho.map(i => `• ${i.nome} — R$ ${i.preco.toFixed(2)}`).join("\n");
    const descontoTexto = descontoAtivo > 0 ? `\nDesconto: -R$ ${descontoAtivo.toFixed(2)}` : "";
    const confirmado = confirm(
        `📋 Confirmar pedido?\n\n${itensTexto}${descontoTexto}\n\n💰 Total: R$ ${totalFinal.toFixed(2)}\n\nDeseja finalizar?`
    );
    if (!confirmado) return;

    const chavePedidos = getChavePedidos();
    const pedidos = JSON.parse(localStorage.getItem(chavePedidos)) || [];

    const novoPedido = {
        id: Math.floor(Math.random() * 10000),
        data: new Date().toLocaleString(),
        itens: [...carrinho],
        total: totalFinal,
        descontoAplicado: descontoAtivo
    };

    pedidos.push(novoPedido);
    localStorage.setItem(chavePedidos, JSON.stringify(pedidos));

    alert("✅ Pedido confirmado! DanielzinhoFoods já está a preparar.");

    // MELHORIA 3: limpa o desconto salvo junto com o carrinho
    localStorage.removeItem(chaveCarrinho);
    localStorage.removeItem(getChaveDesconto());
    descontoAtivo = 0;
    atualizarCarrinho();
}

// ================= HISTÓRICO =================

function carregarHistorico() {
    const chave = getChavePedidos();
    const pedidos = JSON.parse(localStorage.getItem(chave)) || [];
    const div = document.getElementById("historico");
    if (!div) return;

    if (pedidos.length === 0) {
        div.innerHTML = "<p style='text-align:center; color:white;'>Nenhum pedido encontrado.</p>";
        return;
    }

    div.innerHTML = "";
    pedidos.reverse().forEach(p => {
        const card = document.createElement("div");
        card.classList.add("card");

        let itensTexto = p.itens.map(i => `${i.nome} <span style="font-size:10px; color:gray">(${i.restaurante})</span>`).join("<br>");

        card.innerHTML = `
            <div style="width: 100%;">
                <strong>Pedido #${p.id}</strong> <small style="float:right; color:#666;">${p.data}</small><br><br>
                <div style="font-size: 13px; margin-bottom: 10px;">${itensTexto}</div>
                <hr style="border: 0.5px solid #eee;">
                <strong>Total Final: R$ ${p.total.toFixed(2)}</strong>
                ${p.descontoAplicado > 0 ? `<br><small style="color: green;">Desconto aplicado: R$ ${p.descontoAplicado.toFixed(2)}</small>` : ''}
            </div>
        `;
        div.appendChild(card);
    });
}

function voltarHome() { window.location.href = "home.html"; }
function voltar() { window.location.href = "home.html"; }
