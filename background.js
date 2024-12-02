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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "rewriteComment") {
        const rewrittenComment = "Rewritten: " + request.comment; // Replace with Chrome AI
        sendResponse({ rewrittenComment });
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "summarizeComments") {
        fetchTopComments(request.videoId).then((comments) => {
            // Replace with Chrome AI API summarization
            const summary = "Summary: " + comments;
            sendResponse({ summary });
        });
        return true; // Keep the message channel open for async response
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "generateComment") {
    handleGenerateComment(message, sendResponse);
    return true; // Return true immediately to keep the message port open
  }
});

// Define the async function for generating a comment
async function handleGenerateComment(message, sendResponse) {
  try {
      // TODO = deleteme
    console.log("Received request : " + message.prompt);
    // Simulate a long-running task
    const writer = await ai.writer.create({
        length: "short",
        sharedContext: "Avoid any toxic language and be as constructive as possible."
    });
    const stream = await writer.writeStreaming(message.prompt);

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
