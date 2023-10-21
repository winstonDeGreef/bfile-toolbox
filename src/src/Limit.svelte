<script lang="ts">
    import type { Writable } from "svelte/store";
    import type { ProgData } from "./data";
    import { events } from "./Events";
    export let progData: Writable<ProgData>
    const ROW_TYPES = ["table explicit"]
    events.onComputeType((current) => {
        $progData.limit.maxIndex.type = ROW_TYPES.includes(current) ? "antidiagonals" : "index"
        console.log("eventtt")
    })
</script>

<h1>Limit output length</h1>
<p>
    <label for="toolbox--limit-line-length">Max line length: <input type="number" id="toolbox--limit-line-length" bind:value={$progData.limit.maxLineLength}></label>
</p>

<p>
    <label for="toolbox--limit-size-type">
        Max size type:
        <select id="toolbox--limit-size-type" bind:value={$progData.limit.maxIndex.type}>
            <option value="index">index</option>
            <option value="antidiagonals">antidiagonals</option>
        </select>
    </label>
</p>

{#if $progData.limit.maxIndex.type === "index"}
    <p>
        <label for="toolbox--limit-size-max-index">
            Max index: <input id="toolbox--limit-size-max-index" type="number" bind:value={$progData.limit.maxIndex.maxIndex}>
        </label>
    </p>
{:else if $progData.limit.maxIndex.type === 'antidiagonals'}
    <p>
        <label for="toolbox--limit-size-max-antidiagonal">
            Max antidiagonal count: <input id="toolbox--limit-size-max-antidiagonal" type="number" bind:value={$progData.limit.maxIndex.maxAntidiaonal} min=0>
        </label>
    </p>
{/if}
