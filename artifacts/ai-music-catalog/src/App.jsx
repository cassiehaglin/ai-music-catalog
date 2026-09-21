function BrandMark() {
  return (
    <div className="brand" aria-label="AI Music Catalog">
      <span className="brand__mark" aria-hidden="true">
        <span className="brand__bar" />
        <span className="brand__bar" />
        <span className="brand__bar" />
      </span>
      <span className="brand__wordmark">AI Music Catalog</span>
    </div>
  );
}

function SignalMark() {
  return (
    <div className="signal" aria-hidden="true">
      <div className="signal__wave">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

function ActionButton({ children, index, variant }) {
  return (
    <button
      className={`action-button action-button--${variant}`}
      data-testid={`button-${children.toLowerCase().replace(/\s+/g, '-')}`}
      type="button"
    >
      <span className="action-button__label">
        <span className="action-button__index">{index}</span>
        <span>{children}</span>
      </span>
      <span className="action-button__arrow" aria-hidden="true">
        ↗
      </span>
    </button>
  );
}

function App() {
  return (
    <main className="welcome" data-testid="welcome-screen">
      <div className="welcome__shell">
        <BrandMark />

        <section className="welcome__content" aria-labelledby="welcome-title">
          <SignalMark />
          <p className="eyebrow" data-testid="text-welcome-eyebrow">
            Your private music workspace
          </p>
          <h1 className="welcome__title" id="welcome-title" data-testid="text-welcome-title">
            Your music. <em>Your catalog.</em>
          </h1>
          <p className="welcome__subtitle" data-testid="text-welcome-subtitle">
            Turn your AI generations into a real organized music library.
          </p>

          <div className="welcome__actions" aria-label="Catalog actions">
            <ActionButton index="01" variant="primary">
              Import Music
            </ActionButton>
            <ActionButton index="02" variant="secondary">
              Browse Library
            </ActionButton>
          </div>
        </section>

        <footer className="welcome__footer">
          <span>Make room for the next idea</span>
          <span>Private by design</span>
        </footer>
      </div>
    </main>
  );
}

export default App;