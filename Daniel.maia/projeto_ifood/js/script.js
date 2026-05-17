// ==========================================================================
// 1. VARIÁVEIS GLOBAIS E BACKUP
// ==========================================================================
let descontoAtivo = 0;
let listaRestaurantesOriginal = [];

// ==========================================================================
// 2. FUNÇÕES DE UTILITÁRIOS, SEGURANÇA E CHAVES LOCALSTORAGE
// ==========================================================================

function verificarLogin() {
    const email = localStorage.getItem("usuarioLogado");
    if (!email) {
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
    if (salvo) {
        descontoAtivo = parseFloat(salvo);
    } else {
        descontoAtivo = 0;
    }
}

function atualizarContadorNavbar(quantidade) {
    const badge = document.getElementById("badgeCarrinho");
    if (badge) {
        badge.innerText = quantidade;
    }
}

function verificarEExibirBotaoAdmin() {
    const emailLogado = localStorage.getItem("usuarioLogado");
    const navLinks = document.querySelector(".nav-links");
    
    if (emailLogado === "admin" && navLinks && !document.getElementById("btnVoltarAdminNav")) {
        const li = document.createElement("li");
        li.id = "btnVoltarAdminNav";
        li.innerHTML = `<a onclick="window.location.href='admin.html'" style="color: #2980b9; font-weight: bold; cursor: pointer;">⚙️ Painel Admin</a>`;
        
        // Insere o botão do admin antes do botão de Sair
        navLinks.insertBefore(li, navLinks.lastElementChild);
    }
}

// ==========================================================================
// 3. SISTEMA DE TOAST NOTIFICATIONS (AVISOS FLUTUANTES)
// ==========================================================================

function mostrarToast(mensagem) {
    const toast = document.createElement("div");
    toast.classList.add("toast-notificacao");
    
    toast.innerHTML = `
        <span>${mensagem}</span>
        <button class="btn-fechar-toast" onclick="this.parentElement.remove()">×</button>
    `;
    
    document.body.appendChild(toast);
    
    // Animação para sumir depois de 3 segundos
    setTimeout(() => {
        if (toast.parentNode) {
            toast.classList.add("sumir-toast");
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }
    }, 3000);
}

// ==========================================================================
// 4. AUTENTICAÇÃO: LOGIN E CADASTRO VIA BACKEND PYTHON
// ==========================================================================

async function login() {
    const emailInput = document.getElementById("email");
    const senhaInput = document.getElementById("senha");

    const email = emailInput.value.trim();
    const senha = senhaInput.value;

    if (!email || !senha) {
        alert("Por favor, preencha todos os campos!");
        return;
    }

    // Acesso Mestre do Administrador
    if (email === "admin" && senha === "1234") {
        localStorage.setItem("usuarioLogado", "admin");
        window.location.href = "admin.html";
        return;
    }

    try {
        const resposta = await fetch("http://127.0.0.1:5001/api/usuario/login", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, senha: senha })
        });

        const dados = await resposta.json();

        if (resposta.ok && dados.success) {
            localStorage.setItem("usuarioLogado", email);
            window.location.href = "home.html";
        } else {
            alert("❌ Erro de Acesso: " + (dados.message || "E-mail ou senha incorretos."));
        }
    } catch (erro) {
        console.error("Erro na requisição de login:", erro);
        alert("Erro ao conectar com o servidor Python.");
    }
}

async function cadastrar() {
    const nomeInput = document.getElementById("novoNome");
    const emailInput = document.getElementById("novoEmail");
    const senhaInput = document.getElementById("novaSenha");

    const nome = nomeInput.value.trim();
    const email = emailInput.value.trim();
    const senha = senhaInput.value;

    if (!nome || !email || !senha) {
        alert("Por favor, preencha todos os campos do cadastro!");
        return;
    }

    try {
        const resposta = await fetch("http://127.0.0.1:5001/api/usuario/cadastrar", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome: nome, email: email, senha: senha })
        });

        const dados = await resposta.json();

        if (resposta.ok && dados.success) {
            alert("✨ Cadastro gravado com sucesso! Redirecionando para a tela de login...");
            
            // Limpa os campos após o sucesso
            nomeInput.value = "";
            emailInput.value = "";
            senhaInput.value = "";
            
            voltarLogin();
        } else {
            alert("❌ Erro no Cadastro: " + dados.message);
        }
    } catch (erro) {
        console.error("Erro na requisição de cadastro:", erro);
        alert("Erro ao conectar com o servidor Python.");
    }
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

// ==========================================================================
// 5. VITRINE DE LOJAS (PÁGINA HOME) E FILTRO EM TEMPO REAL
// ==========================================================================

async function carregarRestaurantes() {
    const lista = document.getElementById("lista");
    if (!lista) return;

    lista.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <p>Carregando lojas...</p>
        </div>
    `;

    try {
        const resposta = await fetch("http://127.0.0.1:5001/api/restaurantes", { cache: "no-store" });
        listaRestaurantesOriginal = await resposta.json();
        renderizarRestaurantes(listaRestaurantesOriginal);
    } catch (erro) {
        console.error("Erro no fetch de restaurantes:", erro);
        lista.innerHTML = "<p style='text-align:center;'>❌ Erro ao conectar ao servidor Python.</p>";
    }
}

function renderizarRestaurantes(arrayDados) {
    const lista = document.getElementById("lista");
    if (!lista) return;
    
    lista.innerHTML = "";

    if (arrayDados.length === 0) {
        lista.innerHTML = "<p style='text-align:center; color: gray; margin-top: 20px;'>Nenhuma loja ou culinária encontrada.</p>";
        return;
    }

    arrayDados.forEach(r => {
        const taxa = r.taxa ? r.taxa.toFixed(2) : "0.00";
        const div = document.createElement("div");
        div.classList.add("card");
        
        div.innerHTML = `
            <div class="card-info">
                <img src="${r.foto_url}" class="img-loja" alt="${r.nome}">
                <div>
                    <span class="nome-item-card">${r.nome}</span>
                    <small>${r.categoria} • Nota ${r.nota.toFixed(1)} • Entrega R$ ${taxa}</small>
                </div>
            </div>
            <button onclick="abrirRestaurante('${r.nome}')">Ver cardápio</button>
        `;
        
        lista.appendChild(div);
    });
}

function filtrarRestaurantes() {
    const termoBusca = document.getElementById("inputBusca").value.toLowerCase().trim();

    if (!termoBusca) {
        renderizarRestaurantes(listaRestaurantesOriginal);
        return;
    }

    const filtrados = listaRestaurantesOriginal.filter(r => {
        const nomeCorresponde = r.nome.toLowerCase().includes(termoBusca);
        const categoriaCorresponde = r.categoria.toLowerCase().includes(termoBusca);
        return nomeCorresponde || categoriaCorresponde;
    });

    renderizarRestaurantes(filtrados);
}

function abrirRestaurante(nome) {
    localStorage.setItem("restauranteAtual", nome.trim());
    window.location.href = "restaurant.html";
}

// ==========================================================================
// 6. CARDÁPIO INTERNO (PÁGINA RESTAURANT)
// ==========================================================================

async function carregarMenu() {
    const nomeOriginal = localStorage.getItem("restauranteAtual") || "";
    const nome = nomeOriginal.trim();
    
    const tituloMenu = document.getElementById("nomeRestaurante");
    if (tituloMenu) {
        tituloMenu.innerText = nome || "Cardápio";
    }

    const div = document.getElementById("menu");
    if (!div) return;

    div.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <p>Buscando cardápio...</p>
        </div>
    `;

    try {
        const resposta = await fetch(`http://127.0.0.1:5001/api/menu/${nome}`, { cache: "no-store" });
        const menu = await resposta.json();

        div.innerHTML = "";
        
        menu.forEach(item => {
            const card = document.createElement("div");
            card.classList.add("card");
            
            card.innerHTML = `
                <div class="card-info">
                    <img src="${item.foto_url}" class="img-prato" alt="${item.nome}">
                    <div>
                        <span class="nome-item-card">${item.nome}</span>
                        <small>R$ ${item.preco.toFixed(2)}</small>
                    </div>
                </div>
                <button onclick="adicionarCarrinho('${item.nome}', ${item.preco}, '${nome}')">Adicionar</button>
            `;
            
            div.appendChild(card);
        });
    } catch (erro) {
        console.error("Erro ao carregar menu:", erro);
        div.innerHTML = "<p style='text-align:center;'>❌ Erro ao carregar menu.</p>";
    }

    carregarDesconto();
    atualizarCarrinho();
}

// ==========================================================================
// 7. GESTÃO DE COMPRAS LOCAIS (SACOLA E OPERAÇÕES)
// ==========================================================================

function adicionarCarrinho(nomeItem, precoItem, nomeRestaurante) {
    const chave = getChaveCarrinho();
    const carrinho = JSON.parse(localStorage.getItem(chave)) || [];

    carrinho.push({ 
        nome: nomeItem, 
        preco: precoItem, 
        restaurante: nomeRestaurante 
    });
    
    localStorage.setItem(chave, JSON.stringify(carrinho));

    atualizarCarrinho();
    mostrarToast(`"${nomeItem}" foi adicionado à sacola!`);
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
    const chave = getChaveCarrinho();
    const carrinho = JSON.parse(localStorage.getItem(chave)) || [];
    
    atualizarContadorNavbar(carrinho.length);

    if (!ul) return; 
    
    ul.innerHTML = "";
    let subtotal = 0;

    carrinho.forEach((item, index) => {
        subtotal += item.preco;
        
        const li = document.createElement("li");
        li.style.display = "flex";
        li.style.justifyContent = "space-between";
        li.style.alignItems = "center";
        li.style.marginBottom = "8px";
        
        li.innerHTML = `
            <div>
                <span style="font-size:14px; font-weight:500;">${item.nome}</span><br>
                <small style="color:gray; font-size:11px;">${item.restaurante}</small>
            </div>
            <div>
                <span style="font-size:14px; font-weight:600; margin-right:10px;">R$ ${item.preco.toFixed(2)}</span>
                <button onclick="removerItem(${index})" class="btn-remover">Remover</button>
            </div>
        `;
        
        ul.appendChild(li);
    });

    let totalFinal = subtotal - descontoAtivo;
    if (totalFinal < 0) {
        totalFinal = 0;
    }

    const totalEl = document.getElementById("total");
    if (totalEl) {
        if (descontoAtivo > 0) {
            totalEl.innerHTML = `
                <small style="text-decoration: line-through; color: gray;">Subtotal: R$ ${subtotal.toFixed(2)}</small><br>
                <small style="color: #2fbe48; font-weight:600;">Desconto: -R$ ${descontoAtivo.toFixed(2)}</small><br>
                <strong style="font-size:18px; color:black;">Total: R$ ${totalFinal.toFixed(2)}</strong>
            `;
        } else {
            totalEl.innerHTML = `
                <strong style="font-size:18px; color:black;">Total: R$ ${totalFinal.toFixed(2)}</strong>
            `;
        }
    }
}

// ==========================================================================
// 8. CUPONS E FINALIZAÇÃO DE PEDIDOS (COM SALDO DA CONTA)
// ==========================================================================

async function aplicarCupom() {
    const campo = document.getElementById("inputCupom");
    if (!campo) return;

    const codigo = campo.value.trim();
    if (!codigo) {
        alert("Digite um cupom!");
        return;
    }

    try {
        const resposta = await fetch(`http://127.0.0.1:5001/api/cupom/${codigo}`, { cache: "no-store" });
        const data = await resposta.json();

        if (data.desconto > 0) {
            salvarDesconto(data.desconto);
            alert("Cupom aplicado com sucesso!");
            atualizarCarrinho();
        } else {
            salvarDesconto(0);
            alert("Cupom inválido!");
            atualizarCarrinho();
        }
    } catch (erro) {
        console.error("Erro ao validar cupom:", erro);
        alert("Erro ao conectar com o servidor para validar cupom.");
    }
}

async function finalizarPedido() {
    const emailUsuario = localStorage.getItem("usuarioLogado");
    const chave = getChaveCarrinho();
    const carrinho = JSON.parse(localStorage.getItem(chave)) || [];

    if (carrinho.length === 0) {
        alert("Sua sacola está vazia!");
        return;
    }

    let metodoSelecionado = "Pix";
    const radioMetodo = document.querySelector('input[name="metodo"]:checked');
    if (radioMetodo) {
        metodoSelecionado = radioMetodo.value;
    }

    const subtotal = carrinho.reduce((acc, i) => acc + i.preco, 0);
    let totalFinal = subtotal - descontoAtivo;
    if (totalFinal < 0) {
        totalFinal = 0;
    }

    // TRAVA: Verifica o saldo do usuário antes de cobrar
    if (metodoSelecionado === "Saldo da Conta") {
        try {
            const respostaPerfil = await fetch(`http://127.0.0.1:5001/api/usuario/${emailUsuario}`);
            
            if (!respostaPerfil.ok) {
                alert("⚠️ Sessão encerrada. Esta conta foi revogada pelo administrador.");
                logout();
                return;
            }

            const dadosUsuario = await respostaPerfil.json();
            
            if (dadosUsuario.saldo < totalFinal) {
                alert(`❌ Transação Recusada!\nSeu saldo atual é de R$ ${dadosUsuario.saldo.toFixed(2)}, mas a conta totalizou R$ ${totalFinal.toFixed(2)}.`);
                return;
            }
        } catch (erro) {
            console.error("Erro ao consultar saldo:", erro);
            alert("Erro ao consultar fundos com o banco SQLite.");
            return;
        }
    }

    const itensTexto = carrinho.map(i => `• ${i.nome} — R$ ${i.preco.toFixed(2)}`).join("\n");
    const descontoTexto = descontoAtivo > 0 ? `\nDesconto: -R$ ${descontoAtivo.toFixed(2)}` : "";
    
    const confirmado = confirm(
        `📋 Confirmar Pedido e Pagamento?\n\n${itensTexto}${descontoTexto}\n\n💰 Total: R$ ${totalFinal.toFixed(2)}\n💳 Forma: ${metodoSelecionado}\n\nDeseja finalizar?`
    );
    
    if (!confirmado) {
        return;
    }

    // PROCESSA O DÉBITO NO BANCO DE DADOS
    if (metodoSelecionado === "Saldo da Conta") {
        try {
            const respostaDebito = await fetch("http://127.0.0.1:5001/api/usuario/pagar", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailUsuario, valor: totalFinal })
            });

            const resultado = await respostaDebito.json();
            
            if (!respostaDebito.ok) {
                alert("Erro de Cobrança: " + resultado.message);
                return;
            }
            
            alert(`✨ Pagamento processado! R$ ${totalFinal.toFixed(2)} deduzidos da conta.`);
        } catch (erro) {
            console.error("Erro no debito:", erro);
            alert("Erro crítico na comunicação bancária local.");
            return;
        }
    }

    // REGISTRA O PEDIDO NO HISTÓRICO
    const chavePedidos = getChavePedidos();
    const pedidos = JSON.parse(localStorage.getItem(chavePedidos)) || [];

    const novoPedido = {
        id: Math.floor(Math.random() * 10000),
        data: new Date().toLocaleString(),
        itens: [...carrinho],
        total: totalFinal,
        descontoAplicado: descontoAtivo,
        pagamento: metodoSelecionado
    };

    pedidos.push(novoPedido);
    localStorage.setItem(chavePedidos, JSON.stringify(pedidos));

    alert(`✅ Pedido Confirmado via ${metodoSelecionado}! O DanielzinhoFood já está preparando.`);

    localStorage.removeItem(chave);
    localStorage.removeItem(getChaveDesconto());
    descontoAtivo = 0;
    
    window.location.href = "history.html";
}

// ==========================================================================
// 9. HISTÓRICO DE COMPRAS CONCLUÍDAS (PÁGINA HISTORY)
// ==========================================================================

function carregarHistorico() {
    const chavePed = getChavePedidos();
    const pedidos = JSON.parse(localStorage.getItem(chavePed)) || [];
    
    const div = document.getElementById("historico");
    if (!div) return;

    const chaveCar = getChaveCarrinho();
    const carrinho = JSON.parse(localStorage.getItem(chaveCar)) || [];
    atualizarContadorNavbar(carrinho.length);

    if (pedidos.length === 0) {
        div.innerHTML = "<p style='text-align:center; color:gray;'>Nenhum pedido encontrado.</p>";
        return;
    }

    div.innerHTML = "";
    
    pedidos.reverse().forEach(p => {
        const card = document.createElement("div");
        card.classList.add("card");

        let itensTexto = p.itens.map(i => `${i.nome} <span style="font-size:11px; color:gray">(${i.restaurante})</span>`).join("<br>");

        card.innerHTML = `
            <div style="width: 100%;">
                <div style="display:flex; justify-content:space-between; margin-bottom: 10px;">
                    <strong>Pedido #${p.id}</strong> 
                    <small style="color:#999;">${p.data}</small>
                </div>
                <div style="font-size: 14px; margin-bottom: 12px; line-height: 1.4;">
                    ${itensTexto}
                </div>
                <div style="border-top:1px dashed #eee; padding-top:10px; display:flex; justify-content:space-between; align-items:center;">
                    <strong>Total: R$ ${p.total.toFixed(2)} <span style="font-size:12px; font-weight:normal; color:gray;">(${p.pagamento || 'Pix'})</span></strong>
                    ${p.descontoAplicado > 0 ? `<small style="color: #2fbe48; font-weight:600;">Desconto: R$ ${p.descontoAplicado.toFixed(2)}</small>` : ''}
                </div>
            </div>
        `;
        
        div.appendChild(card);
    });
}

// ==========================================================================
// 10. GESTÃO DO PERFIL DO USUÁRIO INTEGRADO AO BANCO
// ==========================================================================

async function carregarPerfilCompleto() {
    const email = localStorage.getItem("usuarioLogado");
    if (!email) return;
    
    try {
        const resposta = await fetch(`http://127.0.0.1:5001/api/usuario/${email}`);
        
        if (!resposta.ok) {
            alert("⚠️ Esta conta não existe mais em nossa base de dados (Excluída pelo Admin).");
            logout();
            return;
        }

        const user = await resposta.json();

        // Atualiza a visualização
        const viewNome = document.getElementById("viewNome");
        if (viewNome) viewNome.innerText = user.nome;
        
        const viewEmail = document.getElementById("viewEmail");
        if (viewEmail) viewEmail.innerText = user.email;
        
        const viewTelefone = document.getElementById("viewTelefone");
        if (viewTelefone) viewTelefone.innerText = user.telefone || "Não cadastrado";
        
        const viewEndereco = document.getElementById("viewEndereco");
        if (viewEndereco) viewEndereco.innerText = user.endereco || "Não cadastrado";
        
        const viewSaldo = document.getElementById("viewSaldo");
        if (viewSaldo) viewSaldo.innerText = `R$ ${user.saldo.toFixed(2)}`;
        
        const viewFoto = document.getElementById("viewFoto");
        if (viewFoto) viewFoto.src = user.foto_url;

        // Preenche os inputs para edição
        const inputNome = document.getElementById("inputNome");
        if (inputNome) inputNome.value = user.nome;
        
        const inputFoto = document.getElementById("inputFoto");
        if (inputFoto) inputFoto.value = user.foto_url;
        
        const inputTelefone = document.getElementById("inputTelefone");
        if (inputTelefone) inputTelefone.value = user.telefone;
        
        const inputEndereco = document.getElementById("inputEndereco");
        if (inputEndereco) inputEndereco.value = user.endereco;

    } catch (erro) {
        console.error("Erro ao carregar dados do usuário do banco:", erro);
    }
}

async function salvarPerfil() {
    const email = localStorage.getItem("usuarioLogado");
    
    const inputNome = document.getElementById("inputNome").value.trim();
    const inputFoto = document.getElementById("inputFoto").value.trim();
    const inputTelefone = document.getElementById("inputTelefone").value.trim();
    const inputEndereco = document.getElementById("inputEndereco").value.trim();

    const dadosAtualizados = {
        email: email,
        nome: inputNome,
        foto_url: inputFoto,
        telefone: inputTelefone,
        endereco: inputEndereco
    };

    try {
        const resposta = await fetch("http://127.0.0.1:5001/api/usuario/atualizar", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosAtualizados)
        });

        if (resposta.ok) {
            alert("✨ Perfil gravado com sucesso no banco de dados!");
            carregarPerfilCompleto(); 
        }
    } catch (erro) {
        console.error("Erro ao atualizar o perfil no banco:", erro);
        alert("Erro ao salvar perfil no servidor.");
    }
}

// ==========================================================================
// 11. ÁREA EXCLUSIVA DE GESTÃO DE USUÁRIOS (PAINEL ADMIN.HTML)
// ==========================================================================

async function adminCarregarUsuarios() {
    const container = document.getElementById("tabelaUsuarios");
    if (!container) return;

    container.innerHTML = "<tr><td colspan='5' style='text-align:center;'>Buscando usuários da base SQLite...</td></tr>";

    try {
        const resposta = await fetch("http://127.0.0.1:5001/api/admin/usuarios", { cache: "no-store" });
        const listaUsuarios = await resposta.json();

        container.innerHTML = "";

        if (listaUsuarios.length === 0) {
            container.innerHTML = "<tr><td colspan='5' style='text-align:center; color:gray;'>Nenhum usuário cadastrado até o momento.</td></tr>";
            return;
        }

        listaUsuarios.forEach(u => {
            // TRAVA DE SEGURANÇA: Impede que o próprio admin mestre seja listado
            if (u.email === "admin") return;

            const tr = document.createElement("tr");
            
            tr.innerHTML = `
                <td>
                    <img src="${u.foto_url}" style="width:35px; height:35px; border-radius:50%; object-fit:cover;">
                </td>
                <td>
                    <strong>${u.nome}</strong><br>
                    <small style="color:#aaa;">${u.email}</small>
                </td>
                <td>
                    <small>${u.telefone || 'Não informado'}<br>${u.endereco || 'Sem endereço'}</small>
                </td>
                <td>
                    <span style="color:#2fbe48; font-weight:bold;">R$ ${u.saldo.toFixed(2)}</span>
                    <div style="display:flex; gap:5px; margin-top:5px;">
                        <input type="number" id="saldo_${u.id}" placeholder="R$" style="width:70px; padding:4px; font-size:12px; margin:0; display:inline-block;">
                        <button onclick="adminAlterarSaldo(${u.id})" style="padding:4px 8px; font-size:12px;">Definir</button>
                    </div>
                </td>
                <td>
                    <button onclick="adminDeletarUsuario(${u.id})" style="background:#c0392b; padding:6px 12px; font-size:12px;">Excluir</button>
                </td>
            `;
            
            container.appendChild(tr);
        });
    } catch (erro) {
        console.error("Erro no fetch admin de usuários:", erro);
        container.innerHTML = "<tr><td colspan='5' style='text-align:center; color:#e74c3c;'>Erro ao carregar base SQLite.</td></tr>";
    }
}

async function adminDeletarUsuario(id) {
    const confirmar = confirm("⚠️ Tem certeza que deseja remover este cliente permanentemente da base de dados?");
    
    if (!confirmar) {
        return;
    }

    try {
        const resposta = await fetch(`http://127.0.0.1:5001/api/admin/usuario/deletar/${id}`, { method: 'DELETE' });
        
        if (resposta.ok) {
            alert("Cliente removido com sucesso!");
            adminCarregarUsuarios();
        }
    } catch (erro) {
        alert("Erro ao realizar operação de exclusão no banco de dados.");
    }
}

async function adminAlterarSaldo(id) {
    const input = document.getElementById(`saldo_${id}`);
    const valor = input ? input.value : "";

    if (!valor || parseFloat(valor) < 0) {
        alert("Insira um valor de saldo válido!");
        return;
    }

    try {
        const resposta = await fetch("http://127.0.0.1:5001/api/admin/usuario/saldo", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id, saldo: valor })
        });

        if (resposta.ok) {
            alert("Saldo atualizado na conta do cliente!");
            adminCarregarUsuarios();
        }
    } catch (erro) {
        alert("Erro ao salvar novo saldo no banco de dados.");
    }
}

// ==========================================================================
// 12. INICIALIZAÇÃO DA PÁGINA
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
    const chave = getChaveCarrinho();
    const carrinho = JSON.parse(localStorage.getItem(chave)) || [];
    
    atualizarContadorNavbar(carrinho.length);
    verificarEExibirBotaoAdmin();
});

function voltarHome() {
    window.location.href = "home.html";
}
