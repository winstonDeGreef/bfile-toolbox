// load stylesheet
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

// loadCss("http://localhost:8080/global.css")
loadCss("http://localhost:8080/build/bundle.css")
loadJs ("http://localhost:8080/build/bundle.js")