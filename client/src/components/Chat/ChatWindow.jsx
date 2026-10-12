import ChatHeader from './ChatHeader.jsx'
import ChatInput from './ChatInput.jsx'
import ChatMessage from './ChatMessage.jsx'
import TypingIndicator from './TypingIndicator.jsx'

function ChatWindow({
  messages,
  onSendMessage,
  onToggleSidebar,
  isSidebarOpen,
  isTyping = false,
  error = null,
}) {
  return (
    <main className="flex min-h-screen min-w-0 flex-1 flex-col bg-slate-50 text-slate-900">
      <ChatHeader
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={onToggleSidebar}
      />

      <section
        className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 sm:px-8"
        aria-label="Percakapan"
      >
        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
            <p className="font-semibold">Error:</p>
            <p>{error}</p>
          </div>
        )}

        <div
          className="flex flex-1 flex-col gap-6 overflow-y-auto py-8"
          aria-live="polite"
          aria-relevant="additions text"
        >
          {messages.length === 0 ? (
            <div className="m-auto max-w-lg py-12 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-sky-100 text-2xl font-bold text-sky-700">
                P
              </div>
              <h2 className="mt-5 text-xl font-semibold tracking-tight text-slate-900">
                Mulai percakapan
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Ketik pesan pada kolom di bawah untuk memulai. Pesan akan dikirim ke chatbot dan disimpan dalam database.
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))
          )}
          {isTyping && <TypingIndicator />}
        </div>

        <div className="sticky bottom-0 bg-slate-50 pb-5 pt-3">
          <ChatInput onSendMessage={onSendMessage} isDisabled={isTyping} />
          <p className="mt-3 text-center text-xs text-slate-500">
            Powered by Groq API • Data tersimpan di database
          </p>
        </div>
      </section>
    </main>
  )
}

export default ChatWindow
