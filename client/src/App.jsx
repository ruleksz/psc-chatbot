import { useState, useEffect } from 'react'
import ChatWindow from './components/Chat/ChatWindow.jsx'
import Sidebar from './components/Sidebar/Sidebar.jsx'
import Layout from './components/Layout/Layout.jsx'
import FirebaseLoginPage from './pages/FirebaseLoginPage.jsx'
import { sendMessage, getConversations, createConversation as createConversationAPI, getConversationMessages } from './services/api.js'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [conversations, setConversations] = useState([])
  const [activeConversationId, setActiveConversationId] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState(null)

  const activeConversation = conversations.find(
    (conversation) => conversation.id === activeConversationId,
  )

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken')
    const savedUser = localStorage.getItem('user')
    
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser))
        setIsAuthenticated(true)
        loadConversations()
      } catch (err) {
        console.error('Failed to restore session:', err)
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')
        setIsLoading(false)
      }
    } else {
      setIsLoading(false)
    }
  }, [])

  function handleLoginSuccess(userData) {
    setUser(userData)
    setIsAuthenticated(true)
    loadConversations()
  }

  function handleLogout() {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    setIsAuthenticated(false)
    setUser(null)
    setConversations([])
    setActiveConversationId(null)
  }

  async function loadConversations() {
    try {
      setIsLoading(true)
      setError(null)
      const response = await getConversations()
      if (response.success && response.data) {
        const formattedConversations = response.data.map((conv) => ({
          id: conv.id,
          title: conv.title,
          messages: [],
          updatedAt: new Date(conv.updated_at).getTime(),
        }))
        setConversations(formattedConversations)
        if (formattedConversations.length > 0) {
          setActiveConversationId(formattedConversations[0].id)
          // Load messages for first conversation
          await loadConversationMessages(formattedConversations[0].id)
        }
      }
    } catch (err) {
      console.error('Failed to load conversations:', err)
      setError('Gagal memuat percakapan. Pastikan server berjalan di http://localhost:5000')
    } finally {
      setIsLoading(false)
    }
  }

  async function loadConversationMessages(conversationId) {
    try {
      const response = await getConversationMessages(conversationId)
      if (response.success && response.data) {
        const formattedMessages = response.data.map((msg) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          sources: msg.sources ? (typeof msg.sources === 'string' ? JSON.parse(msg.sources) : msg.sources) : [],
        }))
        setConversations((currentConversations) =>
          currentConversations.map((conv) => 
            conv.id === conversationId 
              ? { ...conv, messages: formattedMessages }
              : conv
          )
        )
      }
    } catch (err) {
      console.error('Failed to load conversation messages:', err)
    }
  }

  async function handleSendMessage(content) {
    if (!activeConversationId) return

    try {
      setError(null)
      const userMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content,
      }

      // Add user message to UI
      setConversations((currentConversations) =>
        currentConversations.map((conversation) => {
          if (conversation.id !== activeConversationId) {
            return conversation
          }
          return {
            ...conversation,
            title:
              conversation.messages.length === 0
                ? content.slice(0, 36) + (content.length > 36 ? '...' : '')
                : conversation.title,
            messages: [...conversation.messages, userMessage],
            updatedAt: Date.now(),
          }
        }),
      )

      // Send to backend
      setIsTyping(true)
      const response = await sendMessage(content, activeConversationId)

      if (response.success) {
        const assistantMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: response.reply,
          sources: response.sources || [],
        }

        setConversations((currentConversations) =>
          currentConversations.map((conversation) => {
            if (conversation.id !== activeConversationId) {
              return conversation
            }
            return {
              ...conversation,
              messages: [...conversation.messages, assistantMessage],
              updatedAt: Date.now(),
            }
          }),
        )
      }
    } catch (err) {
      console.error('Failed to send message:', err)
      setError(err.message || 'Gagal mengirim pesan')
    } finally {
      setIsTyping(false)
    }
  }

  async function handleNewConversation() {
    try {
      setError(null)
      const response = await createConversationAPI('Percakapan Baru')
      if (response.success) {
        const newConversation = {
          id: response.conversation_id,
          title: response.title,
          messages: [],
          updatedAt: Date.now(),
        }
        setConversations((currentConversations) => [
          newConversation,
          ...currentConversations,
        ])
        setActiveConversationId(newConversation.id)
        setIsSidebarOpen(false)
      }
    } catch (err) {
      console.error('Failed to create conversation:', err)
      setError('Gagal membuat percakapan baru')
    }
  }

  function handleSelectConversation(conversationId) {
    setActiveConversationId(conversationId)
    setIsSidebarOpen(false)
    // Load messages for selected conversation
    loadConversationMessages(conversationId)
  }

  if (isLoading) {
    return (
      <Layout sidebar={<Sidebar conversations={[]} activeConversationId={null} isOpen={false} onClose={() => {}} onNewConversation={() => {}} onSelectConversation={() => {}} />}>
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="text-center">
            <div className="inline-flex size-12 animate-spin rounded-full border-4 border-slate-300 border-t-sky-700"></div>
            <p className="mt-4 text-slate-600">Memuat...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (!isAuthenticated) {
    return <FirebaseLoginPage onLoginSuccess={handleLoginSuccess} />
  }

  return (
    <Layout
      sidebar={
        <Sidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onNewConversation={handleNewConversation}
          onSelectConversation={handleSelectConversation}
          user={user}
          onLogout={handleLogout}
          error={error}
        />
      }
    >
      <ChatWindow
        messages={activeConversation?.messages ?? []}
        onSendMessage={handleSendMessage}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((isOpen) => !isOpen)}
        isTyping={isTyping}
        error={error}
      />
    </Layout>
  )
}

export default App
