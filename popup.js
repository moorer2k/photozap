document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('settingsForm');
  const saveButton = document.querySelector('button[type="submit"]');
  const startButton = document.getElementById('startButton');
  const successAlert = document.getElementById('successAlert');
  const numImages = document.getElementById('numImages');

  // Default values to ensure functionality on first load
  const defaultSettings = {
    delay: 100,
    autoDelete: false
  };

  // Load saved settings or use default values if none are found
  chrome.storage.sync.get(['delay', 'maxAttempts', 'autoDelete'], (items) => {
    form.delay.value = items.delay !== undefined ? items.delay : defaultSettings.delay;
    form.autoDelete.checked = items.autoDelete !== undefined ? items.autoDelete : defaultSettings.autoDelete;
  });

  // Save settings when the save button is clicked
  saveButton.addEventListener('click', (e) => {
    e.preventDefault();

    const delay = form.delay.value;
    const autoDelete = form.autoDelete.checked;
    const maxAttempts = 50;

    chrome.storage.sync.set({ delay, maxAttempts, autoDelete }, () => {
      console.log('Settings saved');
      successAlert.style.display = 'block';
      setTimeout(() => {
        successAlert.style.display = 'none';
      }, 3000);
    });
  });

  // Handle Start button click
  startButton.addEventListener('click', (e) => {
    e.preventDefault();
    console.log('Start button clicked');

    // Disable the start button
    startButton.disabled = true;
    console.log('Start button disabled');

    // Get number of images value, default to 0 if empty
    let numImagesValue = numImages.value.trim();
    if (numImagesValue === '') {
      numImagesValue = 0; // Default to 0 if no value is entered
    }

    chrome.storage.sync.get(['delay', 'maxAttempts', 'autoDelete'], (items) => {
      chrome.runtime.sendMessage(
        {
          action: 'startClicking',
          delay: items.delay !== undefined ? items.delay : defaultSettings.delay,
          maxAttempts: 50,
          autoDelete: items.autoDelete !== undefined ? items.autoDelete : defaultSettings.autoDelete,
          numImages: numImagesValue
        },
        () => {
          console.log('Message sent to content script');
        }
      );
      // Close the extension popup window
      window.close();
    });
  });

  // Listen for updates from content script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'resetButton') {
      startButton.disabled = false;
      console.log('Start button reset');
    }
  });
});
