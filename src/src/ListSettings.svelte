<script lang="ts">
    import { writable, type Writable } from "svelte/store";
    import type { ProgData } from "./data";
    export let progData: Writable<ProgData>

    let customGuessesText = ""

    function findIndexes<T>(arr: T[], callback: (v: T, prev?: T) => boolean) {
        let result: number[] = []
        for (let i = 0; i < arr.length; i++) {
            if (callback(arr[i], arr[i - 1])) result.push(i)
        }
        return result
    }

    function subtract<T>(arr1: T[], arr2: T[]): T[] {
        let result = []
        for (let value of arr1) {
            if (!arr2.includes(value)) result.push(value)
        }
    return result
    }

    function max(arr: number[]) {
        let m = -Infinity
        for (let v of arr) {
            if (v > m) m = v
        }
        return m
    }


    let lineDiagnostics: string[] = []
    let lineDiagnosticsStore = writable<string[]>([])
    function parseCustomGuessesTextAndUpdate(text: string) {
        let lines = text.split("\n")
        let guesses: number[] = []
        let lineDiagnostics = []
        let emptyLines = []
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i]
            
            let trimmed = line.trim()
            if (trimmed === "") {
                emptyLines.push(i)
                continue
            }
            let guess = Number(trimmed)
            if (Number.isNaN(guess)) {
                lineDiagnostics.push(`line ${i}: could not parse number (${trimmed})`)
                continue
            }
            if (!Number.isFinite(guess)) {
                lineDiagnostics.push(`line ${i}: number (absolute value) is too large to use (${trimmed})`)
            }
            guesses.push(guess)
            
            
        }
        let floats = findIndexes(guesses, v => !Number.isInteger(v))
        let unsafeInts = findIndexes(guesses, v => !Number.isSafeInteger(v))
        unsafeInts = subtract(unsafeInts, floats)
        let decreases = findIndexes(guesses, (n: number, prev?: number) => {
            if (typeof prev !== "number") return false
            return prev > n
        })
        let repeats = findIndexes(guesses, (n, p) => n === p)
        
        if (decreases.length) {
            lineDiagnostics.push(`A guess is immediately followed by a smaller one at the following valid guess indexes (this makes no sense and is a waste of computing): ${decreases.join(", ")}.`)
        }

        if (repeats.length) {
            lineDiagnostics.push(`A guess is followed by a duplicate at the following valid guess indexes (this makes no sense and is a waste of computing): ${repeats.join(", ")}`)
        }

        if (floats.length) {
            lineDiagnostics.push(`The following guesses (valid guess indexes listed) are not integers, this could lead to a bunch of errors because these guesses are expected to be integers: ${floats.join(", ")}`)
        }

        if (unsafeInts.length) {
            lineDiagnostics.push(`The following guesses (valid guess indexes listed) are too large to be stored effectively in a 64bit float, causing roundoff errors: ${unsafeInts.join(", ")}`)
        }

        if (max(guesses) < 10001 - $progData.offset) {
            lineDiagnostics.push(`the largest guess is less than the maximum possible amount of terms to generate. Largest guess: ${max(guesses)}, largest guess needed to insure calculation up to and including index 10000: ${10001 - $progData.offset} `)
        }

        // other errors
        if (guesses.length === 0) {
            lineDiagnostics.push(`no valid guesses`)
        }

        

        lineDiagnostics = lineDiagnostics
        lineDiagnosticsStore.set(lineDiagnostics)
        


        $progData.listSettings.lengthGuessAlgorithm.customGuesses = guesses
    }

    $: parseCustomGuessesTextAndUpdate(customGuessesText)

</script>

<h1>List settings</h1>
<p>
    <label for="toolbox--list-guess-algorithm">
        Length Guess Algorithm: 
        <select id="toolbox--list-guess-algorithm" bind:value={$progData.listSettings.lengthGuessAlgorithm.type}>
            <option value="linear">Linear (default)</option>
            <option value="custom">Custom</option>
        </select>
    </label>

</p>

{#if $progData.listSettings.lengthGuessAlgorithm.type === "linear"}
    <p>
        <label for="toolbox--list-linear-start">
            Start guess: <input id="toolbox--list-linear-start" type=number bind:value={$progData.listSettings.lengthGuessAlgorithm.start}>
        </label><br>
        <label for="toolbox--list-linear-increment">
            Increment: <input id="toolbox--list-linear-increment" type=number bind:value={$progData.listSettings.lengthGuessAlgorithm.increment}>
        </label>
    </p>

{:else if $progData.listSettings.lengthGuessAlgorithm.type === "custom"}
    <p>
        <label for="toolbox--list-custom-guess">
            Custom guesses: (one per line, blank and invalid lines are ignored)<br>
            <textarea bind:value={customGuessesText}></textarea>
        </label>
    </p>
    
    {#if $lineDiagnosticsStore.length}
        <p>
            <strong>There are some proplems with these guesses:</strong><br>
            {#each $lineDiagnosticsStore as l}
                {l}<br>
            {/each}
        </p>
    {/if}
    <p>
        parsed guesses: {$progData.listSettings.lengthGuessAlgorithm.customGuesses.join(", ")}
    </p>
{/if}

<style>
    textarea {
        width: 100%;
        resize: vertical;
        height: 10em;
    }
</style>