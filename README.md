## ⚠️ Important

- Jangan commit `.env`
- Jangan memasukkan API key ke frontend
- Jangan langsung push ke `main`
- Setiap fitur menggunakan branch sendiri
- Selalu pull `develop` sebelum mulai bekerja
- Semua fitur harus melalui review sebelum masuk `main`

---

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

### Prerequisites
- Node.js v16+
- MySQL/MariaDB running locally
- Groq API Key (dari https://console.groq.com)

### Quick Start (Recommended)

#### Option 1: Using Batch Script (Windows)
```bash
# Dari root folder project
start-all.bat
```
Script ini akan otomatis membuka 2 terminal untuk backend dan frontend.

#### Option 2: Manual Setup - Separate Terminals

**Terminal 1 - Backend:**
```bash
cd service
npm install
npm run dev
```
Backend akan berjalan di: `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd client
npm install
npm run dev
```
Frontend akan berjalan di: `http://localhost:5173`

### Configuration

#### 1. Setup Backend (.env)
```bash
cd service
cp .env.example .env
```

Edit `service/.env`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=psc_chatbot

PORT=5000
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=openai/gpt-oss-20b
```

#### 2. Setup Frontend (.env)
```bash
cd client
cp .env.example .env
```

Edit `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

#### 3. Setup Database
```bash
# Import SQL file ke MySQL
mysql -u root -p psc_chatbot < service/src/database/psc_chatbot.sql

# Insert demo user (opsional)
mysql -u root -p psc_chatbot -e "INSERT INTO users (username, email, password_hash) VALUES ('demo', 'demo@example.com', 'demo_password');"
```

### Access Application

Buka browser: `http://localhost:5173`

---

## 📚 Documentation

Untuk informasi lengkap tentang integrasi, lihat:
- [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) - Setup lengkap dan troubleshooting
- [INTEGRATION_CHECKLIST.md](./INTEGRATION_CHECKLIST.md) - Checklist dan progress tracking

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

## 🚧 Status

**In Development**
