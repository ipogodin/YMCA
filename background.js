
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "generateOriginal") {
        // TODO: Replace with Chrome AI API call
        const comment = "This is a unique and original comment!";
        sendResponse({ comment });
    } else if (request.action === "supportAuthor") {
        const comment = "Thank you for your amazing work! Keep it up!";
        sendResponse({ comment });
    } else if (request.action === "supportTop") {
        const comment = "I agree with the top comments! Here's my take: ...";
        sendResponse({ comment });
    }
});
//TODO: ignored for now
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "rewriteComment") {
        const rewrittenComment = "Rewritten: " + request.comment; // Replace with Chrome AI
        sendResponse({ rewrittenComment });
    }
});
// TODO: ignored for now
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "summarizeComments") {
        fetchTopComments(request.videoId).then((comments) => {
            // Replace with Chrome AI API summarization
            const summary = "Summary: " + comments;
            sendResponse({ summary });
        });
        return true; // Keep the message channel open for async response
    }
    if (request.action == "testGetVideoInfo") {
        testGetVideoInfo(sendResponse);
        return true;
    }
    if (request.action === "generateComment") {
        handleGenerateComment(request, sendResponse);
        return true; // Return true immediately to keep the message port open
    }
});

async function testGetVideoInfo(sendResponse) {
    try {
        // Query the active tab
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (!tabs || tabs.length === 0) {
                console.error("No active tabs found.");
                sendResponse({ error: "No active tabs found." });
                return;
            }

            const activeTab = tabs[0];
            if (activeTab.url && activeTab.url.includes("youtube.com/watch")) {
                console.log("YouTube video tab detected:", activeTab.url);

                // Send message to content.js
                chrome.tabs.sendMessage(activeTab.id, { action: "getVideoInfo" }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error("Error sending message to content script:", chrome.runtime.lastError.message);
                        sendResponse({ error: "Content script not found or not loaded" });
                    } else {
                        sendResponse(response);
                    }
                });
            } else {
                console.error("Active tab is not a YouTube video page.");
                sendResponse({ error: "Active tab is not a YouTube video page." });
            }
        });
    } catch (error) {
        console.error("Error in testGetVideoInfo:", error.message);
        sendResponse({ error: "An unexpected error occurred." });
    }
}

// Define the async function for generating a comment
// message contains: prompt, title, description
async function handleGenerateComment(message, sendResponse) {
  try {
    // TODO = deleteme
    console.log("Received request : " + message.title + " d: " + message.description + ", p: " + message.prompt);

    const context = "Ignore non-readable text. Avoid any toxic language and be as constructive as possible."
                                      + " Video title reads as, " + message.title
                                      + ". And description reads as, " + message.description + "."

    // Simulate a long-running task
    const writer = await ai.writer.create({
        length: "short",
        sharedContext: context,
    });
    const prompt = message.prompt
        ? message.prompt
        : "Generate the comment to support author.";
    // TODO debug
    console.log("prompt is : " + prompt);
    console.log("context is : " + context);

    const stream = await writer.writeStreaming(prompt);

    let generatedComment = "";
    for await (const chunk of stream) {
      generatedComment = chunk;
    }

    // Send the response after completion
    sendResponse({ success: true, comment: generatedComment });
  } catch (error) {
    console.error("Error generating comment:", error);
    sendResponse({ success: false, error: error.message });
  }
}

/*chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "generateComment") {
    console.log("generateComment");
    setTimeout(() => {
      sendResponse({ success: true, comment: "Generated comment example" });
    }, 2000); // Simulate delay
    return true;
  }
});*/
