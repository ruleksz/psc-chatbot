import { useState } from 'react'
import ChatWindow from './components/Chat/ChatWindow.jsx'
import Sidebar from './components/Sidebar/Sidebar.jsx'
import Layout from './components/Layout/Layout.jsx'

function createConversation() {
  return {
    id: crypto.randomUUID(),
    title: 'Percakapan baru',
    messages: [],
    updatedAt: Date.now(),
  }
}

function App() {
  const [conversations, setConversations] = useState(() => [
    createConversation(),
  ])
  const [activeConversationId, setActiveConversationId] = useState(
    () => conversations[0].id,
  )
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const activeConversation = conversations.find(
    (conversation) => conversation.id === activeConversationId,
  )

  function handleSendMessage(content) {
    const message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
    }

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
          messages: [...conversation.messages, message],
          updatedAt: Date.now(),
        }
      }),
    )
  }

  function handleNewConversation() {
    const conversation = createConversation()
    setConversations((currentConversations) => [
      conversation,
      ...currentConversations,
    ])
    setActiveConversationId(conversation.id)
    setIsSidebarOpen(false)
  }

  function handleSelectConversation(conversationId) {
    setActiveConversationId(conversationId)
    setIsSidebarOpen(false)
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
        />
      }
    >
      <ChatWindow
        messages={activeConversation?.messages ?? []}
        onSendMessage={handleSendMessage}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((isOpen) => !isOpen)}
      />
    </Layout>
  )
}

export default App
