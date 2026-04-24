# 🍔 DanielzinhoFoods

O DanielzinhoFoods é uma plataforma de delivery robusta e intuitiva, projetada para conectar clientes a restaurantes locais com agilidade. Focado em uma experiência de usuário fluida, o sistema permite navegação dinâmica por cardápios, gestão inteligente de carrinho e um painel administrativo completo.

## 🚀 Funcionalidades

### 👤 Para o Cliente
Autenticação: Sistema de login seguro com persistência local.
Exploração Dinâmica: Navegação por uma lista atualizada de restaurantes parceiros.
Cardápio em Tempo Real: Consulta de pratos e preços através de requisições via API.
Carrinho Inteligente: Gerenciamento de itens com cálculo automático de subtotal.
Sistema de Cupons: Aplicação e validação de descontos em tempo real.
Histórico de Pedidos: Acompanhamento detalhado de todas as compras realizadas.

### 🛠Para o Administrador
Painel Protegido: Acesso restrito via autenticação no servidor.
Gestão de Ecossistema: Cadastro de novas lojas e configuração de taxas de entrega.
Gestão de Menu: Inclusão e atualização de itens no catálogo de cada restaurante.
Marketing Estratégico: Criação e gerenciamento de cupons promocionais.

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
