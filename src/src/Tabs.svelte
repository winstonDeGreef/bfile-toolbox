<script lang="ts">
	import { onMount } from "svelte";

    export let tabNames: string[]
    export let opened = 0
    onMount(() => {
        if (!container) throw "container is null. How???"
        if (tabNames.length !== container.childElementCount) throw new Error("tabNames.length !== container.childElementCount")
        for (let child of container?.children) {
            child.style.display = "none"
        }
        container.children[opened].style.display = ""
    })
    let container: HTMLDivElement|null = null
</script>
<div class="tabs">
    {#each tabNames as name, i}
        <div class="tab">
            <button class="tabselector" class:selected={i===opened} on:click|preventDefault={() => {
                if (!container) throw "container is null. How???"
                container.children[opened].style.display = "none"
                container.children[i].style.display = ""
                opened = i
            }}>{name}</button>
        </div>
    {/each}
</div>

<div class="container" bind:this={container}>
    <slot/>
</div>

<style>
    .tabs {
        border-bottom: 1px solid #dee2e6;
    }

    .container {
        border: 1px solid #dee2e6;
        border-top: none;
        padding: 0.5em;
    }

    .tabselector {
        display: inline-block;
        padding: 0.5em;
        border: none;
        cursor: pointer;
        background: none;
        min-width: 3em;
        text-align: center;
    }
    .tab {
        display: inline-block;
        margin-bottom: -1px;
    }
    .selected {
        border: 1px solid lightgray;
        border-bottom-color: white;
        border-radius: 0.25em 0.25em 0 0;
    }
</style>