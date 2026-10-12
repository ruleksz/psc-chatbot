import Button from '../Common/Button.jsx'

function NewChatButton({ onClick }) {
  return (
    <Button
      onClick={onClick}
      variant="sidebar"
      className="w-full py-3"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        fill="none"
        className="size-4"
      >
        <path
          d="M10 4v12M4 10h12"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
      Percakapan baru
    </Button>
  )
}

export default NewChatButton
