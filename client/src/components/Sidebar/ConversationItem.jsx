function ConversationItem({
  conversation,
  isActive,
  onSelect,
}) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(conversation.id)}
        aria-current={isActive ? 'page' : undefined}
        className={`flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 ${
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
    </li>
  )
}

export default ConversationItem
