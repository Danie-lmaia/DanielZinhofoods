# 🍔 DanielzinhoFood

O **DanielzinhoFood** é uma plataforma full-stack de delivery desenvolvida para oferecer uma experiência moderna, intuitiva e eficiente tanto para clientes quanto para administradores.

O sistema conecta usuários a restaurantes locais através de uma interface dinâmica, responsiva e altamente interativa, permitindo gerenciamento completo de pedidos, carrinho inteligente, sistema de descontos, administração de estabelecimentos e controle financeiro.

O projeto foi desenvolvido com foco em:

- experiência do usuário (UX);
- escalabilidade;
- organização de código;
- integração entre front-end e back-end;
- persistência de dados;
- arquitetura moderna para aplicações web.

---

# 📊 Evolução do Projeto

O DanielzinhoFood passou por uma grande evolução estrutural e funcional durante o desenvolvimento.

A primeira versão do sistema possuía funcionalidades essenciais como:

- autenticação de usuários;
- listagem de restaurantes;
- carrinho de compras;
- painel administrativo básico;
- sistema de cupons;
- histórico de pedidos.

Com as atualizações posteriores, o projeto recebeu melhorias significativas:

- integração com banco de dados SQLite;
- persistência utilizando SQLAlchemy;
- sistema avançado de fretes;
- desconto automático entre múltiplas lojas;
- upload de imagens;
- avaliações de restaurantes;
- gerenciamento financeiro de usuários;
- painel administrativo completo;
- melhorias visuais e responsividade;
- estrutura profissional de pastas e APIs.

Essa evolução transformou o projeto em uma aplicação muito mais robusta, organizada e próxima de plataformas reais de delivery.

---

# ⚖️ Comparativo entre as Versões

| Aspecto | Versão Inicial | Versão Atual |
|---|---|---|
| Persistência | Memória volátil | SQLite + SQLAlchemy |
| Interface Administrativa | Básica | Completa e responsiva |
| Upload de Imagens | Não possuía | Implementado |
| Sistema de Frete | Simples | Inteligente por loja |
| Sistema de Desconto | Apenas cupons | Cupons + desconto automático |
| Perfil de Usuário | Não possuía | Completo |
| Avaliações | Não possuía | Sistema implementado |
| Busca Dinâmica | Não possuía | Busca em tempo real |
| UX/UI | Básico | Moderno e responsivo |
| Organização | Simples | Estrutura profissional |

---

# 🚀 Funcionalidades

# 👤 Área do Cliente

## 🔐 Autenticação de Usuários
- Sistema de login persistente
- Sessão salva via LocalStorage
- Controle de autenticação no front-end

---

## 🏪 Exploração de Restaurantes
- Listagem dinâmica de lojas
- Busca em tempo real por nome ou categoria
- Exibição de imagens dos estabelecimentos

---

## 🍕 Cardápios Interativos
- Visualização dinâmica de pratos
- Fotos dos produtos
- Atualização em tempo real via API
- Exibição de preços e descrições

---

## 🛒 Carrinho Inteligente
- Adição e remoção de itens
- Atualização automática de quantidades
- Subtotal em tempo real
- Cálculo de frete por restaurante

---

## 🎟️ Sistema de Descontos
- Aplicação de cupons promocionais
- Validação automática de códigos
- Desconto automático de 30% para pedidos com múltiplos restaurantes

---

## 📦 Histórico de Pedidos
- Registro completo de compras
- Acompanhamento de pedidos concluídos
- Visualização detalhada dos pedidos anteriores

---

## ⭐ Sistema de Avaliações
- Avaliação individual por restaurante
- Feedback dos usuários

---

## 👤 Perfil do Usuário
- Alteração de foto de perfil
- Dados de contato
- Controle de saldo da carteira

---

# 🛠️ Área Administrativa

## 🔒 Painel Administrativo Protegido
- Acesso restrito via autenticação
- Controle administrativo seguro

---

## 🏪 Gestão de Restaurantes
- Cadastro de novas lojas
- Edição de estabelecimentos
- Remoção de lojas
- Configuração de taxas de entrega

---

## 🍔 Gestão de Cardápios
- Adição de novos pratos
- Atualização de produtos
- Upload de imagens
- Organização de menus

---

## 🎟️ Gestão de Cupons
- Criação de cupons promocionais
- Ativação e desativação de descontos
- Controle de campanhas promocionais

---

## 💰 Gestão Financeira
- Controle de saldo dos usuários
- Ajuste manual de carteiras
- Gerenciamento de contas

---

# 🛠️ Tecnologias Utilizadas

## 🔹 Front-end
- HTML5
- CSS3
- JavaScript (ES6+)
- Fetch API
- CSS Grid
- LocalStorage

---

## 🔹 Back-end
- Python 3
- Flask
- Flask-CORS
- Flask-SQLAlchemy

---

## 🔹 Banco de Dados
- SQLite

---

## 🔹 Upload e Armazenamento
- Sistema local de upload de imagens
- Armazenamento físico de fotos

---

# 🎨 Design e Experiência do Usuário

O projeto utiliza princípios modernos de UX/UI:

- ✅ Interface responsiva
- ✅ Layout em Grid
- ✅ Lightbox para imagens
- ✅ Feedback visual com Toasts
- ✅ Navegação fluida
- ✅ Organização visual moderna

---

# 📂 Estrutura do Projeto

```bash
DanielzinhoFood/
│
├── uploads/          # Imagens de lojas e pratos
├── css/              # Arquivos de estilização
├── js/               # Scripts e lógica do sistema
├── app.py            # Backend Flask
├── admin.html        # Painel administrativo
├── index.html        # Página principal
└── README.md
```

---

# ⚙️ Instalação e Configuração

## 📋 Pré-requisitos

Certifique-se de possuir:

- Python 3.x
- pip instalado

---

## 📦 Instalação das Dependências

```bash
pip install flask flask-cors flask-sqlalchemy
```

---

## ▶️ Executando o Projeto

```bash
python app.py
```

O sistema será iniciado na porta padrão:

```bash
http://localhost:5001
```

---

# 🧠 Arquitetura do Sistema

O projeto segue uma arquitetura baseada em:

- API REST com Flask
- Comunicação Front-end ↔ Back-end via Fetch API
- Persistência SQL com SQLAlchemy
- Gerenciamento de estado via LocalStorage

---

# 🔐 Segurança

- Controle de autenticação administrativa
- Comunicação segura entre portas utilizando Flask-CORS
- Validação de cupons e requisições no servidor

---

# 📝 Roadmap

## 🔄 Melhorias Futuras

- [ ] Implementação de autenticação JWT
- [ ] Sistema de categorias dinâmicas
- [ ] Logs avançados para administradores
- [ ] Integração com gateways de pagamento
- [ ] Sistema de rastreamento de pedidos
- [ ] Notificações em tempo real
- [ ] Dashboard analítico
- [ ] Sistema de favoritos

---

# 📈 Objetivo do Projeto

O DanielzinhoFood foi desenvolvido como um projeto de demonstração de habilidades em:

- desenvolvimento web full-stack;
- integração front-end e back-end;
- modelagem de banco de dados;
- arquitetura de sistemas;
- UX/UI;
- APIs REST;
- lógica de negócio aplicada.

---

# 🏆 Conclusão da Evolução

A evolução do DanielzinhoFood demonstra uma transição de um sistema simples de delivery para uma plataforma full-stack muito mais robusta e profissional.

O projeto evoluiu principalmente em:

- arquitetura backend;
- persistência de dados;
- experiência do usuário;
- organização estrutural;
- lógica de negócio;
- gerenciamento administrativo;
- design responsivo;
- escalabilidade.

Essa evolução evidencia crescimento técnico em desenvolvimento web moderno e integração completa entre front-end e back-end.

---

# 👨‍💻 Autor

Desenvolvido por **Odon, Daniel e Pedro**.

Projeto criado para fins de aprendizado, portfólio e evolução técnica no desenvolvimento de aplicações web modernas.
