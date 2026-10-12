import { useState } from 'react'

function ChatInput({ onSendMessage }) {
  const [message, setMessage] = useState('')

  function submitMessage(event) {
    event.preventDefault()
    const content = message.trim()

    if (!content) {
      return
    }

    onSendMessage(content)
    setMessage('')
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      event.currentTarget.form?.requestSubmit()
    }
  }

  return (
    <form
      onSubmit={submitMessage}
      className="rounded-2xl border border-slate-300 bg-white p-2 shadow-sm transition focus-within:border-sky-500 focus-within:ring-4 focus-within:ring-sky-100"
    >
      <label htmlFor="chat-message" className="sr-only">
        Tulis pesan
      </label>
      <textarea
        id="chat-message"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Tulis pesan di sini..."
        rows={2}
        className="max-h-40 min-h-12 w-full resize-y bg-transparent px-3 py-2 text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400"
      />
      <div className="flex items-center justify-between gap-3 px-2 pb-1">
        <p className="text-xs text-slate-500">Enter untuk kirim · Shift+Enter untuk baris baru</p>
        <button
          type="submit"
          disabled={!message.trim()}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-sky-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Kirim
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="none"
            className="size-4"
          >
            <path
              d="M3.5 10h12m0 0-5-5m5 5-5 5"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </form>
  )
}

export default ChatInput
