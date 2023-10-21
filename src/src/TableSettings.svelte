<script lang="ts">
    import type { Writable } from "svelte/store";
    import type { ProgData } from "./data";
    export let progData: Writable<ProgData>
</script>

<h1>Table/Triangle Explicit Settings</h1>
<p>
    Is it a...?<br>
    <label for="toolbox--table-table"   ><input type="radio" id="toolbox--table-table"    value="square"   name="toolbox--table-type" bind:group={$progData.tableSettings.type}> Table</label><br>
    <label for="toolbox--table-triangle"><input type="radio" id="toolbox--table-triangle" value="triangle" name="toolbox--table-type" bind:group={$progData.tableSettings.type}> Triangle</label><br>
</p>

{#if $progData.tableSettings.type === "square"}
    <p>
        <label for="toolbox-table-upward"><input type="checkbox" id="toolbox-table-upward" bind:checked={$progData.tableSettings.squareUpward}>Upward antidiagonal?</label>
    </p>
{/if}

<label for="toolbox--table-explicit-startx">start x (first argument): <input type="number" id="toolbox--table-explicit-startx" bind:value={$progData.tableSettings.xoffset}></label><br>
<label for="toolbox--table-explicit-starty">start y (second argument): <input type="number" id="toolbox--table-explicit-starty" bind:value={$progData.tableSettings.yoffset}></label><br>
<p>
</p>
<p>
</p>