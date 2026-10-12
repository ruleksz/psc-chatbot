import Navbar from '../Layout/Navbar.jsx'

function ChatHeader({ isSidebarOpen, onToggleSidebar }) {
  return (
    <Navbar
      title="PSC Chatbot"
      subtitle="Asisten percakapan"
      status="Backend belum terhubung"
      isSidebarOpen={isSidebarOpen}
      onToggleSidebar={onToggleSidebar}
    />
  )
}

export default ChatHeader
