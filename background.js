'use strict';

chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.sync.set({
    interval: 10
  })
});

let matches = ["://app.powerbi.com"]
chrome.tabs.onActivated.addListener((activateInfo) => {

  chrome.tabs.get(activateInfo.tabId, (tab) => {
    for (let i in matches) {
      if (tab.url.includes(matches[i]) == false) {
        chrome.browserAction.disable(tab.id)
        break
      }
    }
  })
})

var reportReloader = {};
var reloadingQueue = {};

reportReloader.enqueueTabToReload = (params) => {
  reportReloader.removeFromReloadQueue(params.tab);

  if (params.interval < 1)
    return;

  params.nextRefresh = new Date().getTime() + (params.interval * 1000);
  params.intervalID = setInterval(() => reloadReport(params.tab.id), params.interval * 1000);
  reloadingQueue[params.tab.id] = params;
  reportReloader.countdownIntervalID = setInterval(() => updateCountdown(), 1000);
  updateCountdown(true)

  return params;
}

reportReloader.removeFromReloadQueue = (tabOptions) => {
  var params = reloadingQueue[tabOptions.id];

  if (params) {
    clearInterval(params.intervalID);
    delete reloadingQueue[tabOptions.id];
    chrome.browserAction.setBadgeText({
      text: '',
      tabId: tabOptions.id
    });
  }

  return params;
}


const reloadReport = (tabId) => {
  var params = reloadingQueue[tabId];

  if (!params || !params.tab)
    return;

  chrome.tabs.executeScript(tabId, {
    code: "document.getElementsByClassName('refresh')[0].click()"
  });

  params.nextRefresh = new Date().getTime() + (params.interval * 1000);
  updateCountdown(true)
}

const updateCountdown = (force) => {
  let key;
  for (key in reloadingQueue) {
    if (typeof reloadingQueue[key] !== 'function') {
      const tabId = parseInt(key);

      const params = reloadingQueue[tabId];

      let millis = params.nextRefresh - new Date().getTime();
      let seconds = 0;

      if (millis > 0) {
        seconds = millis / 1000;
        seconds = seconds.toFixed();
      }

      if (seconds >= 60) {
        let minutes = seconds / 60;
        minutes = minutes.toFixed();
        chrome.browserAction.setBadgeBackgroundColor({
          color: [0, 0, 255, 255],
          tabId: tabId
        });
        chrome.browserAction.setBadgeText({
          text: '' + minutes,
          tabId: tabId
        });
      } else {
        if (force || seconds <= 10 || seconds % 10 === 0) {
          chrome.browserAction.setBadgeBackgroundColor({
            color: [255, 0, 0, 255],
            tabId: tabId
          });
          chrome.browserAction.setBadgeText({
            text: '' + seconds,
            tabId: tabId
          });
        }
      }

    }
  }
}