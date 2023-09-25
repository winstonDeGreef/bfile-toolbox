<script lang="ts">
	import type { Writable } from "svelte/store";
	import { isValidSequenceId, type SequenceMeta } from "./data";
	import { errorToast } from "./toast";

    export let sequenceMeta: Writable<SequenceMeta>
    let fetching = false
    function update() {
        let sequence = $sequenceMeta.id
        if (fetching) {
            errorToast("already getting sequence entry")
        } else if (!isValidSequenceId(sequence)) {
            errorToast("invalid sequence id")
        } else {
            fetching = true
            let controller = new AbortController()
            let signal = controller.signal
            // signal.addEventListener("abort", () => {
            //     fetching = false
            // })
            fetch(`https://oeis.org/${sequence}`)
                .then(res => res.text())
                .then(text => {
                let doc = new DOMParser().parseFromString(text, "text/html")
                let el = doc.querySelector("body > center:nth-child(3) > table > tbody > tr > td > center:nth-child(2) > table")
                let titleEl = el?.querySelector("tbody > tr > td:nth-child(3)")
                let offsetEl = el?.querySelector("tbody > tr:nth-child(5) > td > table > tbody > tr > td:nth-child(3)")
                $sequenceMeta.title = titleEl?.innerText || ""
                $sequenceMeta.offset = (offsetEl?.innerText || "0,0").trim().split(",")[0]
                $sequenceMeta.entryHTML = el?.outerHTML ?? ""
                
            }).catch(console.error)
        }
    }
</script>
<!-- TODO: oeis styles -->
<!-- TODO: when sequence changes, run update automatically -->
<div>
    <button on:click={update}>update</button>
    <div>
        {@html $sequenceMeta.entryHTML}
    </div>
</div>
