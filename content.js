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

// Function to get the video title with exception handling
function getVideoTitle() {
  try {
    const titleElement = document.querySelector('#title h1 yt-formatted-string');
    if (!titleElement) {
      throw new Error("Video title not found");
    }
    return titleElement.textContent.replace(/[^a-zA-Z0-9 ]/g, '').trim();
  } catch (error) {
    console.error("Error fetching video title:", error.message);
    return null; // Return null if the title is not found or an error occurs
  }
}

async function getVideoDescription() {
  try {
    // Locate the "More" button
    const moreButton = document.querySelector('#expand');
    if (moreButton) {
      // Click the "More" button to expand the description
      moreButton.click();
    }

    // Wait for the description to fully expand
    await waitForElement('#description-inline-expander yt-attributed-string span span');

    // Read the expanded description
    const descriptionElement = document.querySelector('#description-inline-expander yt-attributed-string span span');
    const description = descriptionElement
        // removing newlines and special characters
        ? descriptionElement.textContent.replace(/[^a-zA-Z0-9 ]/g, ' ').trim()
        : "Description not found";
    console.log("Full Description:", description);

    // Locate the "Collapse" button
    const collapseButton = document.querySelector('#collapse');
    if (collapseButton) {
      // Click the "Collapse" button to shrink the description back
      collapseButton.click();
    }

    return description;
  } catch (error) {
    console.error("Error toggling description:", error.message);
    return null;
  }
}

// Utility function to wait for an element to exist in the DOM
function waitForElement(selector, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const interval = 100; // Check every 100ms
    let elapsed = 0;

    const checkElement = () => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
      } else if (elapsed >= timeout) {
        reject(new Error(`Element ${selector} not found within ${timeout}ms`));
      } else {
        elapsed += interval;
        setTimeout(checkElement, interval);
      }
    };

    checkElement();
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getVideoInfo") {
    // TODO remove
    console.log("Hello there");

    // Use an async IIFE (Immediately Invoked Function Expression) to handle async logic
    (async () => {
      try {
        const videoTitle = getVideoTitle(); // Assuming this is synchronous
        const videoDescription = await getVideoDescription(); // Await the async function

        // Respond with video info
        sendResponse({
          title: videoTitle,
          description: videoDescription,
        });
      } catch (error) {
        console.error("Error handling getVideoInfo request:", error.message);
        sendResponse({
          title: null,
          description: null,
          error: "Unable to fetch video information",
        });
      }
    })();

    // Return true to keep the message channel open for async response
    return true;
  }
});
