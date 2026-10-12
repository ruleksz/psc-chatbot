import ConversationItem from './ConversationItem.jsx'
import NewChatButton from './NewChatButton.jsx'

function Sidebar({
  conversations,
  activeConversationId,
  isOpen,
  onClose,
  onNewConversation,
  onSelectConversation,
}) {
  return (
    <>
      {isOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-slate-950/50 md:hidden"
          onClick={onClose}
          aria-label="Tutup daftar percakapan"
        />
      )}

      <aside
        id="conversation-sidebar"
        aria-label="Daftar percakapan"
        className={`fixed inset-y-0 left-0 z-40 flex w-72 shrink-0 flex-col border-r border-slate-800 bg-slate-900 px-4 py-5 text-white transition-transform duration-200 md:static md:z-auto md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-7 flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-sky-500 text-base font-bold text-white">
              P
            </div>
            <span className="text-sm font-semibold tracking-wide">
              PSC Chatbot
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-white md:hidden"
            aria-label="Tutup sidebar"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              fill="none"
              className="size-5"
            >
              <path
                d="m5 5 10 10M15 5 5 15"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <NewChatButton onClick={onNewConversation} />

        <div className="mt-8 flex min-h-0 flex-1 flex-col">
          <h2 className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Riwayat percakapan
          </h2>
          {conversations.length > 0 ? (
            <nav className="min-h-0 flex-1 overflow-y-auto" aria-label="Riwayat">
              <ul className="space-y-1">
                {conversations.map((conversation) => (
                  <ConversationItem
                    key={conversation.id}
                    conversation={conversation}
                    isActive={conversation.id === activeConversationId}
                    onSelect={onSelectConversation}
                  />
                ))}
              </ul>
            </nav>
          ) : (
            <p className="px-2 text-sm leading-6 text-slate-400">
              Percakapan yang dibuat akan muncul di sini.
            </p>
          )}
        </div>

        <div className="mt-5 border-t border-slate-800 px-2 pt-4 text-xs leading-5 text-slate-400">
          Riwayat tersimpan sementara di sesi ini.
        </div>
      </aside>
    </>
  )
}

export default Sidebar
