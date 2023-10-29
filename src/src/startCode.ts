import type { Writable } from "svelte/store";
import type { ProgData } from "./data";
import type { RunStatus } from "./Code.svelte";
import { run2 } from "./run";
import { ManyBfileWithProgress } from "./Bfile";

class BufferedByLine {
    buffer = ""
    stopped = false
    constructor(public onLine: (line: string) => void, ) {}
    write(s: string) {
        if (this.stopped) return
        this.buffer += s
        let lines = this.buffer.split("\n")
        this.buffer = lines.pop()
        for (let line of lines) {
            this.onLine(line)
        }
    }

    stop() {
        this.stopped = true
    }
}

function resultLineMaxLength(result: {[i: number]: string}) {
    function one(i: string, v: string) {
        return i.length + v.length + 1
    }
    let max = 0
    for (let i in result) {
        max = Math.max(max, one(i, result[i]))
    }
    return max
}

export function startCode(data: ProgData, code: string, status: Writable<RunStatus>, server: string) {
    if (!data.lang) {
        status.set({running: false, error: true, message: "no language selected"})
        return
    }
    let result: {[i: number]: string} = {}
    let checkResult = [] // different because unsorted if parallel
    let checkedUpTo = data.checkSettings.checkStart
    let maxResultLength = 0
    let resultsCalculated = 0
    let statusInfoHTML = ""
    let IThrowwedError = false
    let sequentialResultCalculated = 0
    let currentListSize: null | string/* of number */ = null
    let lastListSize   : null | string/* of number */ = null
    function updateSequentialResultCalculated() {
        while (result[data.offset + sequentialResultCalculated]) {
            sequentialResultCalculated++
        }
    }
    function handleStdLine(s: string) {
        if (stdOutBuffer.stopped) return
        if (s.startsWith("done")) {
            MyCancel(); 
        }
        if (s.startsWith("result ")) {
            let command = s.split(" ")
            if (command.length !== 3) {
                status.set({running: false, error: true, message: "invalid result command: too many or too little spaces: " + s})
                cancel()
                return
            }
            let [_, i, v] = command
            result[parseInt(i)] = v
            maxResultLength = Math.max(maxResultLength, i.length + v.length + 1)
            resultsCalculated++
            updateSequentialResultCalculated()
            statusInfoHTML = "results calculated: " + resultsCalculated + "<br>max result length: " + maxResultLength + "<br>current result length: " + (i.length + v.length + 1) + "<br>sequential results calculated: " + sequentialResultCalculated
        } else if (s.startsWith("listresult ")) {
            let list = s.slice("listresult ".length)
            let listSplit = list.slice(1, list.length - 1).split(", ")
            for (let i = 0; i < listSplit.length; i++) {
                console.log("result[i + data.offset] && result[i + data.offset] !== listSplit[i]", result[i + data.offset] && result[i + data.offset] !== listSplit[i])
                if (result[i + data.offset] && result[i + data.offset] !== listSplit[i]) {
                    status.set({running: false, error: true, message: "listresult doesn't match previous result: " + result[i + data.offset] + " !== " + listSplit[i] +" at index " + (i + data.offset)})
                    status.set({running: false, error: true, message: `listresult doesn't match previous result: ${result[i + data.offset]} !== ${listSplit[i]} at index ${i + data.offset}. Last size passed to the main function: ${lastListSize}, current size passed to the main function: ${currentListSize}}`})
                    IThrowwedError = true
                    return
                }
                result[i + data.offset] = listSplit[i]
            }
            resultsCalculated = listSplit.length
            maxResultLength = resultLineMaxLength(result)
            statusInfoHTML = "results calculated: " + resultsCalculated + "<br>max result length: " + maxResultLength
        } else if (s.startsWith("listsize ")) {
            let r = s.slice("listsize ".length)
            lastListSize = currentListSize
            currentListSize = r
        } else if (s.startsWith("checkresult ")) {
            let r = s.slice("checkresult ".length)
            checkResult.push(r)
            if ( isFinite(Number(r))) checkedUpTo = Math.max(checkedUpTo, Number(r))
            if (checkResult.length - 2 + data.offset >= data.maxResult) {
                MyCancel()
            }
            statusInfoHTML = "check results calculated: " + checkResult.length + "<br>checked up to: " + checkedUpTo
        } else if (s.startsWith("checkupto ")) {
            let r = s.slice("checkresult ".length)
            if ( isFinite(Number(r))) checkedUpTo = Math.max(checkedUpTo, Number(r))
            statusInfoHTML = "check results calculated: " + checkResult.length + "<br>checked up to: " + checkedUpTo
        } else if (s.startsWith("loaddata ")) {
            let r = s.slice("loaddata ".length)
            let [seq, pos] = r.split(" ")
            let posParsed = parseInt(pos)
            let bfile = bfiledata["A" + seq.padStart(6, "0")]
            let block = Math.floor(posParsed / data.bfileIdealTransferBlocksize) * data.bfileIdealTransferBlocksize
            let startPos = bfile.offset + block
            let toSend = `[${startPos}`
            
            for (let i = 0; i < data.bfileIdealTransferBlocksize && bfile.data[startPos + i]; i++) toSend += "," + bfile.data[startPos + i]
            toSend += "]\n"
            sendStdin(toSend)

        }
    }

    let stdOutBuffer = new BufferedByLine(handleStdLine)
    let stdout = "", stderr = ""
    function MyCancel() {
        if (data.type === "check") {
            checkResult.map(BigInt).sort()
            for (let i = 0; i < checkResult.length; i++) {
                result[i + data.offset] = checkResult[i]
            }
        }
        if (IThrowwedError) return
        cancel();
        console.log("DOOONe");
        update(true);
        stdOutBuffer.stop();
    }

    function update(done = false) {
        if (stdOutBuffer.stopped || IThrowwedError) return
        status.set({running: true, error: false, stderr, stdout, cancel: MyCancel, statusInfoHTML, result, done})
    }

    function stdoutEvent(s: string) {
        stdout += s
        // NOTE: even though in testing all messages and with newline, just to be sure that a very long line isn't sent in two parts doesn't cause any errors.
        stdOutBuffer.write(s)
        update()
    }

    function stderrEvent(s: string) {
        stderr += s
        update()
    }

    function downloadBfiles() {
        let noMoreUpdates = false
        if (!data.importBfilesFor.length) {
            let statusHTML = `Starting code...`
            status.set({running: true, error: false, stderr: "", stdout: "", cancel: MyCancel, statusInfoHTML: statusHTML, result, done: false})
            console.log("????????")
            // noMoreUpdates=true
            let returnValue = run2(data.lang, code, stdoutEvent, stderrEvent, server)
            cancel = returnValue.stop
            sendStdin = returnValue.sendStdin
            return
        }
        let bfiles = new ManyBfileWithProgress(data.importBfilesFor)
        let downloadCancel = () => {
            bfiles.cancel()
            status.set({running: true, error: false, stderr: "", stdout: "", cancel: downloadCancel, statusInfoHTML, result, done: true})
        }
        bfiles.progressStore.subscribe(progress => {
            if (noMoreUpdates) return
            let statusHTML = `
            downloading bfile of ${progress.currentSeq} ${progress.currentPos}/${progress.totalPos}...<br>
            progress: ${progress.bytesCurrentDownloaded} bytes / ${progress.bytesCurrentTotal} (${progress.progressCurrent})
            `
            status.set({running: true, error: false, stderr: "", stdout: "", cancel: downloadCancel, statusInfoHTML: statusHTML, result, done: false})
        })

        bfiles.ondone(outp => {
            bfiledata = outp
            noMoreUpdates = true
            let statusHTML = `Starting code...`
            status.set({running: true, error: false, stderr: "", stdout: "", cancel: MyCancel, statusInfoHTML: statusHTML, result, done: false})
            console.log("set HTML")
            let returnValue = run2(data.lang, code, stdoutEvent, stderrEvent, server)
            cancel = returnValue.stop
            sendStdin = returnValue.sendStdin
        })
        
    }
    
    let cancel: ReturnType<typeof run2>["stop"]
    let sendStdin: ReturnType<typeof run2>["sendStdin"]
    let bfiledata: (typeof ManyBfileWithProgress)["prototype"]["outp"]
    downloadBfiles()
}