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
    lengthGuessAlgorithm: zod.object({
        type: zod.enum(["linear", "custom"]),
        start: zod.number(),
        increment: zod.number(),
        customGuesses: zod.array(zod.number())
    })
})

let zodDataUnit = zod.enum(["b", "kb", "mb", "gb"])

export let zodProgData = zod.object({
    lang: zod.enum(["PARI", ""]),
    code: zod.string(),
    type: zodComputeType,
    main: zod.string(),
    offset: zod.number(),
    truncate: zod.number(),
    shouldTruncate: zod.boolean(),
    version: zod.literal("0.1"),
    includeHeader: zod.boolean(),
    sequenceId: zod.string(),
    listSettings: zodListSettings,
    checkSettings: zod.object({
        checkStart: zod.number(),
    }),
    tableSettings: zod.object({
        xoffset: zod.number(),
        yoffset: zod.number(),
        type: zod.enum(["triangle", "square"]),
        squareUpward: zod.boolean(),
    }),
    langSettings: zod.object({
        pari: zod.object({
            parisize: zod.object({
                amount: zod.number(),
                unit: zodDataUnit
            }),
            parisizemax: zod.object({
                amount: zod.number(),
                unit: zodDataUnit
            }),
            includeMemoize: zod.boolean()
        })
    }),
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
    })
})

export type ProgData = zod.infer<typeof zodProgData>


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
    maxResult: number,
    importBfilesFor: string[],
    bfileIdealTransferBlocksize: number,
    timestamp: number,
    limit: {
        maxLineLength: number,
        maxIndex: {
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
        }),
    }
}