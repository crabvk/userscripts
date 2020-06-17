// ==UserScript==
// @name        SoundCloud Restore Playback
// @namespace   https://github.com/vyachkonovalov
// @description Saves/restores playback position on SoundCloud.com
// @version     0.1.0
// @author      Vyacheslav Konovalov
// @match       https://soundcloud.com/*
// @license     MIT
// @noframes
// @grant       GM_getValue
// @grant       GM_setValue
// @downloadURL https://raw.githubusercontent.com/vyachkonovalov/userscripts/master/soundcloud-restore-playback.user.js
// @supportURL  https://t.me/vyachkonovalov
// @homepageURL https://github.com/vyachkonovalov/vyachkonovalov/userscripts
// ==/UserScript==

// Store last saved playback position, mutation.oldValue is always null for unknown reason
let lastPosition

const restorePlayback = (key, wrapper) => {
  const position = GM_getValue(key)
  if (position === undefined) {
    return
  }
  lastPosition = position

  const length = parseInt(wrapper.getAttribute('aria-valuemax'))
  const rect = wrapper.getBoundingClientRect()
  const args = {
    view: unsafeWindow,
    bubbles: true,
    clientX: rect.x + Math.floor(rect.width / length * position),
    clientY: rect.y + 10
  }
  wrapper.dispatchEvent(new MouseEvent('mousedown', args))
  wrapper.dispatchEvent(new MouseEvent('mouseup', args))
}

const getKey = player => player.querySelector('.playbackSoundBadge__titleLink').getAttribute('href')

const observeProgress = player => {
  const wrapper = player.querySelector('.playbackTimeline__progressWrapper')
  new MutationObserver(mutations => {
    for (const mutation of mutations) {
      if (mutation.type === 'attributes') {
        if (mutation.attributeName === 'aria-valuemax') {
          restorePlayback(getKey(player), mutation.target)
          break
        } else if (mutation.attributeName === 'aria-valuenow' && typeof lastPosition === 'number') {
          setTimeout(() => {
            const position = parseInt(mutation.target.getAttribute('aria-valuenow'))
            if (position > 0 && position % 5 === 0 || Math.abs(lastPosition - position) > 4) {
              // Save current position
              lastPosition = position
              GM_setValue(getKey(player), position)
            }
          }, 0)
          break
        }
      }
    }
  }).observe(wrapper, { attributes: true })
}

const appObserver = new MutationObserver(mutations => {
  for (const mutation of mutations) {
    if (mutation.type === 'childList') {
      const player = Array.from(mutation.addedNodes)
        .find(n => n.nodeName === 'DIV' && n.classList.contains('playControls'))
      if (player) {
        appObserver.disconnect()
        observeProgress(player)
        break
      }
    }
  }
})

const app = document.body.querySelector('#app')
appObserver.observe(app, { childList: true })
