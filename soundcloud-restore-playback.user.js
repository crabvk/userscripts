// ==UserScript==
// @name        SoundCloud Restore Playback
// @namespace   https://github.com/vyachkonovalov
// @description Saves/restores playback position on SoundCloud.com
// @version     0.3.1
// @author      Vyacheslav Konovalov
// @match       https://soundcloud.com/*
// @license     MIT
// @noframes
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_deleteValue
// @downloadURL https://raw.githubusercontent.com/vyachkonovalov/userscripts/master/soundcloud-restore-playback.user.js
// @supportURL  https://t.me/vyachkonovalov
// @homepageURL https://github.com/vyachkonovalov/userscripts
// ==/UserScript==

let lastKey
let lastPosition

const findLast = (array, cond) => {
  let i = array.length - 1
  for (; i >= 0; i--) {
    if (cond(array[i])) {
      return array[i]
    }
  }
}

/**
 * Clicks on the timeline according to factor.
 *
 * @param {number} factor Current position divided by track duration.
 * @param {number} wrapper The timeline wrapper element on which to click.
 */
const restorePlayback = (factor, wrapper) => {
  const rect = wrapper.getBoundingClientRect()
  const args = {
    view: unsafeWindow,
    bubbles: true,
    clientX: rect.x + Math.floor(rect.width * factor),
    clientY: rect.y + 10
  }
  wrapper.dispatchEvent(new MouseEvent('mousedown', args))
  wrapper.dispatchEvent(new MouseEvent('mouseup', args))
}

const observeProgress = player => {
  let isInit = true
  let isRestore = false
  const cond = m => isInit ? m.attributeName === 'aria-valuemax' : m.attributeName === 'aria-valuenow'
  new MutationObserver(mutations => {
    const mutation = findLast(mutations, m => m.type === 'attributes' && cond(m))
    if (mutation === undefined) {
      return
    }

    const duration = parseInt(mutation.target.getAttribute('aria-valuemax'))
    // Skip tracks shorter than 10 minutes
    if (duration < 600) {
      return
    }

    const key = player.querySelector('.playbackSoundBadge__titleLink').getAttribute('href')
    let position

    if (!isInit && key === lastKey) {
      // Ignore position change triggered by restorePlayback function
      if (isRestore) {
        isRestore = false
        return
      }
      position = parseInt(mutation.target.getAttribute('aria-valuenow'))
      if (position > 0 && position % 5 === 0 || Math.abs(lastPosition - position) > 4) {
        GM_setValue(key, position)
      }
    } else {
      isInit = false
      position = GM_getValue(key) || 0
      if (position > 0) {
        // Do not restore position from last 30 seconds of the track
        if (position < duration - 30) {
          isRestore = true
          restorePlayback(position / duration, mutation.target)
        } else {
          GM_deleteValue(key)
        }
      }
    }

    lastKey = key
    lastPosition = position
  }).observe(player.querySelector('.playbackTimeline__progressWrapper'), { attributes: true })
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

// Wait for div.playControls to appear on the page first
const app = document.body.querySelector('#app')
appObserver.observe(app, { childList: true })
