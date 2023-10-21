<script lang="ts">
    import type { Writable } from "svelte/store";
    import type { ProgData } from "./data";
    export let progData: Writable<ProgData>

    let modified: {[seq: string]: boolean} = {}
    let toShow: string[] = []
    $:  console.log("toShpw", toShow)
    const seqRegExp = /(?<=\W)A\d{6,7}(?=\()/g
    $: searchCode($progData.code)
    function searchCode(code: string) {
        let seqs = code.match(seqRegExp)
        toShow = [...new Set(toShow.filter(v => modified[v]).concat(seqs))].sort()
        toShow = toShow.filter(v => typeof v === "string")
        function defaultValue(seq: string)  {
            return !code.match(new RegExp(seq + String.raw`\([^)]+\)=`))
        }
        toShow.forEach(seq => {
            if (!modified[seq]) selected[seq] = defaultValue(seq)
        })
    }

    const selected: {[seq: string]: boolean} = {}

    $: save(toShow, selected)
    function save(ts: typeof toShow, s: typeof selected) {
        $progData.importBfilesFor = ts.filter(seq => s[seq])
    }

    let addSeq = "A0"
    function handleToolboxChange(e: InputEvent) {
        let target = e.target as HTMLInputElement
        target.value = target.value.replaceAll(/\D/g, "")
        addSeq = "A" + target.value.padStart(6, "0")
    }
</script>

<h1>Import bfiles</h1>

{#if toShow.length}
    <p>
        {#each toShow as seq}
            <label for="toolbox--import-bfile-{seq}"><input type="checkbox" id="toolbox--import-bfile-{seq}" on:input={() => modified[seq] = true} bind:checked={selected[seq]}>{seq}</label><br>
        {/each}
    </p>
{/if}
<label for="toolbox--add-import-bfile">Import other bfile: A<input type="number" on:input={handleToolboxChange} id="toolbox--add-import-bfile"> </label><br>
{#if toShow.includes(addSeq)}
    <p style="color: red">This sequence's checkbox is already shown. ({selected[addSeq] ? "and selected" : "but not selected. check the checkbox instead"})</p>
{/if}
<button disabled={toShow.includes(addSeq)} on:click|preventDefault={() => {modified[addSeq] = true; selected[addSeq] = true; toShow.push(addSeq); toShow.sort()}}>Add</button>