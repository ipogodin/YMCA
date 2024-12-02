chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "fillComment") {
        // TODO placeholder for the comment modifications
        const commentBox = document.querySelector("#placeholder-for-comment-box");
        if (commentBox) {
            commentBox.value = request.comment;
            sendResponse({ success: true });
        } else {
            sendResponse({ success: false });
        }
    }
});