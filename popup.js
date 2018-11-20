import {
    getById
} from './utils.js'
import {
    constructOptions
} from './createIntervalOptions.js'

let startButton = getById('startButton')
let stopButton = getById('stopButton')

const setupButtonClick = () => {
    startButton.onclick = start
    stopButton.onclick = stop
}

const start = () => {
    chrome.tabs.getSelected(window.id, function (tab) {
        const reportReloader = chrome.extension.getBackgroundPage().reportReloader

        chrome.storage.sync.get(['interval'], (data) => {
            console.log("AAAA");
            
            const params = {
                tab: tab,
                interval: data.interval
            }

            reportReloader.enqueueTabToReload(params)
            window.close()
        })
    })
}

const stop = () => {
    chrome.tabs.getSelected(window.id, function (tab) {
        const reportReloader = chrome.extension.getBackgroundPage().reportReloader
        reportReloader.removeFromReloadQueue(tab)
    })
    window.close()
}

setupButtonClick();
constructOptions();