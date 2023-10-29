let version = "0.1"
console.log("HELLO???")
function loadCss(href) {
    let link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
}

function loadJs(src) {
    fetch(src).then(res => res.text()).then(code => {
        eval(code)
    })
}
loadCss(chrome.runtime.getURL(`versions/${version}/bundle.css`))
import (chrome.runtime.getURL(`versions/${version}/bundle.js`))