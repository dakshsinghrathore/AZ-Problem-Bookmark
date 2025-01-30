const problemListKey = "algozenith_problems";
const newBookmark = window.location.href;

const observer = new MutationObserver(() => {
    initBookmarkFeature();
});

observer.observe(document.body, { childList: true, subtree: true });

initBookmarkFeature();

function initBookmarkFeature() {
    if (!onProblemsPage()) return; 

    const scoreElement = document.querySelector(
        ".ant-col.d-flex.flex-column.justify-content-center.align-items-start.me-2.css-19gw05y p.m-0.fs-6.problem_paragraph.fw-bold"
    );

    if (!scoreElement) {
        console.error("Could not find the score element. Cannot add bookmark button.");
        return;
    }

    if (document.getElementById("add-bookmark-button")) return; 

    const bookmarkButton = createBookmarkButton();
    if (bookmarkButton) {
        insertBookmarkButton(scoreElement, bookmarkButton);
    }
}

function onProblemsPage() {
    return window.location.pathname.startsWith("/problems");
}

function createBookmarkButton() {
    if (document.getElementById("add-bookmark-button")) return null; 

    const button = document.createElement("img");
    button.id = "add-bookmark-button";
    button.src = chrome.runtime.getURL("assets/bookmark.png");
    button.className = "btn_ref";
    button.title = "Click to bookmark current problem";
    button.style.cssText = `
        height: 30px;
        width: 30px;
        cursor: pointer;
    `;

    button.addEventListener("click", handleBookmarkClick);
    return button;
}

function insertBookmarkButton(referenceElement, button) {
    const container = document.createElement("div");
    container.className = "bookmark-button-container";
    container.appendChild(button);

    referenceElement.parentElement.insertAdjacentElement("afterend", container);
    injectStyles();
}

function injectStyles() {
    if (document.getElementById("bookmark-style")) return; 

    const style = document.createElement("style");
    style.id = "bookmark-style";
    style.textContent = `
        .bookmark-button-container {
            display: inline-block;
            margin-left: 10px;
            vertical-align: middle;
        }
        .ant-row.d-flex.gap-4.mt-3.css-19gw05y {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .btn_ref:hover {
            transform: scale(1.1);
        }
    `;
    document.head.appendChild(style);
}

async function handleBookmarkClick() {
    try {
        const bookmarks = await fetchBookmarks();
        const problemName = getProblemName();
        const newBookmarkObj = { url: newBookmark, desc: problemName };

        if (!bookmarks.some((bookmark) => bookmark.url === newBookmark)) {
            await saveBookmark([...bookmarks, newBookmarkObj]);
            console.log("Bookmark added:", newBookmarkObj);
        } else {
            console.log("Bookmark already exists for this URL.");
        }
    } catch (error) {
        console.error("Error handling bookmark:", error);
    }
}

function getProblemName() {
    const problemElement = document.querySelector(".fw-bolder.problem_heading.fs-4");
    return problemElement ? problemElement.textContent.trim() : "Problem Name Not Found";
}

function fetchBookmarks() {
    return new Promise((resolve) => {
        chrome.storage.sync.get([problemListKey], (data) => {
            resolve(data[problemListKey] ? JSON.parse(data[problemListKey]) : []);
        });
    });
}

async function saveBookmark(bookmarks) {
    try {
        await chrome.storage.sync.set({ [problemListKey]: JSON.stringify(bookmarks) });
    } catch (error) {
        console.error("Error saving bookmark:", error);
    }
}
