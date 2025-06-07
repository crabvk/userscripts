// ==UserScript==
// @name        Disable video autoplay
// @description Pauses all video playback on any webpage
// @version     0.1.0
// @author      Vyacheslav Konovalov
// @license     MIT
// @namespace   https://github.com/crabvk
// @match       *://*/*
// @run-at      document-body
// @grant       none
// ==/UserScript==

function pauseAllVideos(target) {
  target.querySelectorAll('video').forEach((video) => video.pause())
}

pauseAllVideos(document)

new MutationObserver((mutationList) => {
  mutationList.forEach(({ target }) => {
    if (target.tagName === 'VIDEO') {
      target.pause()
    } else {
      pauseAllVideos(target)
    }
  })
}).observe(document.body, { childList: true, subtree: true })
