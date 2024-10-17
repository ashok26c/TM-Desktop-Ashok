const DB_NAME = 'TimeLapseVideo';
const DB_VERSION = 1;
const STORE_NAME = 'videoLink';
let db = null;
export const initDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
        request.onsuccess = (event) => {
            db = event.target.result;
            resolve(db);
        };
        request.onerror = (event) => {
            reject(new Error('Error opening IndexedDB: ' + event.target.errorCode));
        };
    });
};
const ensureDB = async () => {
    if (!db) {
        await initDB();
    }
    return db;
};
export const saveBlobToIndexedDB = async (blob, id) => {
    const db = await ensureDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    if (blob) {
        store.put({ id, blob });
    } else {
        store.delete(id);
    }
    return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = (event) => reject(new Error('Error saving blob to IndexedDB: ' + event.target.errorCode));
    });
};
export const getBlobFromIndexedDB = async (id) => {
    const db = await ensureDB();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);
    return new Promise((resolve, reject) => {
        request.onsuccess = (event) => {
            const result = event.target.result;
            resolve(result ? result.blob : null);
        };
        request.onerror = (event) => reject(new Error('Error retrieving blob from IndexedDB: ' + event.target.errorCode));
    });
};