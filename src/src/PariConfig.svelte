<script lang="ts">
    import type { Writable } from "svelte/store";
import DataSizeInput from "./DataSizeInput.svelte";
import type { ProgData } from "./data";

    export let progData: Writable<ProgData>
    let id1: string
    let id2: string
</script>
<h1>Pari</h1>
<p><label for="toolbox--include-memoize">
    <input type="checkbox" id="toolbox--include-memoize" bind:checked={$progData.langSettings.pari.includeMemoize}> include <a href="https://user42.tuxfamily.org/pari-memoize/index.html" target="_blank">memoize.gp</a>
</label></p>
<p>
    <label for={id1}>
        pari size max:
        <DataSizeInput bind:amount={$progData.langSettings.pari.parisizemax.amount} bind:unit={$progData.langSettings.pari.parisizemax.unit} id={id1} />
    </label>
</p>
<p>
    <label for={id2}>
        pari size (you shouldn't change this, change pari size max instead):
        <DataSizeInput bind:amount={$progData.langSettings.pari.parisize.amount} bind:unit={$progData.langSettings.pari.parisize.unit} id={id2} />
    </label>
</p>
