import { writable } from "svelte/store"

export type LANG = "PARI"
export type LANG_OPTIONAL = LANG | ""
export type COMPUTE_TYPE = "list" | "explicit" | "check"

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
            }
        }),
    }
}