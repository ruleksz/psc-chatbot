function Layout({ sidebar, children }) {
  return (
    <div className="flex h-dvh overflow-hidden bg-slate-50">
      {sidebar}
      {children}
    </div>
  )
}

export default Layout
