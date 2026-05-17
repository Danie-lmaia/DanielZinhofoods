from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)

# Configuração robusta de CORS para permitir a comunicação com o Live Server
CORS(app, resources={r"/api/*": {"origins": "*"}})

# --- BANCO DE DADOS EM MEMÓRIA ---

restaurantes = [
    {
        "id": 1,
        "nome": "Danielzinho Burger",
        "categoria": "Hambúrguer",
        "nota": 4.9,
        "taxa": 5.00
    },

    {
        "id": 2,
        "nome": "Pizzaria Suprema",
        "categoria": "Pizza",
        "nota": 4.8,
        "taxa": 7.50
    },

    {
        "id": 3,
        "nome": "Sushi House",
        "categoria": "Japonesa",
        "nota": 4.7,
        "taxa": 9.00
    },

    {
        "id": 4,
        "nome": "Açaí Tropical",
        "categoria": "Açaí",
        "nota": 4.9,
        "taxa": 4.00
    },

    {
        "id": 5,
        "nome": "Café Brasil",
        "categoria": "Cafeteria",
        "nota": 4.6,
        "taxa": 3.50
    }
]


menus = {

    "Danielzinho Burger": [
        {"nome": "Super X-Tudo", "preco": 25.90},
        {"nome": "Smash Burger", "preco": 22.00},
        {"nome": "Batata Suprema", "preco": 15.00},
        {"nome": "Milkshake Oreo", "preco": 18.00}
    ],

    "Pizzaria Suprema": [
        {"nome": "Pizza Calabresa", "preco": 49.90},
        {"nome": "Pizza Frango Catupiry", "preco": 55.00},
        {"nome": "Pizza Portuguesa", "preco": 52.00},
        {"nome": "Coca-Cola 2L", "preco": 14.00}
    ],

    "Sushi House": [
        {"nome": "Combo 20 peças", "preco": 44.90},
        {"nome": "Temaki Salmão", "preco": 28.00},
        {"nome": "Hot Roll", "preco": 24.90},
        {"nome": "Guaraná Lata", "preco": 6.00}
    ],

    "Açaí Tropical": [
        {"nome": "Açaí 500ml", "preco": 18.00},
        {"nome": "Açaí 700ml", "preco": 24.00},
        {"nome": "Combo Açaí + Banana", "preco": 28.00}
    ],

    "Café Brasil": [
        {"nome": "Cappuccino", "preco": 12.00},
        {"nome": "Pão de Queijo", "preco": 8.00},
        {"nome": "Café Expresso", "preco": 7.00},
        {"nome": "Torta de Chocolate", "preco": 16.00}
    ]
}


# Dicionário de cupons
cupons = {
    "DANIEL10": 10.00,
    "FOODS5": 5.00,
    "FASTDELIVERY": 10.00
}

# --- ROTAS PÚBLICAS ---

@app.route('/api/restaurantes', methods=['GET'])
def get_restaurantes():
    return jsonify(restaurantes)

@app.route('/api/menu/<restaurante_nome>', methods=['GET'])
def get_menu(restaurante_nome):
    return jsonify(menus.get(restaurante_nome, []))

@app.route('/api/cupom/<codigo>', methods=['GET'])
def validar_cupom(codigo):
    desconto = cupons.get(codigo.upper(), 0)
    return jsonify({"desconto": desconto})

# --- ROTAS DO ADMINISTRADOR ---

@app.route('/api/admin/login', methods=['POST', 'OPTIONS'])
def admin_login():

    if request.method == 'OPTIONS':
        return '', 204

    dados = request.json
    usuario = dados.get("usuario")
    senha = dados.get("senha")

    if usuario == "admin" and senha == "1234":
        return jsonify({"success": True}), 200

    return jsonify({
        "success": False,
        "message": "Login ou senha inválidos"
    }), 401

@app.route('/api/admin/cadastrar-restaurante', methods=['POST'])
def cadastrar_restaurante():

    novo = request.json
    nome = novo['nome']

    restaurantes.append({
        "id": len(restaurantes) + 1,
        "nome": nome,
        "categoria": novo['categoria'],
        "nota": 5.0,
        "taxa": float(novo['taxa'])
    })

    menus[nome] = []

    return jsonify({"success": True})

@app.route('/api/admin/adicionar-item', methods=['POST'])
def adicionar_item():

    dados = request.json
    res_nome = dados['restaurante']

    if res_nome in menus:

        menus[res_nome].append({
            "nome": dados['nome'],
            "preco": float(dados['preco'])
        })

        return jsonify({"success": True})

    return jsonify({
        "error": "Restaurante não encontrado"
    }), 404

@app.route('/api/admin/cadastrar-cupom', methods=['POST'])
def cadastrar_cupom():

    dados = request.json

    cupons[dados['codigo'].upper()] = float(dados['valor'])

    return jsonify({"success": True})

if __name__ == '__main__':
    app.run(debug=True, port=5001)
