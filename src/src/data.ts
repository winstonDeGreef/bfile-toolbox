import { writable } from "svelte/store"
import type { DataUnit } from "./DataSizeInput.svelte"
import type { ProgDataV0_0_0_1 } from "./datav0.0.0.1"
import { errorToast } from "./toast"
import {ZodError, z as zod} from "zod"

export type LANG = "PARI"

export type LANG_OPTIONAL = LANG | ""
export type COMPUTE_TYPE = "list" | "explicit" | "check" | "table explicit"

function upgrade(prev: ProgDataV0_0_0_1): ProgData {
    errorToast("importing from version 0.0.0.1 isn't supported because this was the general version used in development and has too many differences.")
    throw new Error("upgrading from version")
}
let parseErrors = []

let zodComputeType = zod.enum(["list", "explicit", "check", "table explicit"])

let zodListSettings = zod.object({
    // when calculating the sequence, we need to provide guesses for how many numbers the main function should calculate.
    lengthGuessAlgorithm: zod.object({
        // If the algorithm is linear, start at start and increase the guess by increment each time
        // If the algorithm is custom, use the custom guesses provided by the user.
        type: zod.enum(["linear", "custom"]),
        start: zod.number(),
        increment: zod.number(),
        customGuesses: zod.array(zod.number())
    })
})

let zodDataUnit = zod.enum(["b", "kb", "mb", "gb"])

export let zodProgData = zod.object({
    // the language that code is in
    lang: zod.enum(["PARI", ""]),
    
    // the code for the function that actually computes the sequence
    code: zod.string(),

    // the type of computation function that code is.
    // List means that the function returns a list of values of length of the first parameter passed.
    // Explicit means that the function returns a single value, the nth value of the sequence.
    // Check means that the function returns a boolean, true if n is in the sequence
    // table explicit: this is actually for tables and triangles. The function has two arguments, n and k. If it is a table, n and k are the row and column. If it is a triangle n is the row and k is the position in said row. Only regular triangles are supported.
    type: zodComputeType,

    // the function specified in code that computed the sequence.
    main: zod.string(),

    // the offset of the sequence. Parsed directly from the offset field of the sequence.
    offset: zod.number(),

    // If you calculate too many terms, the resulting bfile can be truncated for n <= truncate
    truncate: zod.number(),

    // If the resulting bfile should be truncated
    shouldTruncate: zod.boolean(),

    // version of the progData
    version: zod.literal("0.1"),

    // If the header saying that the bfile was generated with this program, and what settings were used should be included in said bfile.
    includeHeader: zod.boolean(),

    // the A number of the sequence. Parsed automatically from a hidden input field with name=seq
    sequenceId: zod.string(),

    // settings for the list computation type
    listSettings: zodListSettings,

    // settings for the check computation type
    checkSettings: zod.object({
        // what the first n to check is.
        checkStart: zod.number(),
    }),

    // settings for the table computation type
    tableSettings: zod.object({
        // the start value for the first parameter of the main function
        xoffset: zod.number(),

        // the start value for the second parameter of the main function
        yoffset: zod.number(),

        // if it is a table or a triangle
        type: zod.enum(["triangle", "square"]),

        // if this is true, read table by upward antidiagonals instead of downward antidiagonals
        squareUpward: zod.boolean(),
    }),

    // settings specific to the programming language used to compute the sequence
    langSettings: zod.object({

        // settings specific to the PARI programming language
        pari: zod.object({

            // what to set the pari default called parisize to. This should probably be left to its default. Change parisizemax instead
            parisize: zod.object({
                // the amount of memory to allocate, multiplied by unit
                amount: zod.number(),

                // the unit of memory to allocate
                unit: zodDataUnit
            }),
            parisizemax: zod.object({
                // the amount of memory to allocate, multiplied by unit
                amount: zod.number(),

                // the unit of memory to allocate
                unit: zodDataUnit
            }),

            // wether to import memoize library or not. see: http://user42.tuxfamily.org/pari-memoize/
            includeMemoize: zod.boolean()
        })
    }),

    // the maximum number of results to calculate when using 
    maxResult: zod.number(),
    importBfilesFor: zod.array(zod.string()),
    bfileIdealTransferBlocksize: zod.number(),
    timestamp: zod.number(),
    limit: zod.object({
        maxLineLength: zod.number(),
        maxIndex: zod.object({
            type: zod.enum(["antidiagonals", "index"]),
            maxAntidiaonal: zod.number(),
            maxIndex: zod.number()
        })
    }),
    bfileHashes: zod.object({}).catchall(zod.string())
})

export type ProgData = zod.infer<typeof zodProgData>
// type other = ProgData["bfileHashes"]

export type ProgData2 = {
    lang: LANG_OPTIONAL,
    code: string,
    type: COMPUTE_TYPE,
    main: string,
    offset: number
    truncate: number,
    shouldTruncate: boolean,
    version: "0.1",
    includeHeader: boolean,
    sequenceId: string,
    listSettings: ListSettings
    checkSettings: {
        checkStart: number,
    },
    tableSettings: {
        xoffset: number,
        yoffset: number
        type: "triangle" | "square",
        squareUpward: boolean,
    },
    langSettings: {
        pari: {
            parisize: {
                amount: number,
                unit: DataUnit
            },
            parisizemax: {
                amount: number,
                unit: DataUnit
            },
            includeMemoize: boolean
        }
    },
    // maxResult: number,

    // import bfiles. This makes it easy to access a different sequence when computing the current one. For all bfiles listed here, calling Adddddd(n) will return the nth term of the sequence in the bfile.
    importBfilesFor: string[],

    // the bfile is not put into the code, but when Adddddd(n) is called, the function will check if it has it already, else it will print a special line to stdout which requests the value of the nth term. The client then sends a special line to stdin of the running program containing the nth term and some surrounding ones. The amount it will try to send is this number. its default is 100.
    bfileIdealTransferBlocksize: number,

    // the timestamp when the bfile was generated.
    timestamp: number,

    // Rules for automatically stopping the calculation of the sequence. This used to be implemented with hardcoded values, so it might have some issues surrounding it.
    limit: {

        // the maximum length of a line in the bfile. If a line is longer than this, the calculation of more terms will be stopped.
        maxLineLength: number,

        // the maximum index of a term in the sequence. If a term has an index larger than this, the calculation of more terms will be stopped.
        maxIndex: {
            // if index: calculate at most maxIndex terms
            // if antigiagonals: calculate at most maxAntidiagonal antidiagonals/rows. 
            type: "antidiagonals" | "index",
            maxAntidiaonal: number,
            maxIndex: number
        }
    },
}

export type ListSettings = {
    lengthGuessAlgorithm: LengthGuessAlgorithm
}

export type LengthGuessAlgorithm = {
    type: "linear",
    start: number,
    increment: number
} | {
    type: "custom",
    customGuesses: number[]
}

export type SequenceMeta = {
    id: string,
    title: string,
    entryHTML: string,
    offset: string
}

export function isValidSequenceId(id: string) {
    return !!id.match(/^A\d{6,7}$/)
}

export function getStores() {
    return {
        progData: writable<ProgData>({
            lang: "",
            code: "",
            type: "explicit",
            main: "",
            offset: 0,
            truncate: 0,
            shouldTruncate: false,
            version: "0.1",
            sequenceId: document.getElementsByName("seq")[0].value || "",
            includeHeader: true,
            listSettings: {
                lengthGuessAlgorithm: {
                    type: "linear",
                    start: 100,
                    increment: 100,
                    customGuesses: []
                }
            },
            checkSettings: {
                checkStart: 0,
            },
            tableSettings: {
                xoffset: 0,
                yoffset: 0,
                type: "square",
                squareUpward: false,

            },
            langSettings: {
                pari: {
                    parisize: {
                        amount: 50,
                        unit: "mb"
                    },
                    parisizemax: {
                        amount: 1,
                        unit: "gb"
                    },
                    includeMemoize: false
                },
            },
            maxResult: 10_000,
            limit: {
                maxLineLength: 1000,
                maxIndex: {
                    type: "index",
                    maxAntidiaonal: 150,
                    maxIndex: 10000
                }
            },
            importBfilesFor: [],
            bfileIdealTransferBlocksize: 100,
            timestamp: 0,
            bfileHashes: {},
        }),
    }
}