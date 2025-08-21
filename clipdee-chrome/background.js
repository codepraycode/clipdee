// Chrome Manifest V3 Background Script (Service Worker)

// Handle extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('ClipDee extension installed');
});

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
  console.log('ClipDee extension started');
});

// Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getClipboard') {
    // Clipboard access is handled in popup.js for Chrome
    sendResponse({ success: true });
  }
  
  // Return true to indicate we want to send a response asynchronously
  return true;
});

// Optional: Handle action click (though popup is defined)
chrome.action.onClicked.addListener((tab) => {
  console.log('ClipDee icon clicked');
});

// Keep service worker alive if needed
chrome.runtime.onSuspend.addListener(() => {
  console.log('ClipDee service worker suspending');
});

// Handle alarm events if you add periodic functionality later
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'clipdee-cleanup') {
    // Future: cleanup old data if needed
  }
});