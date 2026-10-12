function ChatMessage({ message }) {
  const isUser = message.role === 'user'
  const usage = message.usage

  return (
    <article
      className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
      aria-label={isUser ? 'Pesan Anda' : 'Pesan chatbot'}
    >
      {!isUser && (
        <div
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-semibold text-sky-700"
          aria-hidden="true"
        >
          P
        </div>
      )}

      <div className={`max-w-[min(85%,42rem)] ${isUser ? 'order-first' : ''}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
            isUser
              ? 'rounded-br-md bg-sky-700 text-white'
              : 'rounded-bl-md border border-slate-200 bg-white text-slate-800'
          }`}
        >
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>

        {usage && !isUser && (
          <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 px-1 text-xs text-slate-500">
            {usage.inputTokens != null && (
              <div className="flex gap-1">
                <dt>Token input</dt>
                <dd className="font-medium text-slate-700">
                  {usage.inputTokens}
                </dd>
              </div>
            )}
            {usage.outputTokens != null && (
              <div className="flex gap-1">
                <dt>Token output</dt>
                <dd className="font-medium text-slate-700">
                  {usage.outputTokens}
                </dd>
              </div>
            )}
            {usage.totalTokens != null && (
              <div className="flex gap-1">
                <dt>Total</dt>
                <dd className="font-medium text-slate-700">
                  {usage.totalTokens}
                </dd>
              </div>
            )}
          </dl>
        )}
      </div>

      {isUser && (
        <div
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700"
          aria-hidden="true"
        >
          A
        </div>
      )}
    </article>
  )
}

export default ChatMessage
