import Dexie from 'dexie';

const db = new Dexie('aiMusicCatalog');

db.version(1).stores({
  artists: 'id, name, createdAt',
  albums: 'id, title, artistId, createdAt',
  songs: 'id, title, artistId, albumId, createdAt',
});

export function createId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default db;