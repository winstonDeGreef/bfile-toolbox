<script lang="ts">
    import type { Writable } from "svelte/store";
    import type { ProgData } from "./data";
    import { Bfile } from "./Bfile";
    import { defaultToast } from "./toast";

    export let progData: Writable<ProgData>
    
    function parseBfileComments(text: string) {
        text
    }

    function importSettings() {
        if (input.match(/^A\d{6,7}$/)) {
            let bfile = new Bfile(input, false)
            defaultToast("downloading bfile")
            bfile.subscribe(_ => {

            })
        }
    }
    let input = ""
</script>
<p>
    <label for="toolkit--import">Import settings (put in either sequence, or the comments that contain the curly braces, {"{ and }"} ): <input bind:value={input} id="toolkit--import"> <button on:click|preventDefault={importSettings}>import</button></label>
</p>