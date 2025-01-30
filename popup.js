let problemListKey = "algozenith_problems";

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const data = await new Promise((resolve) => {
            chrome.storage.sync.get([problemListKey], resolve);
        });

        const currentBookmarks = data[problemListKey]
            ? JSON.parse(data[problemListKey])
            : [];
        viewBookmarks(currentBookmarks);
    } catch (error) {
        console.error("Error loading bookmarks:", error);
    }
});

const viewBookmarks = (currentBookmarks = []) => {
    const bookmarksElement = document.getElementById("bookmarks");
    bookmarksElement.innerHTML = "";

    if (currentBookmarks.length > 0) {
        currentBookmarks.forEach((bookmark) => {
            addNewBookmark(bookmarksElement, bookmark);
        });
    } else {
        bookmarksElement.innerHTML = '<i class="row">No bookmarks to show</i>';
    }
};

const addNewBookmark = (bookmarks, bookmark) => {
    const bookmarkTitleElement = document.createElement("div");
    const controlsElement = document.createElement("div");
    const newBookmarkElement = document.createElement("div");

    bookmarkTitleElement.textContent = bookmark.desc;
    bookmarkTitleElement.className = "bookmark-title";
    controlsElement.className = "bookmark-controls";

    setBookmarkAttributes("play", onPlay, controlsElement);
    setBookmarkAttributes("delete", onDelete, controlsElement);

    newBookmarkElement.id =
        "bookmark-" + bookmark.url.toString().split("-").at(-1);
    newBookmarkElement.className = "bookmark";
    newBookmarkElement.setAttribute("url", bookmark.url);

    newBookmarkElement.appendChild(bookmarkTitleElement);
    newBookmarkElement.appendChild(controlsElement);

    bookmarks.appendChild(newBookmarkElement);
};

const setBookmarkAttributes = (src, eventListener, controlParentElement) => {
    const controlElement = document.createElement("img");
    controlElement.src = "assets/" + src + ".png";
    controlElement.title = src;
    controlElement.addEventListener("click", eventListener);
    controlParentElement.appendChild(controlElement);
};

const onPlay = async (e) => {
    const bookmarkUrl = e.target.parentNode.parentNode.getAttribute("url");
    window.open(bookmarkUrl, "_blank");
};

const onDelete = async (e) => {
    const bookmarkUrl = e.target.parentNode.parentNode.getAttribute("url");
    const bookmarkElementToDelete = document.getElementById(
        "bookmark-" + bookmarkUrl.toString().split("-").at(-1)
    );

    try {
        await removeFromMemory(bookmarkUrl);
        if (bookmarkElementToDelete) {
            bookmarkElementToDelete.parentNode.removeChild(bookmarkElementToDelete);
        } else {
            console.warn(
                "Bookmark element not found in DOM after deletion from storage."
            );
        }
    } catch (error) {
        console.error("Error deleting bookmark:", error);
    }
};

async function removeFromMemory(urlToDelete) {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get([problemListKey], (data) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
                return;
            }

            let bookmarkData = data[problemListKey]
                ? JSON.parse(data[problemListKey])
                : [];

            let foundIndex = -1;
            for (let index = 0; index < bookmarkData.length; index++) {
                if (bookmarkData[index].url === urlToDelete) {
                    foundIndex = index;
                    break;
                }
            }

            if (foundIndex > -1) {
                bookmarkData.splice(foundIndex, 1);
                chrome.storage.sync.set(
                    { [problemListKey]: JSON.stringify(bookmarkData) },
                    () => {
                        if (chrome.runtime.lastError) {
                            reject(chrome.runtime.lastError);
                        } else {
                            resolve();
                        }
                    }
                );
            } else {
                resolve();
            }
        });
    });
}
