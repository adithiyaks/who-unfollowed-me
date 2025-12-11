import '../App.css'
import { PrivacyBadge } from '../components/PrivacyBadge'
import { ResultsTabs } from '../components/ResultsTabs'
import { Uploader } from '../components/Uploader'
import { useFileProcessor } from '../hooks/useFileProcessor'

function App() {
  const processor = useFileProcessor()

  return (
    <div className="app-shell">
      <header className="navbar">
        <div className="nav-brand">
          <img src="/logo.svg" alt="NoFollowBack??" width="38" height="38" className="brand-logo" />
          <span className="brand-text">NoFollowBack??</span>
        </div>
        <nav className="nav-links">
          <a href="#analyze" className="nav-link">Analyze</a>
          <a href="#how-to-use" className="nav-link">How to Use</a>
        </nav>
      </header>

      <main className="main-content">
        <section className="hero" id="analyze">
          <h1 className="hero-title">
            See who <span className="highlight">unfollowed</span> you.
          </h1>
          <p className="hero-subtitle">
            Secure, private, and local. Your data never leaves your browser.
            <br />Upload your ZIP file to check your relationships.
          </p>
        </section>

        <section className="upload-section">
          <Uploader
            onFiles={processor.processFiles}
            status={processor.status}
            warnings={processor.warnings}
          />
        </section>

        {processor.error && <div className="error-banner">{processor.error}</div>}

        <section className="analyze-section">
          <PrivacyBadge compact />
        </section>

        {processor.status === 'ready' && processor.relationships && (
          <>
            <section className="stats-bar">
              <div className="stat-item">
                <span className="stat-value">{processor.followers.length}</span>
                <span className="stat-label">Followers</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{processor.following.length}</span>
                <span className="stat-label">Following</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{processor.relationships.dontFollowBack.length}</span>
                <span className="stat-label">Don't Follow Back</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{processor.relationships.fans.length}</span>
                <span className="stat-label">Fans</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{processor.relationships.mutuals.length}</span>
                <span className="stat-label">Mutuals</span>
              </div>
            </section>

            <section className="results-section">
              <ResultsTabs data={processor.relationships} status={processor.status} />
            </section>

            <div className="note-card">
              <span className="note-icon">ℹ️</span>
              <p className="note-text">
                <strong>Note:</strong> If any account page shows "Page not available", the account is probably deactivated or has blocked you.
              </p>
            </div>
          </>
        )}

        <section className="how-to-use" id="how-to-use">
          <h2>How to Use</h2>
          <ol className="steps-list">
            <li>
              <strong>Open Instagram Settings:</strong> Go to <em>Settings → Accounts Centre → Your information and permissions → Download or transfer information → Download to device</em>.
            </li>
            <li>
              <strong>Create your export:</strong> Select <em>Some of your information</em>, then in Customise, clear all except <strong>Connections</strong> (Followers and Following).
            </li>
            <li>
              <strong>Set format to JSON:</strong> Change the format from HTML to <strong>JSON</strong>, then click <em>Start Export</em>.
            </li>
            <li>
              <strong>Enter your password</strong> when prompted and wait for the email from Instagram (usually a few minutes).
            </li>
            <li>
              <strong>Download & upload:</strong> Download the ZIP from the email or Instagram, then upload it here. The app finds your data automatically.
            </li>
          </ol>
        </section>
      </main>

      <footer className="footer">
        <p>Your data never leaves your browser. No servers, no logins, no tracking.</p>
      </footer>
    </div>
  )
}

export default App
