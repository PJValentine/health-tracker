import Navigation from './Navigation'

function Layout({ children, currentPage, setCurrentPage }) {
  return (
    <div className="layout">
      <header className="header">
        <h1>Health Tracker</h1>
      </header>
      <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="main-content">
        {children}
      </main>
      <footer className="footer">
        <p>&copy; 2026 Health Tracker. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default Layout
