import Navbar from '../Layout/Navbar.jsx'

function ChatHeader({ isSidebarOpen, onToggleSidebar }) {
  return (
    <Navbar
      title="PSC Chatbot"
      subtitle="Asisten percakapan"
      isSidebarOpen={isSidebarOpen}
      onToggleSidebar={onToggleSidebar}
    />
  )
}

export default ChatHeader
