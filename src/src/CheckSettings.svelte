<script lang="ts">
    import type { Writable } from "svelte/store";
    import type { ProgData } from "./data";
    export let progData: Writable<ProgData>
</script>

<h1>Check</h1>
<p>
    <label for="toolbox--checkstart">Check start: <input type="number" bind:value={$progData.checkSettings.checkStart} id="toolbox--checkstart"></label>
</p>