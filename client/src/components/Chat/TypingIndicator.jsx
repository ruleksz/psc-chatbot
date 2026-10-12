function TypingIndicator() {
  return (
    <div
      className="flex items-center gap-3"
      role="status"
      aria-label="Chatbot sedang mengetik"
    >
      <div
        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-semibold text-sky-700"
        aria-hidden="true"
      >
        P
      </div>
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-4">
        <span className="size-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
        <span className="size-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
        <span className="size-2 animate-bounce rounded-full bg-slate-400" />
      </div>
    </div>
  )
}

export default TypingIndicator
