

<script lang="ts">
	import Code from "./Code.svelte";
    import { getStores } from "./data";
    import { errorToast } from "./toast";
    let {progData} = getStores();
    let error = false
    if (globalThis.uploadCount !== 0) {
        error = true
        errorToast("already added one file before adding the b-file, this is not allowed")
    } else {
        globalThis.uploadCount = 1;
    }
    console.log("????? uploadCount = " + globalThis.uploadCount)
	document.getElementById("upload_bfile0").checked = true
    document.getElementById("upload_tt_0").innerText = document.getElementById("upload_tt_0").innerText.replace("TITLE FOR LINK", "Table of n, a(n) for n = MIN..MAX")
    document.getElementById("upload0").style.display = ""
</script>
{#if !error}
    <Code {progData}/>
{/if}