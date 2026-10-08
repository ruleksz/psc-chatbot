# 🤖 PSC Chatbot

Web-based chatbot built with **React + Vite**.

PSC Chatbot adalah aplikasi chatbot berbasis web yang memungkinkan pengguna melakukan percakapan dengan chatbot melalui interface yang sederhana dan responsive.

---

## 👥 Team

| Member        | Role                    |
| ------------- | ----------------------- |
| **rulekz**    | Project Lead & Backend  |
| **Yatama1**   | Frontend Developer      |
| **Blazee667** | Chatbot Logic & Testing |

---

## 🛠️ Tech Stack

- React
- Vite
- JavaScript
- Node.js
- Express.js
- PostgreSQL
- AI API

> Backend digunakan untuk mengamankan API key dan menghubungkan frontend dengan AI API.

---

## 📁 Project Structure

```text
psc-chatbot/
│
├── client/                         # FRONTEND
│   │
│   ├── public/
│   │   └── assets/
│   │       ├── logo.png
│   │       └── favicon.png
│   │
│   ├── src/
│   │   │
│   │   ├── assets/
│   │   │   ├── images/
│   │   │   └── icons/
│   │   │
│   │   ├── components/
│   │   │   ├── Chat/
│   │   │   │   ├── ChatWindow.jsx
│   │   │   │   ├── ChatMessage.jsx
│   │   │   │   ├── ChatInput.jsx
│   │   │   │   ├── ChatHeader.jsx
│   │   │   │   └── TypingIndicator.jsx
│   │   │   │
│   │   │   ├── Sidebar/
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── ConversationItem.jsx
│   │   │   │   └── NewChatButton.jsx
│   │   │   │
│   │   │   ├── Common/
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Loading.jsx
│   │   │   │   └── ErrorMessage.jsx
│   │   │   │
│   │   │   └── Layout/
│   │   │       ├── Navbar.jsx
│   │   │       └── Layout.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Chat.jsx
│   │   │   ├── Login.jsx
│   │   │   └── NotFound.jsx
│   │   │
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── chatService.js
│   │   │   └── conversationService.js
│   │   │
│   │   ├── hooks/
│   │   │   ├── useChat.js
│   │   │   └── useConversation.js
│   │   │
│   │   ├── context/
│   │   │   └── ChatContext.jsx
│   │   │
│   │   ├── utils/
│   │   │   ├── formatMessage.js
│   │   │   └── formatDate.js
│   │   │
│   │   ├── constants/
│   │   │   └── config.js
│   │   │
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── .env
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
│
├── service/                      # BACKEND
│   │
│   ├── src/
│   │   │
│   │   ├── routes/
│   │   │   ├── chat.routes.js
│   │   │   ├── conversation.routes.js
│   │   │   └── index.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── chat.controller.js
│   │   │   └── conversation.controller.js
│   │   │
│   │   ├── services/
│   │   │   ├── ai.service.js
│   │   │   ├── chat.service.js
│   │   │   └── conversation.service.js
│   │   │
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   └── env.js
│   │   │
│   │   ├── middleware/
│   │   │   ├── error.middleware.js
│   │   │   └── rateLimit.middleware.js
│   │   │
│   │   ├── utils/
│   │   │   └── response.js
│   │   │
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── .env
│   ├── .env.example
│   └── package.json
│
│
├── .gitignore
├── README.md
└── package.json
```

---

## 🔄 Project Flow

```text
User
 ↓
Frontend (React + Vite)
 ↓
Backend (Express)
 ↓
AI API
 ↓
Backend
 ↓
Frontend
 ↓
User
```

---

## 🚀 How to Run

### 1. Clone Repository

```bash
git clone https://github.com/ruleksz/psc-chatbot.git
cd psc-chatbot
```

### 2. Run Frontend

```bash
cd client
npm install
npm run dev
```

### 3. Run Backend

Buka terminal baru:

```bash
cd service
npm install
npm run dev
```

---

## 🌿 Git Workflow

Jangan langsung mengerjakan fitur di `main`.

Gunakan:

```text
main
 ↓
develop
 ↓
feature/*
```

Contoh:

```bash
git checkout develop
git pull origin develop

git checkout -b feature/frontend
git checkout -b feature/backend
git checkout -b feature/chatbot
```

Setelah selesai:

```bash
git add .
git commit -m "feat: add chat interface"
git push origin feature/chatbot
```

Kemudian buat **Pull Request** ke `develop`.

---

## 📌 Task Flow

Gunakan GitHub Projects:

```text
Backlog
   ↓
Ready
   ↓
In Progress
   ↓
In Review
   ↓
Done
```

---

## 🎯 Main Features

- [ ] Chat dengan chatbot
- [ ] Chat history
- [ ] New conversation
- [ ] AI integration
- [ ] Responsive interface
- [ ] Error handling
- [ ] Loading state

---

## 📅 Roadmap

### Phase 1 — Setup

- [ ] Setup repository
- [ ] Setup React + Vite
- [ ] Setup backend
- [ ] Setup project structure

### Phase 2 — Chat

- [ ] Chat interface
- [ ] Send message
- [ ] Receive response
- [ ] Connect frontend & backend

### Phase 3 — AI

- [ ] AI API integration
- [ ] Prompt
- [ ] Error handling

### Phase 4 — Final

- [ ] Testing
- [ ] Bug fixing
- [ ] Responsive design
- [ ] Deployment

---

## ⚠️ Important

- Jangan commit `.env`
- Jangan memasukkan API key ke frontend
- Jangan langsung push ke `main`
- Setiap fitur menggunakan branch sendiri
- Selalu pull `develop` sebelum mulai bekerja
- Semua fitur harus melalui review sebelum masuk `main`

---

## 🚧 Status

**In Development**
