import App from './App.svelte';
let container = document.createElement('div');
// add target after end of element #add_upload
let el = document.getElementById('add_upload')
if (!el) {
	// alert("BFile toolbox: catastrophic error, couldn't find the upload button.")
	throw ""
}
el.insertAdjacentElement('afterend', container);
el.insertAdjacentElement('afterend', document.createElement("br"));
let button = document.createElement('button');
button.innerHTML = 'open bfile toolbox';
button.addEventListener('click', e => {
	e.target.remove()
	e.preventDefault()
	let elements = ["upload0", "upload1", "upload2", "upload3", "upload4"].map(id => document.getElementById(id))
	let index = elements.findIndex(el => el && el.style.display === "none")
	if (index === -1) {
		alert("BFile toolbox: no available files. This extension expects the \"I want to upload a supporting file to store with the OEIS and add a link to it.\" link to be available")
		throw ""
	}
	let link = document.querySelector("#add_upload a")
	;(link instanceof HTMLElement) && link.click()
	new App({
		target: container,
		props: {
			ourIndex: index
		}
	})
})

container.appendChild(button);



export default {}