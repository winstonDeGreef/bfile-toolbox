<script lang="ts">
    import type { Writable } from "svelte/store";
    import { zodProgData, type ProgData } from "./data";
    import { joinFromLines } from "./LineSplitJson";
    import { prevent_default } from "svelte/internal";
    
    export let progData: Writable<ProgData>
    let importIsOpen = false
    let importText = ""
    let errorText = ""
    let oldProgData: undefined | ProgData = undefined
    let importCompleted = false
    function importSettings() {
        errorText = ""
        importCompleted = false
        let data: unknown
        try {
            console.log(joinFromLines(importText))
            data = JSON.parse(joinFromLines(importText))
        } catch (e) {
            errorText = "Settings are malformed: " + e.message
            return
        }
        if (typeof data !== "object" || data === null) {
            errorText = "Settings are malformed: not an object"
            return
        }
        let v = data.version
        if (v !== "0.1") {
            if (v === "0.0.0.1") {
                errorText = "importing from version 0.0.0.1 isn't supported because this was the general version used in development and has too many differences."
                return
            } else {
                errorText = `unknown version: ${v}`
                return
            }
        }
        let r = zodProgData.safeParse(data)
        if (r.success) {
            let parsed = r.data
            if (parsed.sequenceId !== $progData.sequenceId) {
                errorText = "sequenceId of imported isn't the sequence currently editing. Please go to the correct sequence page"
                return
            }
            oldProgData = $progData
            $progData = parsed
            importCompleted = true
            console.log("imported!", {importCompleted})
        } else {
            errorText = "while trying to parse the settings, the following issues were encountered: " + r.error.issues.map(issue => `${issue.path.join(".")}: ${issue.message}`).join("\n\n")
            return
        }
    }

    function copyConfig() {
        let text = JSON.stringify($progData)
        navigator.clipboard.writeText(text)
    }

    function importFromClipboard() {
        navigator.clipboard.readText().then(text => {
            importText = text
            importSettings()
        })
    
    }
</script>

<h1>Import / export</h1>
<p>Go to the bfile and copy and paste the settings from there (you can leave the newlines and "#"s in)</p>
<button on:click|preventDefault={importFromClipboard}>Import config from clipboard</button>
{#if importCompleted}
    <p>Import completed. <button on:click|preventDefault={() => {if (oldProgData) {$progData = oldProgData; importCompleted = false} }}>Undo import</button></p>
{:else if errorText}
    <h3>Errors while importing</h3>
    <pre><code>{errorText}</code></pre>
{/if}
<br>
<button on:click|preventDefault={copyConfig}>Copy current config to clipboard</button>
<style>
    textarea {
        width: 100%;
        height: 100px;
        /* resize: vertical; */
    }
</style>