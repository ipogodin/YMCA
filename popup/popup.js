document.getElementById("btnOriginal").addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "generateOriginal" }, (response) => {
        document.getElementById("userComment").value = response.comment;
    });
});

document.getElementById("btnSupportAuthor").addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "supportAuthor" }, (response) => {
        document.getElementById("userComment").value = response.comment;
    });
});

document.getElementById("btnSupportTop").addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "supportTop" }, (response) => {
        document.getElementById("userComment").value = response.comment;
    });
});

document.addEventListener("DOMContentLoaded", () => {
  const composeTextbox = document.getElementById("composeTextbox");
  const generateButton = document.getElementById("btnGenerate");
  const loadingIndicator = document.getElementById("loading");
  const videoTitle = document.getElementById("videoTitle");
  const videoDescription = document.getElementById("videoDescription");
  const refetchDescriptionButton = document.getElementById("btnFetchDescription");

  // execute prerequisites
  loadVideoInfo(videoTitle, videoDescription);

  // Generate-button click handler
  generateButton.addEventListener("click", async () => {
    // Display loading indicator
    const storedRequest = queryForm.value;
    loadingIndicator.style.display = "block";
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
      loadingIndicator.style.display = "none";
    }
  });


  refetchDescriptionButton.addEventListener("click", () => {
    loadVideoInfo(videoTitle, videoDescription);
  });
});

function loadVideoInfo(videoTitle, videoDescription) {
    // TODO : replace with sendMessageToBackground
    chrome.runtime.sendMessage({ action: "testGetVideoInfo" }, (response) => {
      if (response) {
        console.log("Response from background.js:", response);
        videoTitle.value = response.title;
        videoDescription.value = response.description;
      } else {
        videoTitle.value = "Failed to load title, retry with the button below";
        videoDescription.value = "Failed to load description, retry with the button below";
      }
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