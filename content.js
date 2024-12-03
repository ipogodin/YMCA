chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "injectComment") {
        injectComment(message.comment)
        .then((response) => {
            sendResponse({ success: true });
        })
        .catch((error) => {
            sendResponse({
                success: false,
                error: "Unable to inplace comment into a comment box",
            });
        });
        // Return true to keep the message channel open for async response
        return true;
    }
});

async function injectComment(comment) {
    // comment box will be non visible by default,
    // retrieving it
    const inactiveCommentBox = document.querySelector('#placeholder-area yt-formatted-string');
    if (inactiveCommentBox) {
        inactiveCommentBox.click(); // activating for comments input
    }

    // getting the actual comment box to fill in
    // the comment
    await waitForElement('#contenteditable-root');

    const commentBox = document.querySelector('#contenteditable-root');
    commentBox.innerText = comment;

    // enabling "comment" button in youtube, as it is blur
    // by default
    commentBox.focus();
    const inputEvent = new Event('input', { bubbles: true });
    commentBox.dispatchEvent(inputEvent);
    commentBox.blur();
}

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
    let fullDescription = "";
    const parentElement = document.querySelector('#description-inline-expander yt-attributed-string span');
    if (parentElement) {
      const childSpans = parentElement.querySelectorAll('span');
      // Concatenate the text content of all child spans
      fullDescription = Array.from(childSpans)
        .map(span => span.textContent.trim()) // Get the text content of each <span>
        .join(' ')
        .replace(/[^a-zA-Z0-9 ]/g, ' ') // Remove special characters
        .replace(/\s+/g, ' ') // Remove multispaces
        .trim();

      console.log("Full Description:", fullDescription);
    } else {
      console.log("Description not found");
    }

    // Locate the "Collapse" button
    const collapseButton = document.querySelector('#collapse');
    if (collapseButton) {
      // Click the "Collapse" button to shrink the description back
      collapseButton.click();
    }

    return fullDescription;
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
  if (message.action === "collectVideoInfo") {
      collectVideoInfo()
      .then((videoInfo) => {
        sendResponse(videoInfo);
      })
      .catch((error) => {
        sendResponse({
          title: null,
          description: null,
          error: "Unable to fetch video information",
        });
      });

    // Return true to keep the message channel open for async response
    return true;
  }
});

// video data collection

let lastKnownTitle = "";
let lastKnownDescription = "";
/**
 * Collects video information by fetching the title and description.
 * @returns {Promise<{ title: string, description: string }>} A promise resolving to the video info.
 */
async function collectVideoInfo() {
  try {
    const videoTitle = getVideoTitle(); // Assuming this is synchronous
    const videoDescription = await getVideoDescription(); // Await the async function

    // Update last known values
    lastKnownTitle = videoTitle;
    lastKnownDescription = videoDescription;

    return {
        title: videoTitle,
        description: videoDescription
    };
  } catch (error) {
    console.error("Error collecting video info:", error.message);
    throw new Error("Unable to fetch video information");
  }
}

// page/video change observer

// observer on page loaded another video
let lastKnownUrl = window.location.href;
const observer = new MutationObserver(() => {
  const videoTitle = document.querySelector('#title h1 yt-formatted-string')?.textContent.trim();
  const videoUrl = window.location.href;

  if (videoUrl !== lastKnownUrl) {
    console.log("video has changed");
    lastKnownUrl = videoUrl;
    // Notify background script with updated video info
    videoWasChanged();
  }
});

/**
 * Function to check if the video was changed.
 * Retries up to 3 times with a 1-second interval.
 * Sends a message though background to a sidepanel for the video description and title update
 */
async function videoWasChanged() {
  const maxAttempts = 3;
  const delayBetweenAttempts = 1000; // 1 second

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // Fetch the current video title and description
      const currentTitle = getVideoTitle(); // Assuming synchronous
      const currentDescription = await getVideoDescription(); // Assuming asynchronous

      if (currentTitle !== lastKnownTitle || currentDescription !== lastKnownDescription) {
        // Update the last known values
        lastKnownTitle = currentTitle;
        lastKnownDescription = currentDescription;

        // Send message with new video info
        chrome.runtime.sendMessage({
          action: "videoChanged",
          videoInfo: {
            title: currentTitle,
            description: currentDescription,
          },
        });

        console.log("Video info updated:", { title: currentTitle, description: currentDescription });
        return; // Exit function once a change is detected
      } else {
        console.log(`Attempt ${attempt}: No change detected.`);
      }
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error.message);
    }

    // Wait before retrying, if not the last attempt
    if (attempt < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, delayBetweenAttempts));
    }
  }
  console.log("Max attempts reached. No changes detected.");
}

// Start observing changes in the DOM
observer.observe(document.body, {
  childList: true,
  subtree: true,
});

