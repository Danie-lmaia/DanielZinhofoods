import os
import time
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.utils import secure_filename

app = Flask(__name__)

# Configuração de CORS
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=False)

# Configuração do Banco de Dados SQLite
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'database.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Configuração da Pasta de Uploads
UPLOAD_FOLDER = os.path.join(basedir, 'uploads')
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

db = SQLAlchemy(app)

# --- MODELOS DO BANCO DE DADOS ---

class Usuario(db.Model):
    __tablename__ = 'usuarios'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    senha = db.Column(db.String(120), nullable=False)
    nome = db.Column(db.String(100), default="Usuário Faminto")
    foto_url = db.Column(db.String(300), default="img/DFoods.jpg")
    endereco = db.Column(db.String(200), default="")
    telefone = db.Column(db.String(20), default="")
    saldo = db.Column(db.Float, default=0.0)

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "nome": self.nome,
            "foto_url": self.foto_url,
            "endereco": self.endereco,
            "telefone": self.telefone,
            "saldo": self.saldo
        }

class Restaurante(db.Model):
    __tablename__ = 'restaurantes'
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), unique=True, nullable=False)
    categoria = db.Column(db.String(50), nullable=False)
    nota = db.Column(db.Float, default=4.9)
    taxa = db.Column(db.Float, nullable=False)
    foto_url = db.Column(db.String(300), nullable=True)
    
    itens = db.relationship('ItemMenu', backref='restaurante', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "nome": self.nome,
            "categoria": self.categoria,
            "nota": self.nota,
            "taxa": self.taxa,
            "foto_url": self.foto_url or "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=150"
        }

class ItemMenu(db.Model):
    __tablename__ = 'itens_menu'
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    preco = db.Column(db.Float, nullable=False)
    foto_url = db.Column(db.String(300), nullable=True)
    restaurante_nome = db.Column(db.String(100), db.ForeignKey('restaurantes.nome'), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "nome": self.nome,
            "preco": self.preco,
            "foto_url": self.foto_url or "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150"
        }

class Cupom(db.Model):
    __tablename__ = 'cupons'
    id = db.Column(db.Integer, primary_key=True)
    codigo = db.Column(db.String(30), unique=True, nullable=False)
    valor = db.Column(db.Float, nullable=False)

class Avaliacao(db.Model):
    __tablename__ = 'avaliacoes'
    id = db.Column(db.Integer, primary_key=True)
    restaurante_nome = db.Column(db.String(100), db.ForeignKey('restaurantes.nome'), nullable=False)
    nota = db.Column(db.Float, nullable=False)

# --- INICIALIZAÇÃO SEGURA DO BANCO ---
with app.app_context():
    db.create_all()
    
    if not Restaurante.query.first():
        res_padrao = [
            Restaurante(nome="Danielzinho Burger", categoria="Hambúrguer", nota=4.9, taxa=5.00, foto_url="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=150"),
            Restaurante(nome="Pizzaria Suprema", categoria="Pizza", nota=4.8, taxa=7.50, foto_url="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=150"),
            Restaurante(nome="Sushi House", categoria="Japonesa", nota=4.7, taxa=9.00, foto_url="https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=150"),
            Restaurante(nome="Açaí Tropical", categoria="Açaí", nota=4.9, taxa=4.00, foto_url="https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=150"),
            Restaurante(nome="Café Brasil", categoria="Cafeteria", nota=4.6, taxa=3.50, foto_url="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=150")
        ]
        db.session.add_all(res_padrao)
        
        menu_padrao = [
            ItemMenu(nome="Super X-Tudo", preco=25.90, restaurante_nome="Danielzinho Burger", foto_url="https://images.unsplash.com/photo-1550547660-d9450f859349?w=150"),
            ItemMenu(nome="Smash Burger", preco=22.00, restaurante_nome="Danielzinho Burger", foto_url="https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=150"),
            ItemMenu(nome="Batata Suprema", preco=15.00, restaurante_nome="Danielzinho Burger", foto_url="https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=150"),
            ItemMenu(nome="Pizza Calabresa", preco=49.90, restaurante_nome="Pizzaria Suprema", foto_url="https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=150"),
            ItemMenu(nome="Combo 20 peças", preco=44.90, restaurante_nome="Sushi House", foto_url="https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=150"),
            ItemMenu(nome="Açaí 500ml", preco=18.00, restaurante_nome="Açaí Tropical", foto_url="https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=150"),
            ItemMenu(nome="Cappuccino", preco=12.00, restaurante_nome="Café Brasil", foto_url="https://images.unsplash.com/photo-1541167760496-1628856ab772?w=150")
        ]
        db.session.add_all(menu_padrao)
        
        cupons_padrao = [
            Cupom(codigo="DANIEL10", valor=10.00),
            Cupom(codigo="FOODS5", valor=5.00)
        ]
        db.session.add_all(cupons_padrao)
        db.session.commit()

@app.before_request
def handle_options_requests():
    if request.method == 'OPTIONS':
        return app.make_default_options_response()

# --- ROTAS DE UPLOAD DE IMAGENS ---

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/api/upload', methods=['POST', 'OPTIONS'])
def api_upload_imagem():
    if request.method == 'OPTIONS': 
        return '', 204
    
    if 'arquivo' not in request.files:
        return jsonify({"success": False, "message": "Nenhum arquivo enviado"}), 400
        
    file = request.files['arquivo']
    if file.filename == '':
        return jsonify({"success": False, "message": "Nome de arquivo vazio"}), 400
        
    if file:
        filename = secure_filename(file.filename)
        novo_nome = f"{int(time.time())}_{filename}"
        caminho_completo = os.path.join(app.config['UPLOAD_FOLDER'], novo_nome)
        file.save(caminho_completo)
        
        url_imagem = f"http://127.0.0.1:5001/uploads/{novo_nome}"
        return jsonify({"success": True, "url": url_imagem}), 200

# --- ROTAS DE AUTENTICAÇÃO E PERFIL ---

@app.route('/api/usuario/cadastrar', methods=['POST', 'OPTIONS'])
def api_cadastrar_usuario():
    if request.method == 'OPTIONS': 
        return '', 204
    dados = request.json
    email = dados.get("email").strip()
    nome = dados.get("nome").strip()
    senha = dados.get("senha")

    if Usuario.query.filter_by(email=email).first():
        return jsonify({"success": False, "message": "Este e-mail já está cadastrado!"}), 400

    try:
        novo_usuario = Usuario(email=email, nome=nome, senha=senha)
        db.session.add(novo_usuario)
        db.session.commit()
        return jsonify({"success": True, "message": "Usuário cadastrado com sucesso!"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/usuario/login', methods=['POST', 'OPTIONS'])
def api_login_usuario():
    if request.method == 'OPTIONS': 
        return '', 204
    dados = request.json
    email = dados.get("email").strip()
    senha = dados.get("senha")

    user = Usuario.query.filter_by(email=email).first()
    
    if not user or user.senha != senha:
        return jsonify({"success": False, "message": "E-mail ou senha incorretos!"}), 401

    return jsonify({"success": True, "user": user.to_dict()}), 200

@app.route('/api/usuario/<email>', methods=['GET', 'OPTIONS'])
def obter_perfil(email):
    if request.method == 'OPTIONS': 
        return '', 204
        
    if email == "admin":
        return jsonify({
            "id": 0,
            "email": "admin",
            "nome": "Administrador do Sistema",
            "foto_url": "img/DFoods.jpg",
            "endereco": "Painel de Controle Central",
            "telefone": "Acesso Restrito",
            "saldo": 99999.0
        }), 200
        
    user = Usuario.query.filter_by(email=email).first()
    if not user:
        return jsonify({"success": False, "message": "Usuário inexistente na base SQLite."}), 404
            
    return jsonify(user.to_dict())

@app.route('/api/usuario/atualizar', methods=['POST', 'OPTIONS'])
def atualizar_perfil():
    if request.method == 'OPTIONS': 
        return '', 204
    dados = request.json
    email = dados.get("email")
    
    if email == "admin":
        return jsonify({"success": True, "user": dados}), 200
        
    user = Usuario.query.filter_by(email=email).first()
    if not user: 
        return jsonify({"error": "Usuário não encontrado"}), 404
    
    user.nome = dados.get("nome", user.nome)
    user.foto_url = dados.get("foto_url", user.foto_url)
    user.endereco = dados.get("endereco", user.endereco)
    user.telefone = dados.get("telefone", user.telefone)
    
    db.session.commit()
    return jsonify({"success": True, "user": user.to_dict()})

@app.route('/api/usuario/pagar', methods=['POST', 'OPTIONS'])
def debitar_saldo_usuario():
    if request.method == 'OPTIONS': 
        return '', 204
    dados = request.json
    email = dados.get("email")
    valor_cobrado = float(dados.get("valor", 0))

    user = Usuario.query.filter_by(email=email).first()
    if not user:
        return jsonify({"success": False, "message": "Usuário não encontrado."}), 404

    if user.saldo < valor_cobrado:
        return jsonify({"success": False, "message": "Saldo insuficiente."}), 400

    try:
        user.saldo -= valor_cobrado
        db.session.commit()
        return jsonify({"success": True, "novo_saldo": user.saldo})
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": "Erro interno."}), 500

# --- ROTAS PÚBLICAS GERAIS ---

@app.route('/api/restaurantes', methods=['GET', 'OPTIONS'])
def get_restaurantes():
    if request.method == 'OPTIONS': 
        return '', 204
    return jsonify([r.to_dict() for r in Restaurante.query.all()])

@app.route('/api/menu/<restaurante_nome>', methods=['GET', 'OPTIONS'])
def get_menu(restaurante_nome):
    if request.method == 'OPTIONS': 
        return '', 204
    itens = ItemMenu.query.filter_by(restaurante_nome=restaurante_nome).all()
    return jsonify([i.to_dict() for i in itens])

@app.route('/api/cupom/<codigo>', methods=['GET', 'OPTIONS'])
def validar_cupom(codigo):
    if request.method == 'OPTIONS': 
        return '', 204
    cupom = Cupom.query.filter_by(codigo=codigo.upper()).first()
    return jsonify({"desconto": cupom.valor if cupom else 0.0})

@app.route('/api/restaurante/avaliar', methods=['POST', 'OPTIONS'])
def avaliar_restaurante():
    if request.method == 'OPTIONS': 
        return '', 204
    
    dados = request.json
    nome_res = dados.get("restaurante")
    nota_dada = float(dados.get("nota"))

    res = Restaurante.query.filter_by(nome=nome_res).first()
    if not res:
        return jsonify({"success": False, "message": "Loja não encontrada."}), 404

    nova_aval = Avaliacao(restaurante_nome=nome_res, nota=nota_dada)
    db.session.add(nova_aval)
    db.session.commit()

    todas_avaliacoes = Avaliacao.query.filter_by(restaurante_nome=nome_res).all()
    
    soma_notas = (res.nota * 3) + sum(a.nota for a in todas_avaliacoes)
    total_votos = 3 + len(todas_avaliacoes)
    
    nova_media = soma_notas / total_votos
    res.nota = round(nova_media, 1)
    
    db.session.commit()

    return jsonify({"success": True, "nova_nota": res.nota})

# --- ROTAS EXCLUSIVAS DO ADMINISTRADOR ---

@app.route('/api/admin/login', methods=['POST', 'OPTIONS'])
def admin_login():
    if request.method == 'OPTIONS': 
        return '', 204
    dados = request.json
    if dados.get("usuario") == "admin" and dados.get("senha") == "1234": 
        return jsonify({"success": True}), 200
    return jsonify({"success": False, "message": "Login inválido"}), 401

@app.route('/api/admin/usuarios', methods=['GET', 'OPTIONS'])
def admin_listar_usuarios():
    if request.method == 'OPTIONS': 
        return '', 204
    lista_users = Usuario.query.all()
    return jsonify([u.to_dict() for u in lista_users])

@app.route('/api/admin/usuario/deletar/<int:user_id>', methods=['DELETE', 'OPTIONS'])
def admin_deletar_usuario(user_id):
    if request.method == 'OPTIONS': 
        return '', 204
    user = Usuario.query.get(user_id)
    if not user:
        return jsonify({"success": False}), 404
    try:
        db.session.delete(user)
        db.session.commit()
        return jsonify({"success": True})
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False}), 400

@app.route('/api/admin/usuario/saldo', methods=['POST', 'OPTIONS'])
def admin_alterar_saldo():
    if request.method == 'OPTIONS': 
        return '', 204
    dados = request.json
    user_id = dados.get("id")
    novo_saldo = dados.get("saldo")
    user = Usuario.query.get(user_id)
    if not user:
        return jsonify({"success": False}), 404
    try:
        user.saldo = float(novo_saldo)
        db.session.commit()
        return jsonify({"success": True})
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False}), 400

@app.route('/api/admin/cadastrar-restaurante', methods=['POST', 'OPTIONS'])
def cadastrar_restaurante():
    if request.method == 'OPTIONS': 
        return '', 204
    novo = request.json
    try:
        res = Restaurante(nome=novo['nome'], categoria=novo['categoria'], taxa=float(novo['taxa']), foto_url=novo.get('foto_url'))
        db.session.add(res)
        db.session.commit()
        return jsonify({"success": True}), 201
    except Exception as e: 
        return jsonify({"success": False}), 400

@app.route('/api/admin/adicionar-item', methods=['POST', 'OPTIONS'])
def adicionar_item():
    if request.method == 'OPTIONS': 
        return '', 204
    dados = request.json
    if Restaurante.query.filter_by(nome=dados['restaurante']).first():
        item = ItemMenu(nome=dados['nome'], preco=float(dados['preco']), restaurante_nome=dados['restaurante'], foto_url=dados.get('foto_url'))
        db.session.add(item)
        db.session.commit()
        return jsonify({"success": True}), 201
    return jsonify({"error": "Não encontrado"}), 404

@app.route('/api/admin/cadastrar-cupom', methods=['POST', 'OPTIONS'])
def cadastrar_cupom():
    if request.method == 'OPTIONS': 
        return '', 204
    dados = request.json
    codigo = dados['codigo'].upper()
    existente = Cupom.query.filter_by(codigo=codigo).first()
    if existente: 
        existente.valor = float(dados['valor'])
    else: 
        db.session.add(Cupom(codigo=codigo, valor=float(dados['valor'])))
    db.session.commit()
    return jsonify({"success": True})

@app.route('/api/admin/restaurante/atualizar', methods=['POST', 'OPTIONS'])
def admin_atualizar_restaurante():
    if request.method == 'OPTIONS': 
        return '', 204
    dados = request.json
    res_id = dados.get("id")
    res = Restaurante.query.get(res_id)
    if not res: 
        return jsonify({"success": False, "message": "Não encontrado"}), 404
    
    velho_nome = res.nome
    novo_nome = dados.get("nome", res.nome).strip()
    
    if velho_nome != novo_nome:
        if Restaurante.query.filter_by(nome=novo_nome).first():
            return jsonify({"success": False, "message": "Esse nome já está em uso"}), 400
        itens_vinculados = ItemMenu.query.filter_by(restaurante_nome=velho_nome).all()
        for item in itens_vinculados:
            item.restaurante_nome = novo_nome

    res.nome = novo_nome
    res.categoria = dados.get("categoria", res.categoria)
    res.taxa = float(dados.get("taxa", res.taxa))
    
    if "nota" in dados:
        res.nota = float(dados.get("nota"))
        
    res.foto_url = dados.get("foto_url", res.foto_url)
    
    db.session.commit()
    return jsonify({"success": True})

@app.route('/api/admin/restaurante/deletar/<int:res_id>', methods=['DELETE', 'OPTIONS'])
def admin_deletar_restaurante(res_id):
    if request.method == 'OPTIONS': 
        return '', 204
    res = Restaurante.query.get(res_id)
    if not res: 
        return jsonify({"success": False}), 404
    try:
        db.session.delete(res)
        db.session.commit()
        return jsonify({"success": True})
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False}), 400

@app.route('/api/admin/item/atualizar', methods=['POST', 'OPTIONS'])
def admin_atualizar_item():
    if request.method == 'OPTIONS': 
        return '', 204
    dados = request.json
    item_id = dados.get("id")
    item = ItemMenu.query.get(item_id)
    if not item: 
        return jsonify({"success": False}), 404
    
    item.nome = dados.get("nome", item.nome)
    item.preco = float(dados.get("preco", item.preco))
    item.foto_url = dados.get("foto_url", item.foto_url)
    
    db.session.commit()
    return jsonify({"success": True})

@app.route('/api/admin/item/deletar/<int:item_id>', methods=['DELETE', 'OPTIONS'])
def admin_deletar_item(item_id):
    if request.method == 'OPTIONS': 
        return '', 204
    item = ItemMenu.query.get(item_id)
    if not item: 
        return jsonify({"success": False}), 404
    try:
        db.session.delete(item)
        db.session.commit()
        return jsonify({"success": True})
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5001)
