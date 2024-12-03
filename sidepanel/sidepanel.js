import {MESSAGE_TYPES} from "../constants.js";

document.addEventListener("DOMContentLoaded", () => {
  const videoTitle = document.getElementById("videoTitle");
  const videoDescription = document.getElementById("videoDescription");
  const commentTextbox = document.getElementById("commentTextbox");
  const generateButton = document.getElementById("btnGenerate");
  const loadingIndicator = document.getElementById("loading");
  const refetchDescriptionButton = document.getElementById("btnFetchDescription");
  const fillCommentButton = document.getElementById("btnFillComment");
  const toggleButton = document.getElementById("toggleOptionalQuery");
  const collapsibleContent = document.getElementById("optionalQueryContent");
  const helpIcon = document.getElementById("helpIcon");
  const helpTooltip = document.getElementById("helpTooltip");

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
    commentTextbox.value = "Generating comment, please wait...";

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
        commentTextbox.value = response.comment;
      } else {
        showError(`Error: ${response.error}. Please retry.`);
        commentTextbox.value = "";
      }
    } catch (error) {
      // Handle errors
      console.error("Error communicating with background script:", error);
      showError(`Error: ${error}. Please retry.`);
    } finally {
      // Hide loading indicator
      hide(loadingIndicator);
    }
  });

  refetchDescriptionButton.addEventListener("click", () => {
    loadVideoInfo(videoTitle, videoDescription);
  });

  fillCommentButton.addEventListener("click", async () => {
      const commentText = commentTextbox.value.trim();

      const response = await sendMessageToBackground({
        action: MESSAGE_TYPES.FILL_COMMENT,
        comment: commentText
      });

      // ignore response data for now
  });

  toggleButton.addEventListener("click", () => {
      collapsibleContent.classList.toggle("hidden");

      if (collapsibleContent.classList.contains("hidden")) {
          toggleButton.textContent = "Show Optional Query";
      } else {
          toggleButton.textContent = "Hide Optional Query";
      }
  });

  helpIcon.addEventListener("click", () => {
      helpTooltip.classList.toggle("hidden");
  });

  // Hide help description
  document.addEventListener("click", (event) => {
      if (!helpIcon.contains(event.target) && !helpTooltip.contains(event.target)) {
          hide(helpTooltip);
      }
  });
});

async function createComment(request) {
    // Display loading indicator
    const storedRequest = queryForm.value;
    show(loadingIndicator);
    commentTextbox.value = "Generating comment, please wait...";

    try {
      // Send message to background script to generate a comment
      const response = await sendMessageToBackground({
        action: MESSAGE_TYPES.GENERATE_COMMENT,
        prompt: storedRequest,
        title: videoTitle.value,
        description: videoDescription.value,
      });

      // Update the UI with the response
      if (response.success) {
        commentTextbox.value = response.comment;
      } else {
        commentTextbox.value = "I am sorry. Cannot generate comment for this video at this time";
      }
    } catch (error) {
      // Handle errors
      console.error("Error communicating with background script:", error);
      commentTextbox.value = "";
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