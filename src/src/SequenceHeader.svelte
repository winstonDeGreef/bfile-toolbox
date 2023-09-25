<script lang="ts" context="module">
    let nextId = 0
</script>

<script lang="ts">
	import type { Writable } from "svelte/store";
	import type { SequenceMeta } from "./data";

    let id = nextId++
    export let sequenceMeta: Writable<SequenceMeta>
    let message = ""

    $: updateSequence($sequenceMeta.id)
    function updateSequence(id: string) {
        console.log("id", id)
        if (id.length == 0) message = "id must not be empty"
        else if (!id.match(/^A\d{6,7}$/)) message = "id must start with A and be followed by 6 or 7 digits"
        else message = ""
    }
</script>

<label for="sequence-inp-{id}">
    <h1>Sequence <input id="sequence-inp-{id}" bind:value={$sequenceMeta.id}></h1>
</label>
<p>{message}</p>
<p>{$sequenceMeta.title}</p>

<style>
    input {
        font-size: 1em;
    }
</style>