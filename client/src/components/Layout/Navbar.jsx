import Button from '../Common/Button.jsx'

function Navbar({ title, subtitle, status, isSidebarOpen, onToggleSidebar }) {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4 sm:px-8">
      <div className="flex min-w-0 items-center gap-3">
        {onToggleSidebar && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            aria-label="Buka daftar percakapan"
            aria-controls="conversation-sidebar"
            aria-expanded={isSidebarOpen}
            className="md:hidden"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              className="size-5"
            >
              <path
                d="M4 6h16M4 12h16M4 18h16"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </Button>
        )}
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-lg font-bold text-sky-700">
          P
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold text-slate-900">
            {title}
          </h1>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>

      {status && (
        <div className="ml-3 flex shrink-0 items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800">
          <span className="size-2 rounded-full bg-amber-500" aria-hidden="true" />
          <span>{status}</span>
        </div>
      )}
    </header>
  )
}

export default Navbar
