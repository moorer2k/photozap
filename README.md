
# PhotoZap

PhotoZap is a Chrome extension designed to help you automatically select and delete photos in Google Photos with ease. With customizable settings, you can fine-tune the delay, the number of images to select, and whether or not to automatically delete the selected images.

![PhotoZap Icon](./icons/icon128.png)

## Features

- **AutoCheck Delay**: Set the delay between each automatic selection of photos.
- **Number of Images to Select**: Choose the number of images to select (or set to 0 for selecting all).
- **Auto-Delete**: Automatically delete the selected images after selection. For safety purposes, the "Auto-Delete" function requires you to click the "Save" button before it executes.

- **Experimental Google Search Results Support**: The extension may also be used to select and delete images from Google's search results for photos. This feature is still in development and may be buggy, requiring more user testing and feedback.

## Installation

To install the PhotoZap extension:

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/moorer2k/photozap.git
   ```

2. **Load the Extension in Chrome:**

   - Open Chrome and navigate to `chrome://extensions/`.
   - Enable "Developer mode" in the top right corner.
   - Click "Load unpacked" and select the `photozap` directory.

## Usage

1. **Open Google Photos or Google Image Search**: Navigate to your Google Photos page or try using it with Google's image search results (experimental feature).

2. **Open the PhotoZap Extension**: Click on the PhotoZap icon in your Chrome toolbar.

3. **Configure Settings**:
   - Set the AutoCheck Delay in milliseconds.
   - Enter the number of images to select (or leave as 0 to select all).
   - Check the "Auto-Delete" option if you want to automatically delete the selected images. **Remember to click "Save" after enabling Auto-Delete to ensure it functions correctly.**

4. **Start the Process**: Click the "Start" button. The extension will begin selecting images according to your settings.

## How It Works

PhotoZap interacts directly with the Google Photos web page and potentially with Google’s image search results to automatically scroll through your photos and select them according to your specified settings. If the "Auto-Delete" option is enabled, the selected photos will be automatically moved to the trash.

*Note: The ability to work with Google's image search results is still in development and may require further testing to ensure reliable functionality.*

## Troubleshooting

If the extension isn't working as expected:

- **Ensure you are on the Google Photos page** before starting the extension.
- **Check the Chrome Developer Console** (F12) for any error messages that might indicate what’s going wrong.
- **Reload the Google Photos page** and try running the extension again.

## Contributing

If you'd like to contribute to PhotoZap, please fork the repository and use a feature branch. Pull requests are warmly welcome.

## Contact

For questions, suggestions, or issues, please contact the project maintainer:

- **GitHub**: [moorer2k](https://github.com/moorer2k)
