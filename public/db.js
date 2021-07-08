let database;

const req = indexedDB.open("budget", 1);

req.onupgradeneeded = (event) => {
    const database = event.target.res
    database.createObjectStore("creating", { autoIncrement: true });
};

req.onsuccess = (event) => {
    database = event.target.res;
    if (navigator.onLine) {
        searchDataBase();
    }
};


saveRecord = (rec) => {
    const transaction = database.transaction("creating", "readwrite");
    const storage = transaction.objectStore("creating");
    storage.add(rec);
}


searchDataBase = () => {
    const transaction = database.transaction("creating", "readonly");
    const storage = transaction.objectStore("creating");
    const getAll = storage.getAll();

    getAll.onsuccess = () => {
        if (getAll.res.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.res),
                headers:
                {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })
                .then((res) => res.json())
                .then(() => {
                    const transaction = database.transaction("creating", "readwrite");
                    const storage = transaction.objectStore("creating");
                    storage.clear();
                });
        }
    };
}
window.addEventListener("online", searchDataBase);