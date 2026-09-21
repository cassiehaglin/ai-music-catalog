import { useEffect, useMemo, useState } from 'react';

import db, { createId } from './db.js';

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

function ArtworkImage({ artwork, alt, className = '' }) {
  const [source, setSource] = useState('');

  useEffect(() => {
    if (!artwork) {
      setSource('');
      return undefined;
    }

    if (typeof artwork === 'string') {
      setSource(artwork);
      return undefined;
    }

    const objectUrl = URL.createObjectURL(artwork);
    setSource(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [artwork]);

  if (!source) {
    return (
      <div className={`artwork-placeholder ${className}`.trim()} aria-label="No album artwork">
        <span className="artwork-placeholder__note" aria-hidden="true">
          <span />
          <span />
        </span>
      </div>
    );
  }

  return <img className={className} src={source} alt={alt} />;
}

function Library({ onNavigate, successMessage }) {
  const [activeTab, setActiveTab] = useState('Songs');
  const [songs, setSongs] = useState([]);
  const [artists, setArtists] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let isCurrent = true;

    async function loadLibrary() {
      setIsLoading(true);
      setLoadError('');

      try {
        const [storedSongs, storedArtists, storedAlbums] = await Promise.all([
          db.songs.orderBy('createdAt').reverse().toArray(),
          db.artists.orderBy('createdAt').toArray(),
          db.albums.orderBy('createdAt').toArray(),
        ]);

        if (isCurrent) {
          setSongs(storedSongs);
          setArtists(storedArtists);
          setAlbums(storedAlbums);
        }
      } catch {
        if (isCurrent) {
          setLoadError('Your library could not be loaded. Try opening it again.');
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    loadLibrary();
    return () => {
      isCurrent = false;
    };
  }, []);

  const artistMap = useMemo(
    () => new Map(artists.map((artist) => [artist.id, artist.name])),
    [artists],
  );
  const albumMap = useMemo(() => new Map(albums.map((album) => [album.id, album])), [albums]);
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

          {successMessage ? (
            <p className="library__success" data-testid="status-song-added" role="status">
              {successMessage}
            </p>
          ) : null}

          {activeTab === 'Songs' && !isLoading && !loadError && songs.length > 0 ? (
            <section className="song-list" aria-label="Songs in your library">
              {songs.map((song) => {
                const album = song.albumId ? albumMap.get(song.albumId) : null;
                return (
                  <article className="song-row" data-testid={`row-song-${song.id}`} key={song.id}>
                    <ArtworkImage
                      artwork={album?.artwork}
                      alt={album ? `${album.title} artwork` : 'Unsorted song'}
                      className="song-row__artwork"
                    />
                    <div className="song-row__details">
                      <strong data-testid={`text-song-title-${song.id}`}>{song.title}</strong>
                      <span data-testid={`text-song-artist-${song.id}`}>
                        {artistMap.get(song.artistId) || 'Unknown artist'}
                      </span>
                    </div>
                    <span className="song-row__album" data-testid={`text-song-album-${song.id}`}>
                      {album?.title || 'Unsorted'}
                    </span>
                  </article>
                );
              })}
            </section>
          ) : (
            <section className="library__empty" aria-live="polite" data-testid="library-empty-state">
              {isLoading ? (
                <div className="library-loading" aria-label="Loading library">
                  <span />
                  <span />
                  <span />
                </div>
              ) : (
                <>
                  <SignalMark className="empty-signal" />
                  <h2 className="empty-state__title">
                    {loadError || emptyMessages[activeTab]}
                  </h2>
                  <p className="empty-state__message">
                    {loadError
                      ? 'Your saved music is still safe locally. Try again from the Library tab.'
                      : 'Your imported music will appear here, ready to sort into a collection.'}
                  </p>
                  <button
                    className="action-button action-button--primary empty-state__action"
                    data-testid={loadError ? 'button-library-retry' : 'button-library-import'}
                    onClick={() => (loadError ? window.location.reload() : onNavigate('import'))}
                    type="button"
                  >
                    <span className="action-button__label">
                      <span className="action-button__index">01</span>
                      <span>{loadError ? 'Try Again' : 'Import Music'}</span>
                    </span>
                    <span className="action-button__arrow" aria-hidden="true">
                      ↗
                    </span>
                  </button>
                </>
              )}
            </section>
          )}
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

function isSupportedAudio(file) {
  if (!file || !/\.(mp3|wav)$/i.test(file.name)) {
    return false;
  }

  return !file.type || ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav'].includes(file.type);
}

function ImportMusic({ onNavigate, onContinue }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');

  function handleFileChange(event) {
    const file = event.target.files[0];
    setError('');

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!isSupportedAudio(file)) {
      setSelectedFile(null);
      setError('Please choose a valid MP3 or WAV file.');
      event.target.value = '';
      return;
    }

    setSelectedFile(file);
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

            {error ? (
              <p className="form-error" data-testid="error-file-type" role="alert">
                {error}
              </p>
            ) : null}

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
              disabled={!selectedFile}
              onClick={() => onContinue(selectedFile)}
              type="button"
            >
              {selectedFile ? 'Continue' : 'Metadata setup coming next'}
            </button>
          </section>
        </div>
      </div>
      <BottomNav screen="import" onNavigate={onNavigate} />
    </main>
  );
}

function MetadataField({ label, children, required = false }) {
  return (
    <label className="metadata-field">
      <span className="metadata-field__label">
        {label}
        {required ? <i>Required</i> : null}
      </span>
      {children}
    </label>
  );
}

function MetadataSetup({ file, onNavigate, onSaved }) {
  const [title, setTitle] = useState(file.name.replace(/\.[^/.]+$/, ''));
  const [artists, setArtists] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [artistChoice, setArtistChoice] = useState('');
  const [creatingArtist, setCreatingArtist] = useState(false);
  const [newArtistName, setNewArtistName] = useState('');
  const [albumChoice, setAlbumChoice] = useState('unsorted');
  const [albumTitle, setAlbumTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [year, setYear] = useState('');
  const [description, setDescription] = useState('');
  const [artwork, setArtwork] = useState(null);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let isCurrent = true;

    async function loadMetadata() {
      try {
        const [storedArtists, storedAlbums] = await Promise.all([
          db.artists.orderBy('name').toArray(),
          db.albums.orderBy('title').toArray(),
        ]);

        if (isCurrent) {
          setArtists(storedArtists);
          setAlbums(storedAlbums);
        }
      } catch {
        if (isCurrent) {
          setLoadError('Saved artists and albums could not be loaded.');
        }
      }
    }

    loadMetadata();
    return () => {
      isCurrent = false;
    };
  }, []);

  const selectedArtistId = creatingArtist ? '' : artistChoice;
  const availableAlbums = useMemo(
    () =>
      selectedArtistId
        ? albums.filter((album) => album.artistId === selectedArtistId)
        : [],
    [albums, selectedArtistId],
  );
  const selectedAlbum = albumChoice === 'unsorted'
    ? null
    : albumChoice === 'new'
      ? { title: albumTitle, artwork }
      : albums.find((album) => album.id === albumChoice) || null;

  function handleArtworkChange(event) {
    const nextArtwork = event.target.files[0];
    if (!nextArtwork) {
      setArtwork(null);
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(nextArtwork.type)) {
      setError('Album artwork must be a JPEG, PNG, or WEBP image.');
      event.target.value = '';
      return;
    }

    setError('');
    setArtwork(nextArtwork);
  }

  function handleArtistModeChange(nextMode) {
    setError('');
    setCreatingArtist(nextMode);
    setArtistChoice('');
    setAlbumChoice('unsorted');
    if (!nextMode) {
      setNewArtistName('');
    }
  }

  async function handleSave(event) {
    event.preventDefault();
    setError('');

    if (!isSupportedAudio(file)) {
      setError('Please choose a valid MP3 or WAV file.');
      return;
    }

    if (!title.trim()) {
      setError('Add a title before saving this song.');
      return;
    }

    if (!creatingArtist && !artistChoice) {
      setError('Choose an artist or create a new one.');
      return;
    }

    if (creatingArtist && !newArtistName.trim()) {
      setError('Add an artist name before saving this song.');
      return;
    }

    if (albumChoice === 'new' && !albumTitle.trim()) {
      setError('Add an album title or choose Unsorted.');
      return;
    }

    setIsSaving(true);

    try {
      await db.transaction('rw', db.artists, db.albums, db.songs, async () => {
        let artistId = artistChoice;
        let artistName = artists.find((artist) => artist.id === artistChoice)?.name || '';

        if (creatingArtist) {
          artistName = newArtistName.trim();
          const normalizedName = artistName.toLocaleLowerCase();
          const matchingArtist = await db.artists
            .filter((artist) => artist.name.trim().toLocaleLowerCase() === normalizedName)
            .first();

          if (matchingArtist) {
            artistId = matchingArtist.id;
          } else {
            artistId = createId();
            await db.artists.add({
              id: artistId,
              name: artistName,
              createdAt: new Date().toISOString(),
            });
          }
        }

        let albumId = null;
        if (albumChoice === 'new') {
          albumId = createId();
          await db.albums.add({
            id: albumId,
            title: albumTitle.trim(),
            artistId,
            artwork: artwork || null,
            genre: genre.trim(),
            year: year.trim(),
            description: description.trim(),
            createdAt: new Date().toISOString(),
          });
        } else if (albumChoice !== 'unsorted') {
          albumId = albumChoice;
        }

        await db.songs.add({
          id: createId(),
          title: title.trim(),
          artistId,
          albumId,
          originalFileName: file.name,
          audioFile: file,
          mimeType: fileType(file),
          fileSize: file.size,
          duration: null,
          trackNumber: null,
          createdAt: new Date().toISOString(),
        });
      });

      onSaved();
    } catch {
      setError('The song could not be saved. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="welcome app-page" data-testid="metadata-screen">
      <div className="welcome__shell">
        <BrandMark />
        <div className="page-content metadata-page">
          <p className="page-kicker">One last detail</p>
          <h1 className="page-heading" data-testid="text-metadata-heading">
            Make <em>it yours</em>
          </h1>
          <p className="metadata-file-name" data-testid="text-metadata-filename">
            {file.name}
          </p>

          {loadError ? (
            <p className="form-error" data-testid="error-metadata-load" role="alert">
              {loadError}
            </p>
          ) : null}

          <form className="metadata-form" onSubmit={handleSave}>
            <section className="metadata-section" aria-labelledby="song-details-heading">
              <p className="metadata-section__eyebrow">01 / Song details</p>
              <h2 id="song-details-heading">Name the track</h2>
              <MetadataField label="Song title" required>
                <input
                  data-testid="input-song-title"
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Untitled generation"
                />
              </MetadataField>
            </section>

            <section className="metadata-section" aria-labelledby="artist-heading">
              <p className="metadata-section__eyebrow">02 / Artist</p>
              <h2 id="artist-heading">Who made it?</h2>
              {!creatingArtist ? (
                <MetadataField label="Artist" required>
                  <select
                    data-testid="select-artist"
                    value={artistChoice}
                    onChange={(event) => {
                      setArtistChoice(event.target.value);
                      setAlbumChoice('unsorted');
                    }}
                  >
                    <option value="">Choose an artist</option>
                    {artists.map((artist) => (
                      <option value={artist.id} key={artist.id}>
                        {artist.name}
                      </option>
                    ))}
                  </select>
                </MetadataField>
              ) : (
                <MetadataField label="Artist name" required>
                  <input
                    data-testid="input-new-artist"
                    type="text"
                    value={newArtistName}
                    onChange={(event) => setNewArtistName(event.target.value)}
                    placeholder="Artist name"
                    autoFocus
                  />
                </MetadataField>
              )}
              <button
                className="text-button"
                data-testid="button-toggle-artist"
                onClick={() => handleArtistModeChange(!creatingArtist)}
                type="button"
              >
                {creatingArtist ? 'Choose an existing artist' : 'Create New Artist'}
              </button>
            </section>

            <section className="metadata-section" aria-labelledby="album-heading">
              <p className="metadata-section__eyebrow">03 / Collection</p>
              <h2 id="album-heading">Where should this song go?</h2>
              <div className="album-options" role="radiogroup" aria-label="Song collection">
                <label className={`album-option ${albumChoice === 'unsorted' ? 'album-option--selected' : ''}`}>
                  <input
                    data-testid="radio-unsorted"
                    type="radio"
                    name="album-choice"
                    checked={albumChoice === 'unsorted'}
                    onChange={() => setAlbumChoice('unsorted')}
                  />
                  <span>
                    <strong>Unsorted</strong>
                    <small>Keep it in your songs for now.</small>
                  </span>
                </label>
                <label className={`album-option ${albumChoice !== 'unsorted' && albumChoice !== 'new' ? 'album-option--selected' : ''}`}>
                  <input
                    data-testid="radio-existing-album"
                    type="radio"
                    name="album-choice"
                    value={albumChoice !== 'unsorted' && albumChoice !== 'new' ? albumChoice : ''}
                    checked={albumChoice !== 'unsorted' && albumChoice !== 'new'}
                    onChange={() => setAlbumChoice(availableAlbums[0]?.id || 'existing')}
                    disabled={!selectedArtistId || availableAlbums.length === 0}
                  />
                  <span>
                    <strong>Add to Album</strong>
                    <small>{availableAlbums.length ? 'Choose an existing album below.' : 'Select an artist with albums.'}</small>
                  </span>
                </label>
              </div>

              {albumChoice !== 'unsorted' && albumChoice !== 'new' ? (
                <select
                  className="album-select"
                  data-testid="select-existing-album"
                  value={availableAlbums.some((album) => album.id === albumChoice) ? albumChoice : ''}
                  onChange={(event) => setAlbumChoice(event.target.value || 'unsorted')}
                >
                  <option value="">Choose an album</option>
                  {availableAlbums.map((album) => (
                    <option value={album.id} key={album.id}>
                      {album.title}
                    </option>
                  ))}
                </select>
              ) : null}

              <label className={`album-option ${albumChoice === 'new' ? 'album-option--selected' : ''}`}>
                <input
                  data-testid="radio-new-album"
                  type="radio"
                  name="album-choice"
                  checked={albumChoice === 'new'}
                  onChange={() => setAlbumChoice('new')}
                />
                <span>
                  <strong>Create New Album</strong>
                  <small>Start a new home for this sound.</small>
                </span>
              </label>

              {albumChoice === 'new' ? (
                <div className="new-album-fields">
                  <MetadataField label="Artist" required>
                    <input
                      data-testid="input-album-artist"
                      type="text"
                      value={
                        creatingArtist
                          ? newArtistName
                          : artists.find((artist) => artist.id === artistChoice)?.name || ''
                      }
                      placeholder="Choose an artist above"
                      readOnly
                    />
                  </MetadataField>
                  <MetadataField label="Album title" required>
                    <input
                      data-testid="input-album-title"
                      type="text"
                      value={albumTitle}
                      onChange={(event) => setAlbumTitle(event.target.value)}
                      placeholder="Album title"
                    />
                  </MetadataField>
                  <div className="metadata-fields-grid">
                    <MetadataField label="Genre">
                      <input
                        data-testid="input-album-genre"
                        type="text"
                        value={genre}
                        onChange={(event) => setGenre(event.target.value)}
                        placeholder="Ambient"
                      />
                    </MetadataField>
                    <MetadataField label="Year">
                      <input
                        data-testid="input-album-year"
                        type="text"
                        inputMode="numeric"
                        value={year}
                        onChange={(event) => setYear(event.target.value)}
                        placeholder="2025"
                      />
                    </MetadataField>
                  </div>
                  <MetadataField label="Description">
                    <textarea
                      data-testid="input-album-description"
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      placeholder="A note about this collection"
                      rows="3"
                    />
                  </MetadataField>
                  <MetadataField label="Album artwork">
                    <input
                      data-testid="input-album-artwork"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleArtworkChange}
                    />
                  </MetadataField>
                </div>
              ) : null}
            </section>

            <section className="metadata-preview" aria-label="Song preview">
              <ArtworkImage
                artwork={selectedAlbum?.artwork}
                alt="Album artwork preview"
                className="metadata-preview__artwork"
              />
              <div>
                <span className="metadata-preview__eyebrow">Preview</span>
                <strong data-testid="text-preview-title">{title || 'Untitled generation'}</strong>
                <span data-testid="text-preview-artist">
                  {creatingArtist ? newArtistName || 'Artist name' : artists.find((artist) => artist.id === artistChoice)?.name || 'Artist name'}
                </span>
                {selectedAlbum ? (
                  <span data-testid="text-preview-album">
                    {selectedAlbum.title || 'Album title'}
                  </span>
                ) : null}
              </div>
            </section>

            {error ? (
              <p className="form-error" data-testid="error-metadata-save" role="alert">
                {error}
              </p>
            ) : null}

            <button
              className="action-button action-button--primary metadata-save"
              data-testid="button-save-song"
              disabled={isSaving}
              type="submit"
            >
              <span className="action-button__label">
                <span className="action-button__index">04</span>
                <span>{isSaving ? 'Saving song…' : 'Save Song'}</span>
              </span>
              <span className="action-button__arrow" aria-hidden="true">
                ↗
              </span>
            </button>
          </form>
        </div>
      </div>
      <BottomNav screen="import" onNavigate={onNavigate} />
    </main>
  );
}

function App() {
  const [screen, setScreen] = useState('home');
  const [selectedFile, setSelectedFile] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  function openImport() {
    setSuccessMessage('');
    setScreen('import');
  }

  function handleSaved() {
    setSelectedFile(null);
    setSuccessMessage('Song added to your library.');
    setScreen('library');
  }

  useEffect(() => {
    if (!successMessage) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setSuccessMessage(''), 4200);
    return () => window.clearTimeout(timeout);
  }, [successMessage]);

  if (screen === 'library') {
    return <Library onNavigate={setScreen} successMessage={successMessage} />;
  }

  if (screen === 'import' && selectedFile) {
    return (
      <MetadataSetup
        file={selectedFile}
        onNavigate={(nextScreen) => {
          setSelectedFile(null);
          setScreen(nextScreen);
        }}
        onSaved={handleSaved}
      />
    );
  }

  if (screen === 'import') {
    return (
      <ImportMusic
        onNavigate={setScreen}
        onContinue={(file) => {
          setSelectedFile(file);
          setScreen('import');
        }}
      />
    );
  }

  return (
    <Home
      onNavigate={(nextScreen) => {
        if (nextScreen === 'import') {
          openImport();
        } else {
          setScreen(nextScreen);
        }
      }}
    />
  );
}

export default App;