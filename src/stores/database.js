let db = null;

const openDB = async () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ocdb', 1);

    request.addEventListener('upgradeneeded', (e) => {
      const database = e.target.result;

      if (!database.objectStoreNames.contains('preferences')) {
        database.createObjectStore('preferences');
      }

      db = database;
      db.addEventListener('close', closeListener);
      resolve(db);
    });

    request.addEventListener('success', (e) => {
      db = e.target.result;
      db.addEventListener('close', closeListener);
      resolve(db);
    });

    request.addEventListener('error', (e) => {
      reject(e.target.error);
    });

    request.addEventListener('blocked', (e) => {
      reject(e.target.error);
    });
  });
};
const closeDB = () => {
  db?.removeEventListener('close', closeListener);
  db?.close();
};
const closeListener = (event) => {
  /* dispatch({ type: 'database/status', payload: null });
  dispatch({
    type: 'database/error',
    payload: errors.DB_CLOSED({ details: event.target?.error?.message ?? 'Not Available' })
  }); */
};

const getSingleton = async (name) => {
  return new Promise((resolve, reject) => {
    if (!db) resolve(null);
    else {
      let request;
      try {
        request = db.transaction(name).objectStore(name).get('default');
        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
      } catch (error) {
        reject(error);
      }
    }
  });
};
const updateSingleton = async (name, value) => {
  return new Promise((resolve, reject) => {
    try {
      const request = db.transaction(name, 'readwrite').objectStore(name).put(value, 'default');
      request.onsuccess = () => resolve();
      request.onerror = (event) => reject(event.target.error);
    } catch (error) {
      reject(error);
    }
  });
};

export { openDB, closeDB, getSingleton, updateSingleton };