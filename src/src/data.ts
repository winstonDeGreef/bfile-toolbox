import { writable } from "svelte/store"
import type { DataUnit } from "./DataSizeInput.svelte"

export type LANG = "PARI"
export type LANG_OPTIONAL = LANG | ""
export type COMPUTE_TYPE = "list" | "explicit" | "check" | "table explicit"

export type ProgData = {
    lang: LANG_OPTIONAL,
    code: string,
    type: COMPUTE_TYPE,
    main: string,
    offset: number
    truncate: number,
    shouldTruncate: boolean,
    version: "0.0.0.1",
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
            version: "0.0.0.1",
            sequenceId: document.getElementsByName("seq")[0].value || "",
            includeHeader: true,
            listSettings: {
                lengthGuessAlgorithm: {
                    type: "linear",
                    start: 100,
                    increment: 100,
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