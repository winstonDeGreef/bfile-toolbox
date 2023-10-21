<script lang="ts" context="module">
    let nextId = 0
    export type DataUnit =  "b" | "kb" | "mb" | "gb";
</script>

<script lang="ts">
    let myId = nextId++
    export let id = `toolbox--data-size-input-${myId}`
    export let amount = 0
    export let unit: DataUnit = "b"
</script>

<input min=0 bind:value={amount}  type="number" {id} >
<select bind:value={unit}>
    <option value="b">B</option>
    <option value="kb">KB</option>
    <option value="mb">MB</option>
    <option value="gb">GB</option>
</select>

<style>
    input {
        width: 10ch;
    }
</style>