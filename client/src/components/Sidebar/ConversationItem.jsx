function ConversationItem({
  conversation,
  isActive,
  onSelect,
  onDelete,
  isDeleting,
}) {
  return (
    <li className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onSelect(conversation.id)}
        aria-current={isActive ? 'page' : undefined}
        className={`flex min-w-0 flex-1 items-start gap-3 rounded-xl px-3 py-3 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 ${
          isActive
            ? 'bg-slate-800 text-white'
            : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
        }`}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="none"
          className="mt-0.5 size-4 shrink-0"
        >
          <path
            d="M3.5 5.5A2 2 0 0 1 5.5 3.5h9a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-5l-4.5 3v-3.3a2 2 0 0 1-1.5-1.7v-6Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
        <span className="min-w-0 flex-1 truncate text-sm">
          {conversation.title}
        </span>
      </button>
      <button
        type="button"
        onClick={() => onDelete(conversation.id)}
        disabled={isDeleting}
        aria-label={`Hapus percakapan ${conversation.title}`}
        title="Hapus percakapan"
        className="flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-950 hover:text-red-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400 disabled:cursor-wait disabled:opacity-50"
      >
        {isDeleting ? (
          <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="none"
            className="size-4"
          >
            <path
              d="M3.5 5.5h13m-11.5 0 .7 10.1a1 1 0 0 0 1 .9h6.6a1 1 0 0 0 1-.9l.7-10.1M8 5.5V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1.5m-3 3v5m3-5v5"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
    </li>
  )
}

export default ConversationItem
