//imports
import {MESSAGE_TYPES} from "./constants.js";

// const declaration
const YOUTUBE_ORIGIN = 'https://www.youtube.com';
const emptyPage = 'sidepanel/empty.html';
const sidepanelPage = 'sidepanel/sidepanel.html';


// side panel operations
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
  if (!tab.url) return;
  const url = new URL(tab.url);
  // Enables the side panel on youtube.com
  if (url.origin === YOUTUBE_ORIGIN) {
    await chrome.sidePanel.setOptions({
      tabId,
      path: sidepanelPage,
      enabled: true
    });
  } else {
    // Disables the side panel on all other sites
    await chrome.sidePanel.setOptions({
      tabId,
      enabled: false
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "summarizeComments") {
        console.log("Not implemented, tbd");
        return false;
    }
    if (request.action == MESSAGE_TYPES.GET_VIDEO_INFO) {
        getVideoInfo(sendResponse);
        return true;
    }
    if (request.action === MESSAGE_TYPES.GENERATE_COMMENT) {
        handleGenerateComment(request, sendResponse);
        return true;
    }
    if (request.action === "videoChanged") {
        chrome.runtime.sendMessage({
            action: MESSAGE_TYPES.UPDATE_SIDE_PANEL,
            videoInfo: request.videoInfo
        })
        return true;
    }
    if (request.action === MESSAGE_TYPES.FILL_COMMENT) {
        injectCommentSection(request, sendResponse)
        return true;
    }
});

async function injectCommentSection(message, sendResponse) {
    try {
        // Query the active tab
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const activeTab = verifyYoutubeTabIsOpen(tabs);
            if (activeTab) {
                // Send message to content.js
                chrome.tabs.sendMessage(activeTab.id, {
                    action: "injectComment",
                    comment: message.comment
                    },
                    (response) => {
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

async function getVideoInfo(sendResponse) {
    try {
        // Query the active tab
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const activeTab = verifyYoutubeTabIsOpen(tabs)
            if (activeTab) {
                // Send message to content.js
                chrome.tabs.sendMessage(activeTab.id, { action: "collectVideoInfo" }, (response) => {
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

function verifyYoutubeTabIsOpen(tabs) {
    if (!tabs || tabs.length === 0) {
        console.error("No active tabs found.");
        sendResponse({ error: "No active tabs found." });
        return;
    }

    const activeTab = tabs[0];
    console.log("YouTube video tab detected:", activeTab ? activeTab.url : ".. or not");
    return activeTab.url && activeTab.url.includes("youtube.com/watch")
        ? activeTab
        : null;
}

// Define the async function for generating a comment
// message contains: prompt, title, description
async function handleGenerateComment(message, sendResponse) {
  try {
    // TODO = deleteme
    console.log("Received request : " + message.title + " d: " + message.description + ", p: " + message.prompt);

    const context = "I would like to generate the comment for youtube video."
        + " Video title reads as, " + message.title
        + ". And description reads as, " + message.description + ".";

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