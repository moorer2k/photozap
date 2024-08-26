chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startClicking') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) {
        console.error("No active tab found.");
        sendResponse({ status: 'error', message: 'No active tab found.' });
        return;
      }

      chrome.tabs.sendMessage(tabs[0].id, request, (response) => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError.message);
          sendResponse({ status: 'error', message: chrome.runtime.lastError.message });
        } else {
          console.log('Message sent to content script:', response);
          sendResponse({ status: 'success', message: 'Message sent to content script.' });
        }
      });
    });
  }
  return true; // Keep the message channel open for sendResponse
});
