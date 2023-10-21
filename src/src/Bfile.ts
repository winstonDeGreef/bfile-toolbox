import { toast } from "@zerodevx/svelte-toast"
import { errorToast } from "./toast"
import { writable, type Writable } from "svelte/store"

export type BfileListener = (value?: typeof Bfile.prototype.data) => void

export class Bfile {
    loading = true
    data?: ReturnType<typeof Bfile.parsebfile>
    subscribers: BfileListener[]
    constructor(public readonly id: string) {
        if (!id.match(/A\d{6|7}/)) return
        fetch("https://oeis.org/" + id + "/b" + id.slice(1) + ".txt").then(res => res.text()).then(text => {
            this.data = Bfile.parsebfile(text)
            this.loading = false
            this.subscribers.forEach(fn => fn(this.data))
        })
    }

    static parsebfile(text: string) {
        let lines = text.split("\n")
        lines = lines.map(line => line.trim())
        lines = lines.filter(line => !line.startsWith("#"))
        let linesSplit = lines.map(l => l.split(/\s+/))
        let data: {[index: number]: string} = {}
        linesSplit.forEach(line => {
            data[(line[0])] = line[1]
        })
        return {
            offset: parseInt(linesSplit[0][0]),
            data, 
        }
    }

    subscribe(fn: BfileListener) {
        const unsub = () => {
            this.subscribers = this.subscribers.filter(s => s !== fn)
        }
        this.subscribers.push(fn)
        fn(this.data)
        return unsub
    }

    static getNumFromSeq(seq: string) {
        return Number(seq.slice(1))
    }
}


type Progress = {
    currentSeq: string
    currentPos: string
    totalPos: string
    progressCurrent: string
    bytesCurrentDownloaded: string
    bytesCurrentTotal: string
}
export class ManyBfileWithProgress {
    static cache: {[seq: string]: string} = {}
    progress: Progress
    progressStore: Writable<Progress>
    outp: {[index: string]: ReturnType<typeof Bfile.parsebfile>} = {}
    donesubs: ((p: this["outp"]) => void)[] = []
    xhr: XMLHttpRequest|null = null
    canceled = false
    constructor(public seqs: string[]) {
        this.progress = {
            currentSeq: seqs[0],
            currentPos: "1",
            totalPos: seqs.length.toString(),
            progressCurrent: "0%",
            bytesCurrentDownloaded: "0",
            bytesCurrentTotal: "unknown"
        }
        this.progressStore = writable(this.progress)
        this.start()
    }

    cancel() {
        if (this.xhr) this.xhr.abort()
        this.canceled = true
    }

    ondone(fn: (p: this["outp"]) => void) {
        this.donesubs.push(fn)
    }

    async start() {
        for (let i = 0; i < this.seqs.length; i++) {
            console.log("start download of bfile")
            if (this.canceled) return
            this.progress = {
                currentSeq: this.seqs[i],
                currentPos: (i+ 1).toString(),
                totalPos: this.seqs.length.toString(),
                progressCurrent: "0%",
                bytesCurrentDownloaded: "0",
                bytesCurrentTotal: "unknown"
            }
            this.progressStore.set(this.progress)
            let text = await this.loadOne(this.seqs[i])
            if (typeof text !== "string") {
                errorToast("there was an error downloading the bfile for: " + this.seqs[i])
            } else {
                this.outp[this.seqs[i]] = Bfile.parsebfile(text)
            }
            if (this.canceled) return
            console.log("end download of bfile")

        }
        this.donesubs.forEach(s => s(this.outp))
    }

    loadOne(seq: string) {
        if (ManyBfileWithProgress.cache[seq]) return Promise.resolve(ManyBfileWithProgress.cache[seq])
        return new Promise(res => {
            let xhr = new XMLHttpRequest()
            xhr.open("GET", "https://oeis.org/" + seq + "/b" + seq.slice(1) + ".txt")
            xhr.onprogress = e => {
                this.progress.bytesCurrentDownloaded = e.loaded.toString()
                if (e.lengthComputable) {
                    this.progress.bytesCurrentTotal = e.total.toString()
                    let promiles = Math.floor(e.loaded / e.total * 1000)
                    this.progress.progressCurrent = `${promiles / 10}%`
                } else {
                    this.progress.progressCurrent = "unknown%"
                }
                this.progressStore.set(this.progress)
            }
            xhr.send()
            xhr.onload = () => {
                ManyBfileWithProgress.cache[seq] = xhr.responseText
                res(xhr.responseText)
            }
            xhr.onerror = () => {
                errorToast("there was a network error when downloading the bfile for: " + seq + ". Trying again")
                this.loadOne(seq).then(res)
            }
        })
    }
}

