
// ================= LOGIN =================

function cadastrar() {
    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || []

    const email = document.getElementById("novoEmail").value
    const senha = document.getElementById("novaSenha").value

    if (!email || !senha) return alert("Preencha tudo!")

    usuarios.push({ email, senha })
    localStorage.setItem("usuarios", JSON.stringify(usuarios))

    alert("Cadastro realizado!")
    voltarLogin()
}

function login() {
    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || []

    const email = document.getElementById("email").value
    const senha = document.getElementById("senha").value

    const user = usuarios.find(u => u.email === email && u.senha === senha)

    if (user) {
        localStorage.setItem("usuarioLogado", email)
        window.location.href = "home.html"
    } else {
        alert("Login inválido!")
    }
}

function mostrarCadastro() {
    document.querySelectorAll(".box")[0].classList.add("hidden")
    document.getElementById("cadastroBox").classList.remove("hidden")
}

function voltarLogin() {
    document.querySelectorAll(".box")[0].classList.remove("hidden")
    document.getElementById("cadastroBox").classList.add("hidden")
}

// ================= HOME =================

function verificarLogin() {
    if (!localStorage.getItem("usuarioLogado")) {
        window.location.href = "index.html"
    }
}

function logout() {
    localStorage.removeItem("usuarioLogado")
    window.location.href = "index.html"
}

function carregarRestaurantes() {

    const restaurantes = [
        "Pizza Top 🍕",
        "Burger House 🍔",
        "Sushi Master 🍣"
    ]

    const lista = document.getElementById("lista")
    lista.innerHTML = ""

    restaurantes.forEach(r => {
        const div = document.createElement("div")
        div.classList.add("card")

        div.innerHTML = `
            <span>${r}</span>
            <button onclick="abrirRestaurante('${r}')">Ver menu</button>
        `

        lista.appendChild(div)
    })
}

function abrirRestaurante(nome) {
    localStorage.setItem("restauranteAtual", nome)
    window.location.href = "restaurant.html"
}

// ================= RESTAURANTE =================

let carrinho = []

function carregarMenu() {

    const nome = localStorage.getItem("restauranteAtual")
    document.getElementById("nomeRestaurante").innerText = "🍽 " + nome

    const menus = {
        "Pizza Top 🍕": [
            { nome: "Pizza Calabresa 🍕", preco: 25 },
            { nome: "Pizza Mussarela 🍕", preco: 22 },
            { nome: "Refrigerante 🥤", preco: 6 }
        ],

        "Burger House 🍔": [
            { nome: "Cheeseburger 🍔", preco: 18 },
            { nome: "Batata Frita 🍟", preco: 10 },
            { nome: "Refrigerante 🥤", preco: 6 }
        ],

        "Sushi Master 🍣": [
            { nome: "Hot Roll 🍣", preco: 28 },
            { nome: "Sashimi 🐟", preco: 35 },
            { nome: "Temaki 🍙", preco: 20 }
        ]
    }

    const menu = menus[nome] || []
    const div = document.getElementById("menu")
    div.innerHTML = ""

    menu.forEach(item => {
        const card = document.createElement("div")
        card.classList.add("card")

        card.innerHTML = `
            <div>
                <strong>${item.nome}</strong><br>
                R$ ${item.preco}
            </div>
            <button onclick="adicionarCarrinho('${item.nome}', ${item.preco})">
                Adicionar
            </button>
        `

        div.appendChild(card)
    })
}

function adicionarCarrinho(nome, preco) {
    carrinho.push({ nome, preco })
    atualizarCarrinho()
}

function removerItem(index) {
    carrinho.splice(index, 1)
    atualizarCarrinho()
}

function atualizarCarrinho() {
    const ul = document.getElementById("listaCarrinho")
    ul.innerHTML = ""

    let total = 0

    carrinho.forEach((item, index) => {
        total += item.preco

        const li = document.createElement("li")
        li.innerHTML = `
            ${item.nome} - R$ ${item.preco}
            <button onclick="removerItem(${index})" class="btn-remover">Remover</button>
        `
        ul.appendChild(li)
    })

    document.getElementById("total").innerText =
        "Total: R$ " + total.toFixed(2)
}

// ================= FINALIZAR =================

function finalizarPedido() {

    if (carrinho.length === 0) {
        alert("Carrinho vazio!")
        return
    }

    const pedidos = JSON.parse(localStorage.getItem("pedidos")) || []

    const novoPedido = {
        id: Date.now(),
        itens: carrinho,
        total: carrinho.reduce((acc, i) => acc + i.preco, 0)
    }

    pedidos.push(novoPedido)
    localStorage.setItem("pedidos", JSON.stringify(pedidos))

    alert("Pedido finalizado!")

    carrinho = []
    atualizarCarrinho()
}

// ================= HISTÓRICO =================

function carregarHistorico() {

    const pedidos = JSON.parse(localStorage.getItem("pedidos")) || []
    const div = document.getElementById("historico")

    if (pedidos.length === 0) {
        div.innerHTML = "<p>Nenhum pedido ainda.</p>"
        return
    }

    pedidos.reverse().forEach(p => {

        const card = document.createElement("div")
        card.classList.add("card")

        card.innerHTML = `
            <div>
                <strong>Pedido #${p.id}</strong><br>
                Total: R$ ${p.total.toFixed(2)}
            </div>
        `

        div.appendChild(card)
    })
}

function voltarHome() {
    window.location.href = "home.html"
}

function voltar() {
    window.location.href = "home.html"
}