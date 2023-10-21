<script lang="ts">
    import type { Writable } from "svelte/store";
    import type { RunStatus } from "./Code.svelte";
    import type { LANG, ProgData } from "./data";
    import Status from "./Status.svelte";
    import { Bfile } from "./Bfile";
    import { splitIntoLines } from "./LineSplitJson";

    export let status: Writable<RunStatus>
    export let progData: Writable<ProgData>
    let maxSequentialResult = 0
    function calculateMaxSequentialResult(s: typeof $status, p: typeof $progData) {
        if (!s.done) return
        let r = p.offset
        let result = s.result
        while (result[r] && r.toString().length + result[r].length + 1 <= 1000) r++
        r--
        if (r !== maxSequentialResult) {
            maxSequentialResult = r
        }
    }
    let viewingOutput = false
    $: calculateMaxSequentialResult($status, $progData)
    let wasDone = false
    
    let bfile = ""
    function doneUpdate(done: boolean) {
        if (!wasDone && done) createBfile()
        wasDone = done
    }

    $: doneUpdate($status.done)

    function generateHeader(modified = false) {
        return (modified ? "# Edited after generation\n" : "") + "# Generated with bfile toolbox (https://toolbox.winstondegreef.com) with the following settings (includes version):\n# "
                +  splitIntoLines(JSON.stringify($progData), 900) + "\n"
    }

    

    function sha256Hash(text: string) {
        let buffer = new TextEncoder().encode(text)
        return crypto.subtle.digest("SHA-256", buffer).then(hash => {
            let hexCodes = []
            let view = new DataView(hash)
            for (let i = 0; i < view.byteLength; i += 4) {
                let value = view.getUint32(i)
                let stringValue = value.toString(16)
                let padding = "00000000"
                let paddedValue = (padding + stringValue).slice(-padding.length)
                hexCodes.push(paddedValue)
            }
            return hexCodes.join("")
        })
    }

    let showingOldBfile = false
    progData.subscribe(_ => showingOldBfile = true)

    function createBfile() {
        $progData.timestamp = Date.now()
        
        setTimeout(_ => showingOldBfile = false, 0)
        unsaved = true
        let result = $status.result
        let truncate = $progData.shouldTruncate ? $progData.truncate : maxSequentialResult
        let offset = $progData.offset
        console.log($progData.includeHeader)
        bfile = $progData.includeHeader ? generateHeader() : ""
        
        let i = offset
        while (result[i] && i <= truncate) {
            let line = i + " " + result[i] + "\n"
            bfile += line
            i++
        }
        bfileEditable = false
        return bfile
    }

    let bfileEditable = false

    function enableBfileEdit(disable=false) {
        unsaved = true
        bfileEditable = !disable
        bfile = bfile.replace(/^(\#.*\n?)*/, generateHeader(!disable))
    }

    let unsaved = true
    let bfileFile: File|null = null
    function save(_: any) {
        console.log("saved")
        unsaved = false

        let blob = new Blob([bfile])
        let filename = "b" + $progData.sequenceId.slice(1) + ".txt"
        bfileFile = new File([blob], filename, {type: "text/plain"})

        let el = document.querySelector("[name=upload_file0]")
        let dataTransfer = new DataTransfer()
        dataTransfer.items.add(bfileFile)
        el.files = dataTransfer.files
    }

    function openBfile() {
        console.log(bfileFile)
        let url = URL.createObjectURL(bfileFile)
        open(url, "_blank")
        setTimeout(_ => URL.revokeObjectURL(url), 10000)
    }

    $: autoSave = !bfileEditable
    $: autoSave && save(bfile)

    let dataField = document.getElementById("edit_Data").innerText.split(", ")

    function compareDataField(result: Status["result"], offset: number, df: typeof dataField) {
        let maxl = Math.min(maxSequentialResult - offset + 1, df.length)
        
        for (let i =0; i < maxl; i++) {
            if (result[i + offset] !== df[i]) {
                return false
            }
        }
    }

    function compareLengthWithDataField(result: Status["result"], offset: number, df: typeof dataField) {
        return maxSequentialResult - offset + 1 < df.length
    }

    
    // function compareAccuracyWithOldBfile(result: Status["result"], offset: number, oldBfile: $Bfile) {
    //     if (!oldBfile.data) return true
        
    // }

    let oldBfile = new Bfile($progData.sequenceId)

</script>
{#if $status.done}
    <h1>Output</h1>
    <p>
        <label for="toolbox--should-truncate">
            <input type="checkbox" id="toolbox--should-truncate" bind:checked={$progData.shouldTruncate}>
            Truncate?
        </label>
        <br>
        <label for="toolbox--truncate">
            Truncate output to: <input disabled={!$progData.shouldTruncate} bind:value={$progData.truncate} type=number id="toolbox--truncate" min={$progData.offset} max={maxSequentialResult}> (max: {maxSequentialResult})
        </label>
    </p>
    <p><label for="toolbox--include-header"><input type="checkbox" id="toolbox--include-header" bind:checked={$progData.includeHeader}>  Include header with data about oeis toolbox?</label></p>
    <button on:click|preventDefault={() => createBfile()}>(re-)Generate bfile</button><br>
    {#if showingOldBfile}
        <p style="color: red">The settings for creating the bfile have changed. You need to re-generate the bfile (or run the script again to calculate the new values) to see this reflected.</p>
    {/if}
    <textarea disabled={!bfileEditable} bind:value={bfile} on:input={() => unsaved = true}></textarea><br>
    <button on:click|preventDefault={openBfile} disabled={!bfileFile}>Open in new tab</button>
    {#if !bfileEditable}
        <button on:click|preventDefault={()=> enableBfileEdit()} >Edit bfile directly</button>
    {/if}
    {#if !autoSave}
        <p>
            {#if unsaved}<span style='color: red'>The current version of the bfile is not saved</span><br> {/if}
            <button on:click|preventDefault={save}>Save</button>
        </p>
    {/if}
{/if}

<style>

    textarea {
        width: 100%;
        height: 10em;
    }
</style>