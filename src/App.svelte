<script lang="ts">
    import Sequence from "./src/Sequence.svelte";
    import { SvelteToast } from '@zerodevx/svelte-toast'
    export let ourIndex: number
</script>

<Sequence {ourIndex} />

<style>
</style>
<SvelteToast/>