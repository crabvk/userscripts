// ==UserScript==
// @name        SoundCloud Restore Playback
// @namespace   https://github.com/vyachkonovalov
// @description Saves/restores playback position on SoundCloud.com
// @version     0.2.0
// @author      Vyacheslav Konovalov
// @match       https://soundcloud.com/*
// @license     MIT
// @noframes
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_deleteValue
// @downloadURL https://raw.githubusercontent.com/vyachkonovalov/userscripts/master/soundcloud-restore-playback.user.js
// @supportURL  https://t.me/vyachkonovalov
// @homepageURL https://github.com/vyachkonovalov/vyachkonovalov/userscripts
// ==/UserScript==

let lastKey
let lastPosition

const restorePlayback = (position, wrapper) => {
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
  let isInit = true
  const wrapper = player.querySelector('.playbackTimeline__progressWrapper')
  new MutationObserver(mutations => {
    for (const mutation of mutations) {
      if (mutation.type === 'attributes') {
        const isInitRestore = isInit && mutation.attributeName === 'aria-valuemax'
        const isPositionUpdate = !isInitRestore && mutation.attributeName === 'aria-valuenow'

        if (isInitRestore || isPositionUpdate) {
          const key = getKey(player)
          let position

          if (isPositionUpdate && key === lastKey) {
            position = parseInt(mutation.target.getAttribute('aria-valuenow'))
            if (position > 0 && position % 5 === 0 || Math.abs(lastPosition - position) > 4) {
              GM_setValue(getKey(player), position)
            }
          } else {
            position = GM_getValue(key) || 0
            if (position > 0) {
              const length = parseInt(mutation.target.getAttribute('aria-valuemax'))
              // Do not restore position from last 5% of the track,
              // but this 5% can't be lower than 10 seconds or greater than 30 seconds
              const limit = length - Math.min(Math.max(length / 100 * 5, 10), 30)
              if (position < limit) {
                restorePlayback(position, mutation.target)
              } else {
                GM_deleteValue(key)
              }
            }
            isInit = false
          }

          lastKey = key
          lastPosition = position
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
