import App from './App.svelte';
let container = document.createElement('div');
// add target after end of element #add_upload
document.getElementById('add_upload').insertAdjacentElement('afterend', container);
document.getElementById('add_upload').insertAdjacentElement('afterend', document.createElement("br"));
let button = document.createElement('button');
button.innerHTML = 'open bfile toolbox';
button.addEventListener('click', () => {
	container.innerText = ""
	new App({
		target: container,
	});
})

container.appendChild(button);



export default {}