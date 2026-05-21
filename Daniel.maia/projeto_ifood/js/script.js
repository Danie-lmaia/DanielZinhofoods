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
// 5. VITRINE DE LOJAS E FILTRO EM TEMPO REAL
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
        lista.innerHTML = "<p style='text-align:center;'>❌ Erro ao conectar ao servidor.</p>";
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
                <img src="${r.foto_url}" class="img-loja img-zoom" alt="${r.nome}" onclick="abrirImagemFullscreen(this.src)">
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

    const nomeOriginal =
        localStorage.getItem("restauranteAtual") || "";

    const nome = nomeOriginal.trim();

    const tituloMenu =
        document.getElementById("nomeRestaurante");

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

        // =========================
        // BUSCA TODOS RESTAURANTES
        // =========================

        const respostaRestaurantes = await fetch(
            "http://127.0.0.1:5001/api/restaurantes",
            { cache: "no-store" }
        );

        const restaurantes =
            await respostaRestaurantes.json();

        // Restaurante atual
        const restauranteAtual =
            restaurantes.find(
                r => r.nome.trim() === nome
            );

        // Taxa de entrega correta
        const taxaEntrega =
            restauranteAtual?.taxa || 0;

        // =========================
        // BUSCA CARDÁPIO
        // =========================

        const resposta = await fetch(
            `http://127.0.0.1:5001/api/menu/${nome}`,
            { cache: "no-store" }
        );

        const menu = await resposta.json();

        div.innerHTML = "";

        menu.forEach(item => {

            const card = document.createElement("div");

            card.classList.add("card");

            card.innerHTML = `
                <div class="card-info">

                    <img
                        src="${item.foto_url}"
                        class="img-prato img-zoom"
                        alt="${item.nome}"
                        onclick="abrirImagemFullscreen(this.src)"
                    >

                    <div>
                        <span class="nome-item-card">
                            ${item.nome}
                        </span>

                        <small>
                            R$ ${item.preco.toFixed(2)}
                        </small>
                    </div>

                </div>

                <button
                    onclick="adicionarCarrinho(
                        '${item.nome}',
                        ${item.preco},
                        '${nome}',
                        ${taxaEntrega}
                    )"
                >
                    Adicionar
                </button>
            `;

            div.appendChild(card);
        });

    } catch (erro) {

        console.error("Erro ao carregar menu:", erro);

        div.innerHTML =
            "<p style='text-align:center;'>❌ Erro ao carregar menu.</p>";
    }

    carregarDesconto();

    atualizarCarrinho();
}

// ==========================================================================
// 7. GESTÃO DE COMPRAS LOCAIS (SACOLA E OPERAÇÕES)
// ==========================================================================

function adicionarCarrinho(
    nomeItem,
    precoItem,
    nomeRestaurante,
    taxaEntrega = 0
) {

    const chave = getChaveCarrinho();

    const carrinho =
        JSON.parse(localStorage.getItem(chave)) || [];

    carrinho.push({
        nome: nomeItem,
        preco: precoItem,
        restaurante: nomeRestaurante,
        taxa: taxaEntrega
    });

    localStorage.setItem(
        chave,
        JSON.stringify(carrinho)
    );

    atualizarCarrinho();

    mostrarToast(
        `"${nomeItem}" foi adicionado à sacola!`
    );
}

function removerItem(index) {

    const chave = getChaveCarrinho();

    const carrinho =
        JSON.parse(localStorage.getItem(chave)) || [];

    carrinho.splice(index, 1);

    localStorage.setItem(
        chave,
        JSON.stringify(carrinho)
    );

    atualizarCarrinho();
}

function atualizarCarrinho() {

    const ul =
        document.getElementById("listaCarrinho");

    const chave = getChaveCarrinho();

    const carrinho =
        JSON.parse(localStorage.getItem(chave)) || [];

    atualizarContadorNavbar(carrinho.length);

    if (!ul) return;

    ul.innerHTML = "";

    let subtotal = 0;

    // =========================
    // SOMA FRETES DIFERENTES
    // =========================

    const taxasPorRestaurante = {};

    carrinho.forEach((item, index) => {

        subtotal += item.preco;

        // Guarda taxa apenas 1 vez por loja
        if (
            !taxasPorRestaurante[item.restaurante]
        ) {
            taxasPorRestaurante[item.restaurante] =
                item.taxa || 0;
        }

        const li = document.createElement("li");

        li.style.display = "flex";
        li.style.justifyContent = "space-between";
        li.style.alignItems = "center";
        li.style.marginBottom = "8px";

        li.innerHTML = `
            <div>

                <span
                    style="
                        font-size:14px;
                        font-weight:500;
                    "
                >
                    ${item.nome}
                </span>

                <br>

                <small
                    style="
                        color:gray;
                        font-size:11px;
                    "
                >
                    ${item.restaurante}
                </small>

            </div>

            <div>

                <span
                    style="
                        font-size:14px;
                        font-weight:600;
                        margin-right:10px;
                    "
                >
                    R$ ${item.preco.toFixed(2)}
                </span>

                <button
                    onclick="removerItem(${index})"
                    class="btn-remover"
                >
                    Remover
                </button>

            </div>
        `;

        ul.appendChild(li);
    });

    // =========================
    // TOTAL DE FRETES
    // =========================

    const totalEntrega =
        Object.values(taxasPorRestaurante)
            .reduce((acc, taxa) => acc + taxa, 0);

    // =========================
    // DESCONTO 30%
    // =========================

    const desconto30 =
        (subtotal + totalEntrega) * 0.30;

    // =========================
    // TOTAL FINAL
    // =========================

    let totalFinal =
        subtotal +
        totalEntrega -
        desconto30;

    if (totalFinal < 0) {
        totalFinal = 0;
    }

    const totalEl =
        document.getElementById("total");

    if (totalEl) {

        totalEl.innerHTML = `

            <small style="color:#555;">

                🛒 Subtotal:
                R$ ${subtotal.toFixed(2)}

            </small>

            <br>

            <small style="color:#555;">

                🚚 Entrega:
                R$ ${totalEntrega.toFixed(2)}

            </small>

            <br>

            <small
                style="
                    color:#2fbe48;
                    font-weight:600;
                "
            >

                🎁 Desconto 30%:
                -R$ ${desconto30.toFixed(2)}

            </small>

            <br>

            <strong
                style="
                    font-size:20px;
                    color:black;
                "
            >

                Total:
                R$ ${totalFinal.toFixed(2)}

            </strong>
        `;
    }
}

// ==========================================================================
// 8. FINALIZAÇÃO DE PEDIDOS
// ==========================================================================

async function finalizarPedido() {

    const emailUsuario =
        localStorage.getItem("usuarioLogado");

    const chave =
        getChaveCarrinho();

    const carrinho =
        JSON.parse(localStorage.getItem(chave)) || [];

    if (carrinho.length === 0) {

        alert("Sua sacola está vazia!");

        return;
    }

    let metodoSelecionado = "Pix";

    const radioMetodo = document.querySelector(
        'input[name="metodo"]:checked'
    );

    if (radioMetodo) {
        metodoSelecionado = radioMetodo.value;
    }

    // =========================
    // SUBTOTAL
    // =========================

    const subtotal =
        carrinho.reduce(
            (acc, item) => acc + item.preco,
            0
        );

    // =========================
    // SOMA FRETES ÚNICOS
    // =========================

    const taxasPorRestaurante = {};

    carrinho.forEach(item => {

        if (
            !taxasPorRestaurante[item.restaurante]
        ) {
            taxasPorRestaurante[item.restaurante] =
                item.taxa || 0;
        }
    });

    const totalEntrega =
        Object.values(taxasPorRestaurante)
            .reduce((acc, taxa) => acc + taxa, 0);

    // =========================
    // DESCONTO 30%
    // =========================

    const desconto30 =
        (subtotal + totalEntrega) * 0.30;

    // =========================
    // TOTAL FINAL
    // =========================

    let totalFinal =
        subtotal +
        totalEntrega -
        desconto30;

    if (totalFinal < 0) {
        totalFinal = 0;
    }

    // =========================
    // CONFIRMAÇÃO
    // =========================

    const itensTexto =
        carrinho
            .map(
                item =>
                    `• ${item.nome}
(${item.restaurante})
R$ ${item.preco.toFixed(2)}`
            )
            .join("\n\n");

    const confirmado = confirm(
`📋 CONFIRMAR PEDIDO

${itensTexto}

🛒 Subtotal:
R$ ${subtotal.toFixed(2)}

🚚 Entrega:
R$ ${totalEntrega.toFixed(2)}

🎁 Desconto 30%:
-R$ ${desconto30.toFixed(2)}

💰 TOTAL:
R$ ${totalFinal.toFixed(2)}

💳 Pagamento:
${metodoSelecionado}

Deseja finalizar?`
    );

    if (!confirmado) return;

    // =========================
    // PAGAMENTO SALDO
    // =========================

    if (metodoSelecionado === "Saldo da Conta") {

        try {

            const respostaPerfil =
                await fetch(
                    `http://127.0.0.1:5001/api/usuario/${emailUsuario}`
                );

            const dadosUsuario =
                await respostaPerfil.json();

            if (
                dadosUsuario.saldo < totalFinal
            ) {

                alert(
`❌ Saldo insuficiente!

Saldo:
R$ ${dadosUsuario.saldo.toFixed(2)}

Total:
R$ ${totalFinal.toFixed(2)}`
                );

                return;
            }

            const respostaDebito =
                await fetch(
                    "http://127.0.0.1:5001/api/usuario/pagar",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            email: emailUsuario,
                            valor: totalFinal
                        })
                    }
                );

            if (!respostaDebito.ok) {

                alert(
                    "Erro ao processar pagamento."
                );

                return;
            }

        } catch (erro) {

            console.error(erro);

            alert(
                "Erro ao processar pagamento."
            );

            return;
        }
    }

    // =========================
    // SALVAR PEDIDO
    // =========================

    const chavePedidos =
        getChavePedidos();

    const pedidos =
        JSON.parse(
            localStorage.getItem(chavePedidos)
        ) || [];

    const novoPedido = {

        id:
            Math.floor(
                Math.random() * 10000
            ),

        data:
            new Date().toLocaleString(),

        itens: [...carrinho],

        subtotal: subtotal,

        entrega: totalEntrega,

        descontoAplicado:
            desconto30,

        total: totalFinal,

        pagamento:
            metodoSelecionado,

        avaliado: false
    };

    pedidos.push(novoPedido);

    localStorage.setItem(
        chavePedidos,
        JSON.stringify(pedidos)
    );

    alert(
        "✅ Pedido confirmado com sucesso!"
    );

    // =========================
    // LIMPA CARRINHO
    // =========================

    localStorage.removeItem(chave);

    descontoAtivo = 0;

    window.location.href =
        "history.html";
}
// ==========================================================================
// 9. HISTÓRICO DE COMPRAS CONCLUÍDAS E AVALIAÇÃO MÚLTIPLA
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
        
        let botaoAvaliacao = p.avaliado 
            ? `<span style="color: #f39c12; font-size: 13px; font-weight: bold;">⭐ Pedido Avaliado</span>` 
            : `<button onclick="avaliarPedido(${p.id})" style="background:#f39c12; padding:6px 12px; font-size:12px; border-radius:6px; border:none; cursor:pointer; color:white; font-weight:bold;">⭐ Avaliar Lojas</button>`;

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
                    <div>
                        <strong style="display:block;">Total: R$ ${p.total.toFixed(2)} <span style="font-size:12px; font-weight:normal; color:gray;">(${p.pagamento || 'Pix'})</span></strong>
                        ${p.descontoAplicado > 0 ? `<small style="color: #2fbe48; font-weight:600;">Desconto: R$ ${p.descontoAplicado.toFixed(2)}</small>` : ''}
                    </div>
                    <div>
                        ${botaoAvaliacao}
                    </div>
                </div>
            </div>
        `;
        
        div.appendChild(card);
    });
}

async function avaliarPedido(pedidoId) {
    const chavePed = getChavePedidos();
    const pedidos = JSON.parse(localStorage.getItem(chavePed)) || [];
    const index = pedidos.findIndex(p => p.id === pedidoId);
    
    if (index === -1) return;
    const pedido = pedidos[index];
    
    const restaurantesEnvolvidos = [...new Set(pedido.itens.map(i => i.restaurante))];
    
    for (const loja of restaurantesEnvolvidos) {
        let notaStr = prompt(`De 1 a 5, que nota você dá para o cardápio e entrega do(a) ${loja}?`);
        
        if (!notaStr) continue; 
        
        let nota = parseFloat(notaStr.replace(',', '.'));
        
        if (isNaN(nota) || nota < 1 || nota > 5) {
            alert(`⚠️ Nota inválida para ${loja}. Pulo ativado.`);
            continue;
        }

        try {
            const resposta = await fetch("http://127.0.0.1:5001/api/restaurante/avaliar", {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ restaurante: loja, nota: nota })
            });
            
            const dados = await resposta.json();
            
            if (resposta.ok && dados.success) {
                mostrarToast(`✨ Avaliação registrada! A nova nota do(a) ${loja} é ⭐ ${dados.nova_nota}`);
            } else {
                alert(`Erro ao avaliar ${loja}: ` + dados.message);
            }
        } catch (erro) {
            console.error("Erro na avaliação:", erro);
            alert(`Falha de conexão ao enviar a avaliação para ${loja}.`);
        }
    }
    
    pedido.avaliado = true;
    localStorage.setItem(chavePed, JSON.stringify(pedidos));
    
    carregarHistorico();
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
        
        // Torna a foto do perfil clicável para ampliar
        const viewFoto = document.getElementById("viewFoto");
        if (viewFoto) {
            viewFoto.src = user.foto_url;
            viewFoto.classList.add("img-zoom");
            viewFoto.onclick = () => abrirImagemFullscreen(user.foto_url);
        }

        const inputNome = document.getElementById("inputNome");
        if (inputNome) inputNome.value = user.nome;
        
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
    const inputTelefone = document.getElementById("inputTelefone").value.trim();
    const inputEndereco = document.getElementById("inputEndereco").value.trim();

    let urlFotoFinal = document.getElementById("viewFoto").src;
    
    const campoArquivo = document.getElementById("inputFotoArquivo");
    if (campoArquivo && campoArquivo.files.length > 0) {
        const linkUpload = await uploadArquivo(campoArquivo);
        if (linkUpload) {
            urlFotoFinal = linkUpload;
        }
    }

    const dadosAtualizados = {
        email: email,
        nome: inputNome,
        foto_url: urlFotoFinal,
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
            if(campoArquivo) campoArquivo.value = ""; 
        }
    } catch (erro) {
        console.error("Erro ao atualizar o perfil:", erro);
        alert("Erro ao salvar perfil no servidor.");
    }
}

// ==========================================================================
// 11. ÁREA EXCLUSIVA DE GESTÃO DE USUÁRIOS E ADMIN
// ==========================================================================

async function adminCarregarUsuarios() {

    const container =
        document.getElementById("tabelaUsuarios");

    if (!container) return;

    container.innerHTML = `
        <tr>
            <td colspan="5"
                style="
                    text-align:center;
                    padding:20px;
                "
            >
                Carregando usuários...
            </td>
        </tr>
    `;

    try {

        const resposta = await fetch(
            "http://127.0.0.1:5001/api/admin/usuarios",
            { cache: "no-store" }
        );

        const listaUsuarios =
            await resposta.json();

        container.innerHTML = "";

        if (listaUsuarios.length === 0) {

            container.innerHTML = `
                <tr>
                    <td colspan="5"
                        style="
                            text-align:center;
                            color:gray;
                            padding:20px;
                        "
                    >
                        Nenhum usuário cadastrado.
                    </td>
                </tr>
            `;

            return;
        }

        listaUsuarios.forEach(u => {

            if (u.email === "admin") return;

            const tr = document.createElement("tr");

            tr.style.borderBottom =
                "1px solid #eee";

            tr.style.verticalAlign = "middle";

            tr.innerHTML = `

                <!-- FOTO -->
                <td
                    style="
                        width:90px;
                        text-align:center;
                        padding:12px;
                    "
                >

                    <img
                        src="${u.foto_url}"

                        class="img-zoom"

                        onclick="
                            abrirImagemFullscreen(
                                this.src
                            )
                        "

                        style="
                            width:55px;
                            height:55px;
                            border-radius:50%;
                            object-fit:cover;
                            border:2px solid #ddd;
                            cursor:pointer;
                        "
                    >

                </td>

                <!-- NOME / EMAIL -->
                <td
                    style="
                        min-width:230px;
                        padding:12px;
                    "
                >

                    <div
                        style="
                            font-size:15px;
                            font-weight:bold;
                            margin-bottom:4px;
                        "
                    >
                        ${u.nome}
                    </div>

                    <div
                        style="
                            font-size:12px;
                            color:#888;
                            word-break:break-word;
                        "
                    >
                        ${u.email}
                    </div>

                </td>

                <!-- TELEFONE / ENDEREÇO -->
                <td
                    style="
                        min-width:250px;
                        padding:12px;
                        font-size:13px;
                        line-height:1.6;
                    "
                >

                    <div>
                        📞
                        ${u.telefone || "Não informado"}
                    </div>

                    <div>
                        📍
                        ${u.endereco || "Sem endereço"}
                    </div>

                </td>

                <!-- SALDO -->
                <td
                    style="
                        min-width:220px;
                        padding:12px;
                    "
                >

                    <div
                        style="
                            color:#27ae60;
                            font-size:16px;
                            font-weight:bold;
                            margin-bottom:10px;
                        "
                    >

                        R$ ${u.saldo.toFixed(2)}

                    </div>

                    <div
                        style="
                            display:flex;
                            gap:8px;
                            align-items:center;
                            flex-wrap:wrap;
                        "
                    >

                        <input
                            type="number"

                            id="saldo_${u.id}"

                            placeholder="Novo saldo"

                            style="
                                width:110px;
                                padding:8px;
                                border:1px solid #ccc;
                                border-radius:8px;
                                font-size:12px;
                                outline:none;
                            "
                        >

                        <button
                            onclick="
                                adminAlterarSaldo(
                                    ${u.id}
                                )
                            "

                            style="
                                padding:8px 12px;
                                border:none;
                                border-radius:8px;
                                background:#3498db;
                                color:white;
                                cursor:pointer;
                                font-size:12px;
                                font-weight:bold;
                            "
                        >

                            Salvar

                        </button>

                    </div>

                </td>

                <!-- AÇÕES -->
                <td
                    style="
                        width:140px;
                        text-align:center;
                        padding:12px;
                    "
                >

                    <button
                        onclick="
                            adminDeletarUsuario(
                                ${u.id}
                            )
                        "

                        style="
                            background:#e74c3c;
                            color:white;
                            border:none;
                            border-radius:8px;
                            padding:10px 14px;
                            cursor:pointer;
                            font-size:12px;
                            font-weight:bold;
                            transition:0.2s;
                        "

                        onmouseover="
                            this.style.opacity='0.8'
                        "

                        onmouseout="
                            this.style.opacity='1'
                        "
                    >

                        Excluir

                    </button>

                </td>
            `;

            container.appendChild(tr);
        });

    } catch (erro) {

        console.error(
            "Erro ao carregar usuários:",
            erro
        );

        container.innerHTML = `
            <tr>
                <td colspan="5"
                    style="
                        text-align:center;
                        color:red;
                        padding:20px;
                    "
                >
                    ❌ Erro ao carregar usuários.
                </td>
            </tr>
        `;
    }
}
// ==========================================================================
// 12. SISTEMA DE UPLOAD DE ARQUIVOS
// ==========================================================================

async function uploadArquivo(fileInput) {
    if (!fileInput || fileInput.files.length === 0) return null;
    
    const formData = new FormData();
    formData.append("arquivo", fileInput.files[0]);
    
    try {
        const resposta = await fetch("http://127.0.0.1:5001/api/upload", {
            method: 'POST',
            body: formData 
        });
        const dados = await resposta.json();
        return dados.success ? dados.url : null;
    } catch (erro) {
        console.error("Erro no upload da imagem:", erro);
        return null;
    }
}

// ==========================================================================
// 13. INICIALIZAÇÃO DA PÁGINA
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

// ==========================================================================
// 14. SISTEMA DE VISUALIZAÇÃO DE IMAGEM AMPLIADA (LIGHTBOX)
// ==========================================================================

function abrirImagemFullscreen(url) {
    let modal = document.getElementById("modalVisualizadorImagem");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "modalVisualizadorImagem";
        modal.className = "modal-fullscreen";
        modal.innerHTML = `
            <span class="fechar-fullscreen" onclick="fecharImagemFullscreen()">&times;</span>
            <img id="imgVisualizador" src="">
        `;
        // Clicar no fundo escuro fecha a imagem
        modal.addEventListener('click', function(e) {
            if(e.target === modal) fecharImagemFullscreen();
        });
        document.body.appendChild(modal);
    }
    
    document.getElementById("imgVisualizador").src = url;
    
    // Mostra o modal com uma leve animação fade-in
    modal.style.display = "flex";
    setTimeout(() => modal.classList.add("mostrar"), 10);
}

function fecharImagemFullscreen() {
    const modal = document.getElementById("modalVisualizadorImagem");
    if (modal) {
        modal.classList.remove("mostrar");
        setTimeout(() => modal.style.display = "none", 300);
    }
}
