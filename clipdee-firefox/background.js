// Background script for ClipDee extension

// Handle extension installation
chrome.runtime.onInstalled.addListener(() => {
    console.log('ClipDee extension installed');
});

// Optional: Handle browser action click (though we're using popup)
chrome.browserAction.onClicked.addListener((tab) => {
    // This won't fire if popup is defined, but kept for potential future use
    console.log('ClipDee icon clicked');
});

// Optional: Listen for clipboard changes (if we want background processing)
// Note: This would require additional permissions and is currently not implemented
// to keep the extension lightweight and privacy-focused

// Handle messages from popup if needed
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getClipboard') {
        // This is handled directly in popup.js using navigator.clipboard
        sendResponse({ success: true });
    }
});

// Keep the service worker alive (for Manifest V3 compatibility)
chrome.runtime.onSuspend.addListener(() => {
    console.log('ClipDee background script suspending');
});

// Optional: Badge updates or notifications could be added here
// For example, showing the number of words looked up today