function Layout({ sidebar, children }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {sidebar}
      {children}
    </div>
  )
}

export default Layout
