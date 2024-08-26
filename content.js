(async function () {
  'use strict';

  // Create and show the fancy overlay modal
  function showOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'photoZapOverlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(44, 62, 80, 0.5)'; // #2c3e50 with 50% transparency
    overlay.style.zIndex = '9999';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.color = 'white';
    overlay.style.fontSize = '24px';
    overlay.style.textAlign = 'center';
    overlay.style.fontFamily = 'Arial, sans-serif';

    overlay.innerHTML = `
      <div>
        <img src="${base64Gif}" alt="Processing..." style="max-width: 10%; height: 20%; margin-bottom: 10px;">
        <div>Processing... Please wait..</div>
        <div><b>To cancel operation, simply refresh the page.</b></div>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  // Remove the overlay modal
  function removeOverlay() {
    const overlay = document.getElementById('photoZapOverlay');
    if (overlay) {
      document.body.removeChild(overlay);
    }
  }

  // Get settings from chrome.storage
  async function getSettings() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['delay', 'maxAttempts', 'autoDelete'], (items) => {
        resolve({
          delay: items.delay || 100,
          maxAttempts: items.maxAttempts || 30,
          autoDelete: items.autoDelete || false
        });
      });
    });
  }

  // Check if the element is at the bottom
  function isAtBottom(element) {
    return element.scrollTop + element.clientHeight >= element.scrollHeight;
  }

  // Find scrollable elements
  function findScrollableElements() {
    const allElements = document.querySelectorAll('*');
    const scrollableElements = [];

    allElements.forEach(element => {
      const overflowY = window.getComputedStyle(element).overflowY;
      if (overflowY === 'scroll' || overflowY === 'auto') {
        if (element.scrollHeight > element.clientHeight) {
          scrollableElements.push(element);
        }
      }
    });

    return scrollableElements;
  }

  // Wait for checkboxes to be available
  async function waitForCheckboxes(selector, maxAttempts, delay) {
    for (let i = 0; i < maxAttempts; i++) {
      let checkboxes = [...document.querySelectorAll(selector)].filter((checkbox) => checkbox.getAttribute('aria-checked') === 'false');
      if (checkboxes.length > 0) {
        return checkboxes;
      }
      console.log('Waiting for checkboxes to be available...');
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
    return [];
  }

  // Initialize the script and ensure it's ready to run
  async function initializeScript() {
    let attempts = 0;
    const maxInitAttempts = 10;
    while (attempts < maxInitAttempts) {
      try {
        // Attempt to find scrollable elements
        const scrollableElements = findScrollableElements();
        if (scrollableElements.length >= 2) {
          console.log('Initialization successful');
          return scrollableElements[1]; // Return the scrollable element to use
        }
        console.log('Initialization attempt failed, retrying...');
        attempts++;
        await new Promise((resolve) => setTimeout(resolve, 500)); // Wait before retrying
      } catch (error) {
        console.error('Initialization error:', error);
        attempts++;
        await new Promise((resolve) => setTimeout(resolve, 500)); // Wait before retrying
      }
    }
    throw new Error('Failed to initialize the script after multiple attempts.');
  }

  async function clickUncheckedCheckboxes(delay, maxAttempts, autoDelete, numImages) {
    let noCheckboxesCount = 0;
    let selectedCount = 0;

    const scrollableElement = await initializeScript();
    if (!scrollableElement) {
      console.error('No scrollable element found.');
      return;
    }

    // Show overlay
    showOverlay();

    // Scroll to the top of the page
    scrollableElement.scrollBy(0, -scrollableElement.scrollHeight);
    await new Promise((resolve) => setTimeout(resolve, 500)); // wait for the page to scroll to the top

    while (true) {
      // Wait for checkboxes to be available
      let checkboxes = await waitForCheckboxes('.ckGgle', maxAttempts, delay);
      console.log(`Found ${checkboxes.length} unchecked checkboxes.`);

      if (checkboxes.length > 0) {
        noCheckboxesCount = 0;
        // Click each unchecked checkbox
        for (const checkbox of checkboxes) {
          if (numImages === 0 || selectedCount < numImages) {
            console.log(`Clicking checkbox: ${checkbox}`);
            checkbox.click();
            selectedCount++;
          }
        }

        if (numImages > 0 && selectedCount >= numImages) {
          console.log(`Selected ${selectedCount} items.`);
          if (autoDelete) {
            await triggerDeletion(maxAttempts);
          }
          break;
        }

        // Scroll down to load more checkboxes if selecting all items or if more items are needed
        if (numImages === 0 || selectedCount < numImages) {
          if (!isAtBottom(scrollableElement)) {
            scrollableElement.scrollBy(0, window.outerHeight);
            await new Promise((resolve) => setTimeout(resolve, delay)); // wait for new items to load
          } else {
            console.log('Reached the bottom of the scrollable element.');
            break;
          }
        }
      } else {
        noCheckboxesCount++;
        if (noCheckboxesCount > maxAttempts) {
          console.log('All checkboxes are selected.');
          if (autoDelete) {
            await triggerDeletion(maxAttempts);
          }
          break;
        }

        // Autoscroll down the page if selecting all items
        if (numImages === 0) {
          if (!isAtBottom(scrollableElement)) {
            scrollableElement.scrollBy(0, window.outerHeight);
          } else {
            console.log('Reached the bottom of the scrollable element.');
            break;
          }
        }
      }

      // Wait for a short period before checking again
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    // Remove overlay
    removeOverlay();

    // Notify that the script has completed
    chrome.runtime.sendMessage({ action: 'resetButton' }, () => {
      console.log('Script completed, message sent to reset button');
    });
  }

  // Trigger deletion with retries
  async function triggerDeletion(maxAttempts) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const deleteButton = document.querySelector('button[aria-label="Delete"]');
      if (deleteButton) {
        deleteButton.click();
        console.log('Clicked the delete button.');

        for (let i = 0; i < 20; i++) {
          const xpath = "//span[text()='Move to trash']";
          const spanElement = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

          if (spanElement) {
            spanElement.click();
            console.log('Items moved to trash.');
            return;
          } else {
            console.log('Waiting for the "Move to trash" button to appear...');
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        }
        console.log('Move to trash button not found after maximum attempts.');
      } else {
        console.log('Waiting for the delete button to appear...');
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      console.log(`Attempt ${attempt} to trigger deletion failed.`);
    }
    console.log('Failed to trigger deletion after maximum attempts.');
  }

  // Listen for messages from the background script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'startClicking') {
      const { delay, maxAttempts, autoDelete, numImages } = request;
      clickUncheckedCheckboxes(delay, maxAttempts, autoDelete, parseInt(numImages, 10));
      sendResponse({ status: 'started' });
    }
  });

})();
