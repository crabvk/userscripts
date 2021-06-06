// ==UserScript==
// @name        Medium Disable Popover
// @description Disables popover (with highlight tool and tweet) for selected text and marks on Medium
// @namespace   https://github.com/crabvk
// @version     0.1.0
// @author      Vyacheslav Konovalov
// @match       https://medium.com/*
// @match       https://*.medium.com/*
// @match       https://towardsdatascience.com/*
// @match       https://hackernoon.com/*
// @match       https://medium.freecodecamp.org/*
// @match       https://psiloveyou.xyz/*
// @match       https://betterhumans.coach.me/*
// @match       https://codeburst.io/*
// @match       https://theascent.pub/*
// @match       https://medium.mybridge.co/*
// @match       https://uxdesign.cc/*
// @match       https://levelup.gitconnected.com/*
// @match       https://itnext.io/*
// @match       https://entrepreneurshandbook.co/*
// @match       https://proandroiddev.com/*
// @match       https://blog.prototypr.io/*
// @match       https://thebolditalic.com/*
// @match       https://blog.usejournal.com/*
// @match       https://blog.angularindepth.com/*
// @match       https://blog.bitsrc.io/*
// @match       https://blog.devartis.com/*
// @match       https://blog.maddevs.io/*
// @match       https://blog.getambassador.io/*
// @match       https://uxplanet.org/*
// @match       https://instagram-engineering.com/*
// @match       https://calia.me/*
// @match       https://productcoalition.com/*
// @match       https://engineering.opsgenie.com/*
// @match       https://android.jlelse.eu/*
// @match       https://robinhood.engineering/*
// @match       https://blog.hipolabs.com/*
// @match       https://ux.shopify.com/*
// @match       https://engineering.talkdesk.com/*
// @match       https://blog.codegiant.io/*
// @match       https://tech.olx.com/*
// @match       https://netflixtechblog.com/*
// @match       https://hackingandslacking.com/*
// @match       https://blog.kotlin-academy.com/*
// @match       https://blog.securityevaluators.com/*
// @match       https://blog.kubernauts.io/*
// @match       https://blog.coffeeapplied.com/*
// @match       https://unbounded.io/*
// @match       https://writingcooperative.com/*
// @match       https://blog.echobind.com/*
// @match       https://*.plainenglish.io/*
// @match       https://*.betterprogramming.pub/*
// @match       https://blog.doit-intl.com/*
// @match       https://eand.co/*
// @match       https://techuisite.com/*
// @match       https://levelupprogramming.net/*
// @match       https://betterhumans.pub/*
// @license     MIT
// @noframes
// @downloadURL https://raw.githubusercontent.com/crabvk/userscripts/master/medium-disable-popover.user.js
// @homepageURL https://github.com/crabvk/userscripts
// ==/UserScript==
// List of domains copied from https://github.com/manojVivek/medium-unlimited/blob/master/manifest.json

const sleep = millisecs => new Promise(resolve => setTimeout(resolve, millisecs))

document.body.onmouseup = event => event.stopPropagation()

window.addEventListener('load', async () => {
    const style = document.createElement('style')
    style.textContent = 'mark { cursor: initial !important; }'
    document.head.appendChild(style)

    let i = 0;
    while (true) {
        const marks = document.querySelectorAll('mark')

        marks.forEach(el => {
            if (el.parentNode) {
                el.parentNode.innerHTML += ''
            }
        })

        if (marks.length > 0 || i > 10) {
            break
        }

        i += 1
        await sleep(500)
    }
})
