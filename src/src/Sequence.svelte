

<script lang="ts">
	import Code from "./Code.svelte";
    import { getStores } from "./data";
    import { errorToast } from "./toast";
    let {progData} = getStores();

    let error = false
    export let ourIndex: number
	document.getElementById("upload_bfile" + ourIndex).checked = true
    document.getElementById("upload_tt_" + ourIndex).innerText = document.getElementById("upload_tt_" + ourIndex).innerText.replace("TITLE FOR LINK", "Table of n, a(n) for n = MIN..MAX")
</script>
{#if !error}
    <Code {progData}/>
{/if}