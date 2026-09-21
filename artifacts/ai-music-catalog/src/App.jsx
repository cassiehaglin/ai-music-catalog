import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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

function Home({ onNavigate, playback }) {
  return (
    <main className={`welcome app-page ${playback.currentSong ? 'app-page--playing' : ''}`} data-testid="home-screen">
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
      <MiniPlayer playback={playback} />
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

function Library({ onNavigate, successMessage, songs, artists, albums, isLoading, loadError, onRetry, playback }) {
  const [activeTab, setActiveTab] = useState('Songs');

  function handleSongAction(song) {
    const isCurrent = playback.currentSong?.id === song.id;
    if (isCurrent && playback.isPlaying) {
      playback.onTogglePlay();
      return;
    }

    playback.onPlaySong(song);
  }

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
    <main className={`welcome app-page ${playback.currentSong ? 'app-page--playing' : ''}`} data-testid="library-screen">
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
                const isCurrent = playback.currentSong?.id === song.id;
                return (
                  <article
                    className={`song-row ${isCurrent ? 'song-row--current' : ''}`}
                    data-testid={`row-song-${song.id}`}
                    key={song.id}
                    onClick={() => handleSongAction(song)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        handleSongAction(song);
                      }
                    }}
                    role="button"
                    tabIndex="0"
                    aria-label={`${playback.isPlaying && isCurrent ? 'Pause' : 'Play'} ${song.title}`}
                  >
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
                    <button
                      className="song-row__play"
                      data-testid={`button-play-song-${song.id}`}
                      type="button"
                      aria-label={playback.isPlaying && isCurrent ? `Pause ${song.title}` : `Play ${song.title}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        handleSongAction(song);
                      }}
                    >
                      {playback.isPlaying && isCurrent ? 'Pause' : 'Play'}
                    </button>
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
                    onClick={() => (loadError ? onRetry() : onNavigate('import'))}
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
      <MiniPlayer playback={playback} />
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

function ImportMusic({ onNavigate, onContinue, playback }) {
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
    <main className={`welcome app-page ${playback.currentSong ? 'app-page--playing' : ''}`} data-testid="import-screen">
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
      <MiniPlayer playback={playback} />
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

function MetadataSetup({ file, onNavigate, onSaved, playback }) {
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
    <main className={`welcome app-page ${playback.currentSong ? 'app-page--playing' : ''}`} data-testid="metadata-screen">
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
      <MiniPlayer playback={playback} />
      <BottomNav screen="import" onNavigate={onNavigate} />
    </main>
  );
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '0:00';
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainingSeconds}`;
}

function MiniPlayer({ playback }) {
  if (!playback.currentSong) {
    return null;
  }

  const song = playback.currentSong;
  return (
    <section className="mini-player" aria-label="Current song" data-testid="mini-player">
      <button
        className="mini-player__body"
        data-testid="button-open-now-playing"
        type="button"
        onClick={playback.onOpenNowPlaying}
        aria-label={`Open now playing for ${song.title}`}
      >
        <ArtworkImage
          artwork={playback.currentAlbum?.artwork}
          alt={playback.currentAlbum ? `${playback.currentAlbum.title} artwork` : 'No album artwork'}
          className="mini-player__artwork"
        />
        <span className="mini-player__copy">
          <strong>{song.title}</strong>
          <span>{playback.currentArtist || 'Unknown artist'}</span>
        </span>
      </button>
      <button
        className="mini-player__control"
        data-testid="button-mini-play-pause"
        type="button"
        onClick={playback.onTogglePlay}
        aria-label={playback.isPlaying ? `Pause ${song.title}` : `Play ${song.title}`}
      >
        <span aria-hidden="true">{playback.isPlaying ? '||' : '>'}</span>
      </button>
      <div className="mini-player__skips" aria-label="Mini player track controls">
        <button
          className="mini-player__skip"
          data-testid="button-mini-previous"
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            playback.onPrevious();
          }}
          aria-label="Previous song"
        >
          |&lt;
        </button>
        <button
          className="mini-player__skip"
          data-testid="button-mini-next"
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            playback.onNext();
          }}
          aria-label="Next song"
        >
          &gt;|
        </button>
      </div>
      <div className="mini-player__progress" aria-hidden="true">
        <span style={{ transform: `scaleX(${playback.duration ? playback.currentTime / playback.duration : 0})` }} />
      </div>
    </section>
  );
}

function PlayerButton({ label, testId, onClick, children, primary = false }) {
  return (
    <button
      className={`player-control ${primary ? 'player-control--primary' : ''}`}
      data-testid={testId}
      type="button"
      onClick={onClick}
      aria-label={label}
    >
      {children}
    </button>
  );
}

function NowPlaying({ playback, onClose, onNavigate }) {
  const song = playback.currentSong;
  if (!song) {
    return null;
  }

  return (
    <main className="welcome app-page now-playing" data-testid="now-playing-screen">
      <div className="welcome__shell">
        <div className="now-playing__topline">
          <button className="now-playing__close" data-testid="button-close-now-playing" type="button" onClick={onClose}>
            <span aria-hidden="true">←</span>
            <span>Back</span>
          </button>
          <span className="page-kicker">Now playing</span>
          <span className="now-playing__status">{playback.isPlaying ? 'Listening' : 'Paused'}</span>
        </div>
        <div className="now-playing__content">
          <ArtworkImage
            artwork={playback.currentAlbum?.artwork}
            alt={playback.currentAlbum ? `${playback.currentAlbum.title} artwork` : 'No album artwork'}
            className="now-playing__artwork"
          />
          <div className="now-playing__details">
            <p className="page-kicker">Current track</p>
            <h1 className="now-playing__title" data-testid="text-now-playing-title">{song.title}</h1>
            <p className="now-playing__artist" data-testid="text-now-playing-artist">{playback.currentArtist || 'Unknown artist'}</p>
            {playback.currentAlbum?.title ? (
              <p className="now-playing__album" data-testid="text-now-playing-album">{playback.currentAlbum.title}</p>
            ) : null}
          </div>

          <div className="now-playing__timeline">
            <input
              className="player-range"
              data-testid="input-now-playing-progress"
              type="range"
              min="0"
              max={playback.duration || 0}
              step="0.1"
              value={Math.min(playback.currentTime, playback.duration || 0)}
              onChange={(event) => playback.onSeek(Number(event.target.value))}
              aria-label="Seek through song"
              disabled={!playback.duration}
            />
            <div className="now-playing__time">
              <span>{formatTime(playback.currentTime)}</span>
              <span>{formatTime(playback.duration)}</span>
            </div>
          </div>

          {playback.error ? <p className="player-error" role="alert" data-testid="status-audio-error">{playback.error}</p> : null}

          <div className="now-playing__controls" aria-label="Playback controls">
            <PlayerButton label="Previous song" testId="button-previous-song" onClick={playback.onPrevious}>|&lt;</PlayerButton>
            <PlayerButton
              label={playback.isPlaying ? 'Pause song' : 'Play song'}
              testId="button-now-playing-play-pause"
              onClick={playback.onTogglePlay}
              primary
            >
              {playback.isPlaying ? '||' : '>'}
            </PlayerButton>
            <PlayerButton label="Next song" testId="button-next-song" onClick={playback.onNext}>&gt;|</PlayerButton>
          </div>
          <button className="favorite-button" data-testid="button-favorite-song" type="button" onClick={playback.onFavorite}>
            <span aria-hidden="true">{playback.isFavorite ? '★' : '☆'}</span>
            {playback.isFavorite ? 'Favorited for this session' : 'Favorite'}
          </button>
        </div>
      </div>
      <BottomNav screen={playback.previousScreen} onNavigate={onNavigate} />
    </main>
  );
}

function App() {
  const [screen, setScreen] = useState('home');
  const [previousScreen, setPreviousScreen] = useState('home');
  const [selectedFile, setSelectedFile] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [songs, setSongs] = useState([]);
  const [artists, setArtists] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [libraryLoading, setLibraryLoading] = useState(true);
  const [libraryError, setLibraryError] = useState('');
  const [currentSongId, setCurrentSongId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackError, setPlaybackError] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const audioRef = useRef(null);
  const audioUrlRef = useRef('');
  const artworkUrlRef = useRef('');
  const currentSongIdRef = useRef(null);
  const songsRef = useRef([]);
  const callbacksRef = useRef({});

  const loadLibrary = useCallback(async () => {
    setLibraryLoading(true);
    setLibraryError('');
    try {
      const [storedSongs, storedArtists, storedAlbums] = await Promise.all([
        db.songs.orderBy('createdAt').reverse().toArray(),
        db.artists.orderBy('createdAt').toArray(),
        db.albums.orderBy('createdAt').toArray(),
      ]);
      setSongs(storedSongs);
      setArtists(storedArtists);
      setAlbums(storedAlbums);
    } catch {
      setLibraryError('Your library could not be loaded. Try opening it again.');
    } finally {
      setLibraryLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLibrary();
  }, [loadLibrary]);

  useEffect(() => {
    songsRef.current = songs;
  }, [songs]);

  useEffect(() => {
    setIsFavorite(false);
  }, [currentSongId]);

  const currentSong = useMemo(
    () => songs.find((song) => song.id === currentSongId) || null,
    [songs, currentSongId],
  );
  const artistMap = useMemo(() => new Map(artists.map((artist) => [artist.id, artist.name])), [artists]);
  const albumMap = useMemo(() => new Map(albums.map((album) => [album.id, album])), [albums]);
  const currentArtist = currentSong ? artistMap.get(currentSong.artistId) || 'Unknown artist' : '';
  const currentAlbum = currentSong?.albumId ? albumMap.get(currentSong.albumId) || null : null;

  const cleanupAudioUrl = useCallback(() => {
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = '';
    }
  }, []);

  const stopAndKeepLoaded = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      setIsPlaying(false);
    }
  }, []);

  const playSong = useCallback(async (song) => {
    const audio = audioRef.current;
    if (!audio || !song) {
      return;
    }

    if (currentSongIdRef.current === song.id && audio.src) {
      setPlaybackError('');
      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        setPlaybackError('Audio file unavailable.');
        setIsPlaying(false);
      }
      return;
    }

    setPlaybackError('');
    setIsPlaying(false);
    audio.pause();
    cleanupAudioUrl();
    let storedSong = song;
    try {
      if (!storedSong.audioFile) {
        storedSong = await db.songs.get(song.id);
      }
    } catch {
      currentSongIdRef.current = song.id;
      setCurrentSongId(song.id);
      setPlaybackError('Audio file unavailable.');
      return;
    }
    const audioFile = storedSong?.audioFile;
    currentSongIdRef.current = song.id;
    setCurrentSongId(song.id);
    setCurrentTime(0);
    setDuration(0);
    if (!audioFile || !(audioFile instanceof Blob)) {
      audio.removeAttribute('src');
      setPlaybackError('Audio file unavailable.');
      return;
    }

    try {
      audioUrlRef.current = URL.createObjectURL(audioFile);
      audio.src = audioUrlRef.current;
      audio.load();
      await audio.play();
      setIsPlaying(true);
    } catch {
      setPlaybackError('Audio file unavailable.');
      setIsPlaying(false);
    }
  }, [cleanupAudioUrl]);

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !currentSong) {
      return;
    }
    if (audio.paused) {
      try {
        await audio.play();
        setPlaybackError('');
        setIsPlaying(true);
      } catch {
        setPlaybackError('Audio file unavailable.');
        setIsPlaying(false);
      }
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }, [currentSong]);

  const playAdjacent = useCallback((direction) => {
    const orderedSongs = songsRef.current;
    const index = orderedSongs.findIndex((song) => song.id === currentSongIdRef.current);
    if (index < 0 || orderedSongs.length === 0) {
      return;
    }
    const nextIndex = direction === 'next' ? index + 1 : index - 1;
    if (nextIndex >= 0 && nextIndex < orderedSongs.length) {
      playSong(orderedSongs[nextIndex]);
    } else if (direction === 'next') {
      stopAndKeepLoaded();
    }
  }, [playSong, stopAndKeepLoaded]);

  const seek = useCallback((value) => {
    if (audioRef.current && Number.isFinite(value)) {
      audioRef.current.currentTime = value;
      setCurrentTime(value);
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return undefined;
    }

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime || 0);
    const handleLoadedMetadata = () => setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleError = () => {
      setIsPlaying(false);
      setPlaybackError('Audio file unavailable.');
    };
    const handleEnded = () => {
      const orderedSongs = songsRef.current;
      const index = orderedSongs.findIndex((song) => song.id === currentSongIdRef.current);
      if (index >= 0 && index < orderedSongs.length - 1) {
        playSong(orderedSongs[index + 1]);
      } else {
        setIsPlaying(false);
        setCurrentTime(audio.duration || 0);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);
    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [playSong]);

  useEffect(() => {
    callbacksRef.current = {
      play: () => {
        if (currentSong && audioRef.current) {
          audioRef.current.play().catch(() => setPlaybackError('Audio file unavailable.'));
        }
      },
      pause: () => stopAndKeepLoaded(),
      previous: () => playAdjacent('previous'),
      next: () => playAdjacent('next'),
      seekto: (details) => details.seekTime !== undefined && seek(details.seekTime),
    };
  }, [currentSong, playAdjacent, seek, stopAndKeepLoaded, togglePlay]);

  useEffect(() => {
    if (!('mediaSession' in navigator) || typeof window.MediaMetadata === 'undefined') {
      return undefined;
    }
    const mediaSession = navigator.mediaSession;
    const artwork = currentAlbum?.artwork;
    let temporaryArtworkUrl = '';
    if (artwork instanceof Blob) {
      temporaryArtworkUrl = URL.createObjectURL(artwork);
      artworkUrlRef.current = temporaryArtworkUrl;
    }
    try {
      mediaSession.metadata = currentSong
        ? new window.MediaMetadata({
          title: currentSong.title,
          artist: currentArtist,
          album: currentAlbum?.title || '',
          artwork: temporaryArtworkUrl ? [{ src: temporaryArtworkUrl, type: artwork.type }] : [],
        })
        : null;
    } catch {
      mediaSession.metadata = null;
    }
    return () => {
      if (temporaryArtworkUrl) {
        URL.revokeObjectURL(temporaryArtworkUrl);
        if (artworkUrlRef.current === temporaryArtworkUrl) {
          artworkUrlRef.current = '';
        }
      }
    };
  }, [currentAlbum, currentArtist, currentSong]);

  useEffect(() => {
    if (!('mediaSession' in navigator)) {
      return undefined;
    }
    const mediaSession = navigator.mediaSession;
    const actions = {
      play: () => callbacksRef.current.play?.(),
      pause: () => callbacksRef.current.pause?.(),
      previoustrack: () => callbacksRef.current.previous?.(),
      nexttrack: () => callbacksRef.current.next?.(),
      seekto: (details) => callbacksRef.current.seekto?.(details),
    };
    Object.entries(actions).forEach(([action, handler]) => {
      try {
        mediaSession.setActionHandler(action, handler);
      } catch {
        // Browsers can expose Media Session but omit individual actions.
      }
    });
    return () => {
      Object.keys(actions).forEach((action) => {
        try {
          mediaSession.setActionHandler(action, null);
        } catch {
          // Ignore unsupported cleanup actions.
        }
      });
    };
  }, []);

  useEffect(() => () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute('src');
    }
    cleanupAudioUrl();
    if (artworkUrlRef.current) {
      URL.revokeObjectURL(artworkUrlRef.current);
      artworkUrlRef.current = '';
    }
  }, [cleanupAudioUrl]);

  useEffect(() => {
    if (!successMessage) {
      return undefined;
    }
    const timeout = window.setTimeout(() => setSuccessMessage(''), 4200);
    return () => window.clearTimeout(timeout);
  }, [successMessage]);

  const playback = {
    currentSong,
    currentArtist,
    currentAlbum,
    isPlaying,
    currentTime,
    duration,
    error: playbackError,
    isFavorite,
    previousScreen,
    onPlaySong: playSong,
    onTogglePlay: togglePlay,
    onPrevious: () => playAdjacent('previous'),
    onNext: () => playAdjacent('next'),
    onSeek: seek,
    onFavorite: () => setIsFavorite((value) => !value),
    onOpenNowPlaying: () => {
      setPreviousScreen(screen === 'now-playing' ? 'home' : screen);
      setScreen('now-playing');
    },
  };

  function navigate(nextScreen) {
    if (nextScreen === 'import') {
      setSuccessMessage('');
    }
    setScreen(nextScreen);
  }

  function handleSaved() {
    setSelectedFile(null);
    setSuccessMessage('Song added to your library.');
    setScreen('library');
    loadLibrary();
  }

  let page;
  if (screen === 'library') {
    page = (
      <Library
        onNavigate={navigate}
        successMessage={successMessage}
        songs={songs}
        artists={artists}
        albums={albums}
        isLoading={libraryLoading}
        loadError={libraryError}
        onRetry={loadLibrary}
        playback={playback}
      />
    );
  } else if (screen === 'import' && selectedFile) {
    page = (
      <MetadataSetup
        file={selectedFile}
        onNavigate={(nextScreen) => {
          setSelectedFile(null);
          navigate(nextScreen);
        }}
        onSaved={handleSaved}
        playback={playback}
      />
    );
  } else if (screen === 'import') {
    page = (
      <ImportMusic
        onNavigate={navigate}
        onContinue={(file) => {
          setSelectedFile(file);
          setScreen('import');
        }}
        playback={playback}
      />
    );
  } else if (screen === 'now-playing') {
    page = <NowPlaying playback={playback} onClose={() => setScreen(previousScreen)} onNavigate={navigate} />;
  } else {
    page = <Home onNavigate={navigate} playback={playback} />;
  }

  return (
    <>
      <audio ref={audioRef} preload="metadata" />
      {page}
    </>
  );
}

export default App;