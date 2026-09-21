import { useState } from 'react';

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

function SignalMark({ className = '' }) {
  return (
    <div className={`signal ${className}`.trim()} aria-hidden="true">
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

function ActionButton({ children, index, variant, onClick }) {
  return (
    <button
      className={`action-button action-button--${variant}`}
      data-testid={`button-${children.toLowerCase().replace(/\s+/g, '-')}`}
      onClick={onClick}
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

function BottomNav({ screen, onNavigate }) {
  const items = [
    { id: 'home', label: 'Home' },
    { id: 'library', label: 'Library' },
    { id: 'import', label: 'Import' },
  ];

  return (
    <nav className="bottom-nav" aria-label="Main navigation" data-testid="main-navigation">
      {items.map((item) => (
        <button
          className={`bottom-nav__item ${
            screen === item.id ? 'bottom-nav__item--active' : ''
          }`}
          data-testid={`nav-${item.id}`}
          key={item.id}
          onClick={() => onNavigate(item.id)}
          type="button"
          aria-current={screen === item.id ? 'page' : undefined}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}

function EmptyCollectionSection({ title, testId }) {
  return (
    <section className="collection-section" data-testid={testId}>
      <div>
        <h2 className="collection-section__heading">{title}</h2>
        <p className="collection-section__message">No songs yet. Import your first track.</p>
      </div>
      <span className="collection-section__count">Empty</span>
    </section>
  );
}

function Home({ onNavigate }) {
  return (
    <main className="welcome app-page" data-testid="home-screen">
      <div className="welcome__shell">
        <BrandMark />

        <div className="welcome__content home__content">
          <section className="home__intro" aria-labelledby="welcome-title">
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
              <ActionButton index="01" variant="primary" onClick={() => onNavigate('import')}>
                Import Music
              </ActionButton>
              <ActionButton index="02" variant="secondary" onClick={() => onNavigate('library')}>
                Browse Library
              </ActionButton>
            </div>
          </section>

          <div className="home__sections" aria-label="Library collections">
            <EmptyCollectionSection title="Recently Added" testId="section-recently-added" />
            <EmptyCollectionSection title="Albums" testId="section-albums" />
            <EmptyCollectionSection title="Playlists" testId="section-playlists" />
          </div>
        </div>

        <footer className="welcome__footer">
          <span>Make room for the next idea</span>
          <span>Private by design</span>
        </footer>
      </div>
      <BottomNav screen="home" onNavigate={onNavigate} />
    </main>
  );
}

function Library({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('Songs');
  const emptyMessages = {
    Songs: 'No songs in your library yet.',
    Albums: 'No albums in your library yet.',
    Artists: 'No artists in your library yet.',
    Playlists: 'No playlists in your library yet.',
  };
  const tabs = Object.keys(emptyMessages);

  return (
    <main className="welcome app-page" data-testid="library-screen">
      <div className="welcome__shell">
        <BrandMark />
        <div className="page-content">
          <p className="page-kicker">Your collection</p>
          <h1 className="page-heading" data-testid="text-library-heading">
            Your <em>Library</em>
          </h1>

          <div className="library__tabs" role="tablist" aria-label="Library categories">
            {tabs.map((tab) => (
              <button
                className={`library__tab ${activeTab === tab ? 'library__tab--active' : ''}`}
                data-testid={`tab-${tab.toLowerCase()}`}
                key={tab}
                onClick={() => setActiveTab(tab)}
                role="tab"
                type="button"
                aria-selected={activeTab === tab}
              >
                {tab}
              </button>
            ))}
          </div>

          <section className="library__empty" aria-live="polite" data-testid="library-empty-state">
            <SignalMark className="empty-signal" />
            <h2 className="empty-state__title">{emptyMessages[activeTab]}</h2>
            <p className="empty-state__message">
              Your imported music will appear here, ready to sort into a collection.
            </p>
            <button
              className="action-button action-button--primary empty-state__action"
              data-testid="button-library-import"
              onClick={() => onNavigate('import')}
              type="button"
            >
              <span className="action-button__label">
                <span className="action-button__index">01</span>
                <span>Import Music</span>
              </span>
              <span className="action-button__arrow" aria-hidden="true">
                ↗
              </span>
            </button>
          </section>
        </div>
      </div>
      <BottomNav screen="library" onNavigate={onNavigate} />
    </main>
  );
}

function formatFileSize(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const kilobytes = bytes / 1024;
  if (kilobytes < 1024) {
    return `${kilobytes.toFixed(1)} KB`;
  }

  return `${(kilobytes / 1024).toFixed(1)} MB`;
}

function fileType(file) {
  if (file.type) {
    return file.type;
  }

  return file.name.toLowerCase().endsWith('.wav') ? 'audio/wav' : 'audio/mpeg';
}

function ImportMusic({ onNavigate }) {
  const [selectedFile, setSelectedFile] = useState(null);

  function handleFileChange(event) {
    const file = event.target.files[0];
    if (!file) {
      setSelectedFile(null);
      return;
    }

    const isSupported = /\.(mp3|wav)$/i.test(file.name);
    setSelectedFile(isSupported ? file : null);
  }

  return (
    <main className="welcome app-page" data-testid="import-screen">
      <div className="welcome__shell">
        <BrandMark />
        <div className="page-content">
          <p className="page-kicker">Add to your workspace</p>
          <h1 className="page-heading" data-testid="text-import-heading">
            Import <em>Music</em>
          </h1>
          <p className="import__intro">
            Bring in a finished generation and keep the original file close at hand.
          </p>

          <section className="import__panel" aria-label="Music file import">
            <label className="file-picker" htmlFor="music-file" data-testid="file-picker">
              <span className="file-picker__inner">
                <span className="file-picker__mark" aria-hidden="true">
                  +
                </span>
                <span className="file-picker__title">Choose an MP3 or WAV file</span>
                <span className="file-picker__hint">Tap to browse your device</span>
              </span>
              <input
                id="music-file"
                data-testid="input-music-file"
                type="file"
                accept=".mp3,.wav,audio/mpeg,audio/wav"
                onChange={handleFileChange}
              />
            </label>

            {selectedFile ? (
              <div className="file-details" aria-live="polite" data-testid="selected-file">
                <span className="file-details__name" title={selectedFile.name}>
                  {selectedFile.name}
                </span>
                <div className="file-details__meta">
                  <span data-testid="text-file-type">{fileType(selectedFile)}</span>
                  <span data-testid="text-file-size">{formatFileSize(selectedFile.size)}</span>
                </div>
              </div>
            ) : null}

            <button
              className="import__continue"
              data-testid="button-continue-metadata"
              disabled
              type="button"
            >
              Metadata setup coming next
            </button>
          </section>
        </div>
      </div>
      <BottomNav screen="import" onNavigate={onNavigate} />
    </main>
  );
}

function App() {
  const [screen, setScreen] = useState('home');

  if (screen === 'library') {
    return <Library onNavigate={setScreen} />;
  }

  if (screen === 'import') {
    return <ImportMusic onNavigate={setScreen} />;
  }

  return <Home onNavigate={setScreen} />;
}

export default App;