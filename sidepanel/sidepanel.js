import {MESSAGE_TYPES} from "../constants.js";

document.addEventListener("DOMContentLoaded", () => {
  const videoTitle = document.getElementById("videoTitle");
  const videoDescription = document.getElementById("videoDescription");
  const composeTextbox = document.getElementById("composeTextbox");
  const generateButton = document.getElementById("btnGenerate");
  const loadingIndicator = document.getElementById("loading");
  const refetchDescriptionButton = document.getElementById("btnFetchDescription");

  // execute prerequisites
  loadVideoInfo(videoTitle, videoDescription);

  //updateSidePanel
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === MESSAGE_TYPES.UPDATE_SIDE_PANEL) {
        console.log("Video info updated:", { message: message });
        videoTitle.value = message.videoInfo.title;
        videoDescription.value = message.videoInfo.description;
    }
  });

  // Generate-button click handler
  generateButton.addEventListener("click", async () => {
    // Display loading indicator
    const storedRequest = queryForm.value;
    show(loadingIndicator);
    composeTextbox.value = "Generating comment, please wait...";

    try {
      // Send message to background script to generate a comment
      const response = await sendMessageToBackground({
        action: "generateComment",
        prompt: storedRequest,
        title: videoTitle.value,
        description: videoDescription.value,
      });

      // Update the UI with the response
      if (response.success) {
        composeTextbox.value = response.comment;
      } else {
        composeTextbox.value = `Error: ${response.error}`;
      }
    } catch (error) {
      // Handle errors
      console.error("Error communicating with background script:", error);
      composeTextbox.value = `Error: ${error}`;
    } finally {
      // Hide loading indicator
      hide(loadingIndicator);
    }
  });

  refetchDescriptionButton.addEventListener("click", () => {
    loadVideoInfo(videoTitle, videoDescription);
  });
});

async function createComment(request) {
    // Display loading indicator
    const storedRequest = queryForm.value;
    show(loadingIndicator);
    composeTextbox.value = "Generating comment, please wait...";

    try {
      // Send message to background script to generate a comment
      const response = await sendMessageToBackground({
        action: "generateComment",
        prompt: storedRequest,
        title: videoTitle.value,
        description: videoDescription.value,
      });

      // Update the UI with the response
      if (response.success) {
        composeTextbox.value = response.comment;
      } else {
        composeTextbox.value = "Cannot generate comment for this video at this time";
      }
    } catch (error) {
      // Handle errors
      console.error("Error communicating with background script:", error);
      composeTextbox.value = "";
      showError(`Error: ${error}. Please retry.`);
    } finally {
      // Hide loading indicator
      hide(loadingIndicator);
    }
}

/*
 videoTitle : text area to load video into
 videoDescription: text area to load video into
*/
function loadVideoInfo(videoTitle, videoDescription) {
    const message = {action: MESSAGE_TYPES.GET_VIDEO_INFO}

    sendMessageToBackground(message)
        .then((response) => {
            console.log("Response from background.js:", response);
            videoTitle.value = response.title;
            videoDescription.value = response.description;
        })
        .catch((error) => {
            videoTitle.value = "Failed to load title, retry with the button below";
            videoDescription.value = "Failed to load description, retry with the button below";
        });
}

function sendMessageToBackground(message) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError.message);
      } else if (!response) {
        reject("No response from background script.");
      } else {
        resolve(response);
      }
    });
  });
}

function showError(error) {
  show(elementError);
  hide(elementLoading);
  elementError.textContent = error;
}

function show(element) {
  element.removeAttribute('hidden');
}

function hide(element) {
  element.setAttribute('hidden', '');
}