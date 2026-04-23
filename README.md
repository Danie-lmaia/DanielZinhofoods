# 🍔 DanielzinhoFoods

DanielzinhoFoods é uma plataforma de delivery completa que conecta clientes a restaurantes locais de forma ágil e eficiente. O projeto oferece uma interface intuitiva, permitindo que os usuários realizem pedidos com facilidade, acompanhem suas entregas e descubram novas opções gastronômicas.

## 🚀 Funcionalidades

### 👤 Cliente
- **Autenticação**: Cadastro e login de usuários (armazenados localmente).
- **Exploração**: Listagem dinâmica de restaurantes parceiros.
- **Cardápio em Tempo Real**: Visualização de pratos e preços atualizados via API.
- **Carrinho Inteligente**: Adição/remoção de itens com cálculo automático.
- **Sistema de Cupons**: Aplicação de descontos validados pelo servidor.
- **Histórico**: Registro detalhado de pedidos realizados.

### 🛠 Administrador
- **Login Protegido**: Acesso restrito via servidor Python.
- **Gestão de Lojas**: Cadastro de novos restaurantes e taxas de entrega.
- **Gestão de Menu**: Inclusão de novos pratos em restaurantes existentes.
- **Marketing**: Criação de cupons de desconto personalizados.

## 🛠️ Tecnologias Utilizadas

- **Front-end**: HTML5, CSS3, JavaScript (ES6+, Fetch API).
- **Back-end**: Python 3 com Flask.
- **Segurança/Integração**: Flask-CORS para comunicação entre portas.
- **Armazenamento**: LocalStorage (dados do cliente) e Memória volátil (dados do servidor).

## 🔧 Como Configurar o Projeto

### 1. Pré-requisitos
Certifique-se de ter o **Python 3** instalado na sua máquina.

### 2. Instalação de Dependências
Abra o terminal na pasta do projeto e instale o Flask e o Flask-CORS:
```bash
pip install flask flask-cors
