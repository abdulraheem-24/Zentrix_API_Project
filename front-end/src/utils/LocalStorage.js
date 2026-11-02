

export function getData (key) {
    try {
        const existingUsers = localStorage.getItem(key);

        if ( !existingUsers || existingUsers == "undefined") {
            return ;
        }

        return JSON.parse(existingUsers);
        
    }catch(error) {
        console.error("error happened on reading data", error)
    }
}



export function saveData (key , data) {
    try {
        localStorage.setItem(key, JSON.stringify(data))
    }catch(error) {
        console.error("error happened on saving data", error)
    }
}

export function removeData (key) {
    try {
        localStorage.removeItem(key);
    }catch(error) {
        console.error("error happened on removing data", error)
    }
}
