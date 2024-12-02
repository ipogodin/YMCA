# YouTube Mentor Comment Assistant (YMCA)

### **Overview**
The **YouTube Mentor Comment Assistant (YMCA)** is a Chrome extension designed to help users craft meaningful and creative comments on YouTube. Leveraging AI, the extension enables users to:
- Generate original comments that support authors or engage with other users.
- Summarize top comments on a video to provide insightful contributions.
- Enhance their commenting experience with a simple and intuitive interface.

### **Features**
- **AI-Powered Comment Generation**: Create unique, creative, and supportive comments with one click.
- **Summarize Top Comments**: Generate concise summaries of popular comments on a video.
- **Customizable Writing Style**: Choose from different tones (e.g., formal, casual) for your comments.
- **Easy-to-Use Interface**: Simple popup with a text area and quick-action buttons.

### **Installation**
1. Clone or download the repository.
2. Open Chrome and navigate to `chrome://extensions`.
3. Enable **Developer mode** in the top-right corner.
4. Click **Load unpacked** and select the extension's root directory.
5. The extension will appear in your toolbar.

### **Usage**
1. Navigate to a YouTube video.
2. Click on the YMCA extension icon in your browser toolbar.
3. Use the popup to:
    - **Generate Comment**: Automatically generate a creative comment based on AI.
    - **Summarize Comments**: Summarize top comments on the video.
    - **Enhance Your Comment**: Write your own comment and let the extension refine it.
4. Copy the generated comment into YouTube's comment box or let the extension auto-fill it.

### **Permissions**
The extension requires the following permissions:
- **Tabs**: To interact with the currently active YouTube tab.
- **Active Tab**: For accessing the active tab's URL.
- **Scripting**: To inject scripts into the YouTube page for content interaction.
- **Storage**: To save user preferences or history (optional).

### **Files**
- **`manifest.json`**: Defines the extension's configuration and permissions.
- **`popup/popup.html`**: The user interface for the extension's popup.
- **`popup/popup.js`**: Logic for handling user interactions in the popup.
- **`popup/images/loading.gif`**: Loading spinner displayed during AI operations.
- **`background.js`**: Manages AI communication, comment generation, and inter-script messaging.
- **`content.js`**: Interacts with the YouTube page, injecting or reading data as needed.
- **`icons/`**: Contains the extension's icons in different sizes.

### **Development Notes**
- **AI Integration**: Ensure proper integration with the AI API or Chrome's built-in AI tools.
- **Error Handling**: Implement fallback mechanisms to handle API errors or unavailable features.
- **Testing**: Use `chrome://extensions` to test and debug the extension.

### **Future Improvements**
- Add support for multiple tones and languages in comment generation.
- Implement user authentication for personalized suggestions.
- Provide analytics for user engagement with comments.

### **Contributing**
Feel free to submit issues or pull requests to improve this extension. Contributions are welcome!

### **License**
This project is licensed under the Apache 2.0 License.

---

### **Slogan**
"Redefining the Art of Commenting on YouTube—One Thought at a Time!"