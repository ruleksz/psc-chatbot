import Button from './Button.jsx'

function ErrorMessage({ title = 'Terjadi kesalahan', message, onRetry }) {
  return (
    <div
      className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900 sm:flex-row sm:items-center sm:justify-between"
      role="alert"
    >
      <div>
        <h2 className="font-semibold">{title}</h2>
        {message && <p className="mt-1 text-red-800">{message}</p>}
      </div>
      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onRetry}
          className="self-start border-red-300 text-red-800 hover:bg-red-100 sm:self-auto"
        >
          Coba lagi
        </Button>
      )}
    </div>
  )
}

export default ErrorMessage
