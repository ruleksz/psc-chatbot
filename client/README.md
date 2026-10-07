## 📁 Struktur Project

psc-chatbot/
│
├── client/
│ ├── src/
│ │ ├── components/
│ │ │ ├── ChatWindow.jsx
│ │ │ ├── ChatMessage.jsx
│ │ │ ├── ChatInput.jsx
│ │ │ └── Sidebar.jsx
│ │ │
│ │ ├── services/
│ │ │ └── api.js
│ │ │
│ │ ├── hooks/
│ │ │
│ │ ├── App.jsx
│ │ └── main.jsx
│ │
│ └── package.json
│
├── service/
│ ├── src/
│ │ ├── routes/
│ │ ├── controllers/
│ │ ├── services/
│ │ └── config/
│ │
│ └── package.json
│
├── README.md
└── .gitignore

## 🏗️ Arsitektur Project

                 ┌─────────────────┐
                 │      USER       │
                 └────────┬────────┘
                          │
                          ▼
              ┌─────────────────────┐
              │   Vite + JavaScript │
              │      Frontend       │
              │     Yatama1         │
              └──────────┬──────────┘
                         │
                         │ HTTP Request
                         ▼
              ┌─────────────────────┐
              │      Backend        │
              │    rulekz           │
              └──────────┬──────────┘
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
       ┌─────────────┐       ┌─────────────┐
       │  Database   │       │   AI API    │
       │ PostgreSQL  │       │             │
       └─────────────┘       └─────────────┘
