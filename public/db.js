let database;

const req = indexedDB.open("budget", 1);

req.onupgradeneeded = (event) => {
    const database = event.target.result
    database.createObjectStore("creating", { autoIncrement: true });
};

req.onsuccess = (event) => {
    database = event.target.result;
    if (navigator.onLine) {
        searchDataBase();
    }
};

searchDataBase = () => {
    const transaction = database.transaction("creating", "readonly");
    const storage = transaction.objectStore("creating");
    const getAll = storage.getAll();
    getAll.onsuccess = () => {
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers:
                {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })
                .then((res) => res.json()).then(() => {
                    const transaction = database.transaction("creating", "readwrite");
                    const storage = transaction.objectStore("creating");
                    storage.clear();
                });
        }
    };
}

saveRecord = (rec) => {
    const transaction = database.transaction("creating", "readwrite");
    const storage = transaction.objectStore("creating");
    storage.add(rec);
}



window.addEventListener("online", searchDataBase);