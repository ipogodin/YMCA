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
  const queryForm = document.getElementById("queryForm");

  // Generate button click handler
  generateButton.addEventListener("click", async () => {
    // Display loading indicator
    const storedRequest = queryForm.value;
    // TODO =deleteme
    console.log("User request : " + storedRequest);
    loadingIndicator.style.display = "block";
    composeTextbox.value = "Generating comment, please wait...";

    try {
      // Send message to background script to generate a comment
      const response = await sendMessageToBackground({
        action: "generateComment",
        prompt: storedRequest,
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
});

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