export type StoredArtwork = {
  templateId: string;
  blob: Blob;
  width: number;
  height: number;
  updatedAt: number;
};

const DB_NAME = "pigmenta-studio";
const STORE_NAME = "artworks";
const DB_VERSION = 1;

function openArtworkDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "templateId" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getLocalArtwork(templateId: string) {
  const database = await openArtworkDb();
  return new Promise<StoredArtwork | undefined>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readonly");
    const request = transaction.objectStore(STORE_NAME).get(templateId);
    request.onsuccess = () => resolve(request.result as StoredArtwork | undefined);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => database.close();
  });
}

export async function putLocalArtwork(artwork: StoredArtwork) {
  const database = await openArtworkDb();
  return new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put(artwork);
    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function listLocalArtworkIds() {
  const database = await openArtworkDb();
  return new Promise<string[]>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readonly");
    const request = transaction.objectStore(STORE_NAME).getAllKeys();
    request.onsuccess = () => resolve(request.result.map(String));
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => database.close();
  });
}

export async function removeLocalArtwork(templateId: string) {
  const database = await openArtworkDb();
  return new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).delete(templateId);
    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => reject(transaction.error);
  });
}

export function canvasToPng(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Could not encode canvas"));
    }, "image/png");
  });
}
