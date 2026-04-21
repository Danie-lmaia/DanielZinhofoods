from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
# Configuração robusta de CORS para permitir a comunicação com o Live Server (porta 5500)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# --- BANCO DE DADOS EM MEMÓRIA ---
restaurantes = [
    {"id": 1, "nome": "Danielzinho Burger", "categoria": "Lanches", "nota": 4.8, "taxa": 5.00}
]

menus = {
    "Danielzinho Burger": [
        {"nome": "Super X-Tudo", "preco": 25.90},
        {"nome": "Batata Frita", "preco": 12.00}
    ]
}

# Dicionário de cupons: "NOME": valor_desconto
cupons = {
    "DANIEL10": 10.00,
    "FOODS5": 5.00
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

# ROTA DE LOGIN CORRIGIDA: Adicionado suporte a OPTIONS e verificação de admin
@app.route('/api/admin/login', methods=['POST', 'OPTIONS'])
def admin_login():
    if request.method == 'OPTIONS':
        return '', 204  # Resposta necessária para o navegador liberar o CORS
    
    dados = request.json
    usuario = dados.get("usuario")
    senha = dados.get("senha")

    if usuario == "admin" and senha == "1234":
        return jsonify({"success": True}), 200
    
    return jsonify({"success": False, "message": "Login ou senha inválidos"}), 401

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
        menus[res_nome].append({"nome": dados['nome'], "preco": float(dados['preco'])})
        return jsonify({"success": True})
    return jsonify({"error": "Restaurante não encontrado"}), 404

@app.route('/api/admin/cadastrar-cupom', methods=['POST'])
def cadastrar_cupom():
    dados = request.json
    cupons[dados['codigo'].upper()] = float(dados['valor'])
    return jsonify({"success": True})

if __name__ == '__main__':
    # Usando a porta 5001 conforme configurado no seu script.js
    app.run(debug=True, port=5001)