<script lang="ts">
    import type { Writable } from "svelte/store";
    import type { RunStatus } from "./Code.svelte";
    import Tabs from "./Tabs.svelte";

    export let status: Writable<RunStatus>
</script>

{#if $status.running}
    <h1>Status</h1>
    <button on:click|preventDefault={() => $status.running && $status.cancel()}>Stop</button>
    <Tabs tabNames={["general", "stdout", "stderr"]}>
        <div><pre>{@html $status.statusInfoHTML}</pre>
        {#if $status.done}
            <p><strong>Done</strong></p>
        {/if}
        </div>
        <div><pre>{$status.stdout}</pre></div>
        <div><pre>{$status.stderr}</pre></div>
    </Tabs>
{/if}
{#if $status.error}
    <h1>Status</h1>
    <p><strong>error</strong>: {$status.message}</p>
{/if}