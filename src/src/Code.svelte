<script context="module" lang="ts">
    let nextId = 0
    export type RunStatus = {
        running: false,
        error: false,
    } | {
        error: false,
        running: true,
        stdout: string,
        stderr: string,
        cancel: () => void,
        statusInfoHTML: string,
        result: {[i: number]: string},
        done: boolean
    } | {
        running: false,
        error: true,
        message: string,
    }
    
</script>

<script lang="ts">
	import { writable, type Writable } from "svelte/store";
    import type { COMPUTE_TYPE, ProgData } from "./data"
    import { genPari } from "./genCode";
    import { run, run2 } from "./run";
    import Status from "./Status.svelte";
    import { startCode } from "./startCode";
    import Output from "./Output.svelte";
    import ListSettings from "./ListSettings.svelte";
    let id = nextId++
    const VALID_LANGS = ["PARI"]
    const FUNC_MAP:{[func: string]: COMPUTE_TYPE} = {a: "explicit", lista: "list", isok: "check"}

    let runStatus = writable<RunStatus>({running: false, error: false})

    export let progData: Writable<ProgData>

    let codeEl: HTMLTextAreaElement|null = null
    let previousCode = ""
    // TODO: if type or main is modified and then immediately overwritten by updateCode, show the user a warning
    $: updateCode($progData.code)
    function updateCode(code: string) {
        // detect lang
        let match = code.match(/^\((\w+)\)/)
        if (match) {
            let lang = match[1]
            if (VALID_LANGS.includes(lang)) {
                // save selection in codeEl
                if (!codeEl) throw "codeEl is null. How???"
                let start = codeEl.selectionStart
                let end = codeEl.selectionEnd
                let newCode = code.slice(match[0].length).trimStart()
                let deltaLength = code.length - newCode.length
                // update code
                $progData.code = newCode
                // update lang
                $progData.lang = lang
                // restore selection
                codeEl.selectionStart = Math.max(start - deltaLength, 0)
                codeEl.selectionEnd =   Math.max(end   - deltaLength, 0)
                code = newCode
            }
        }
        // detect type
        let updatedMain = false
        for(let key of Object.keys(FUNC_MAP)) {
            if (code.startsWith(key + "(")) {
                $progData.main = key
                updatedMain = true
                break
            }
        }
        if (!updatedMain) $progData.main = ""
        previousCode = code
    }

    $: updateType($progData.main)
    function updateType(main: string) {
        if (main in FUNC_MAP) $progData.type = FUNC_MAP[main]
    }

    let resultingCode = ""
    let offset = Number(document.getElementById("edit_Offset").innerText.split(",")[0])
    $: $progData.offset = offset
    $: resultingCode= genPari($progData.code, $progData.main, $progData.type, offset, $progData)
</script>

<!-- inputs -->
<!-- lang: dropdown, select between empty and PARI -->
<!-- code: textarea -->
<!-- type: dropdown, explicit or list -->
<!-- main function: text -->
<label for="lang-{id}">Language:
    <select id="lang-{id}" bind:value={$progData.lang}>
        <option value=""></option>
        <option value="PARI">PARI</option>
    </select>
</label>
<br>
<label for="code-{id}">Code: <br>
    <textarea id="code-{id}" bind:this={codeEl} bind:value={$progData.code}></textarea>
</label><br>
<label for="type-{id}">Type:
    <select id="type-{id}" bind:value={$progData.type}>
        <option value="explicit">Explicit</option>
        <option value="list">List</option>
        <option value="check">Check</option>
    </select>
</label>
<br>
<label for="main-{id}">Main function:
    <input id="main-{id}" bind:value={$progData.main}>
</label><br>

{#if $progData.type === "list"}
    <ListSettings {progData}/>
{/if}

<!-- <button type="button" on:click={() => run($progData.lang, resultingCode).then(file => {
    console.log(file)
    let el = document.querySelector("[name=upload_file0]")
    let dataTransfer = new DataTransfer()
    dataTransfer.items.add(file)
    el.files = dataTransfer.files
})}>Run</button> -->
<h1>Run</h1>
<button on:click|preventDefault={() => startCode($progData, resultingCode, runStatus)}>run</button>

<h1>Generated code:</h1>
<code><pre>{resultingCode}</pre></code>

<Status bind:status={runStatus}/>
<Output status={runStatus} {progData}/>

<style>
    textarea {
        width: 100%;
        height: 100px;
        resize: vertical;
    }
</style>