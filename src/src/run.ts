import { toast } from "@zerodevx/svelte-toast";
import { errorToast } from "./toast";

function textToUint8Array(text: string) {
    return new TextEncoder().encode(text);
}

function Unint8ArrayToText(array: Uint8Array) {
    return new TextDecoder().decode(array);
}   

export function run2(lang: "PARI", code: string, handleStdout: (text: string) => void, handleStderr: (text: string) => void) {
    const ws = new WebSocket("ws://localhost:8000/?command=gp")
    ws.binaryType = "arraybuffer"
    ws.onopen = () => {
        console.log("oppened")
        sendStdin(code)
        ws.onmessage = (event) => {
            let data = event.data
            if (data instanceof ArrayBuffer) {
                let binary = new Uint8Array(data)
                let text = Unint8ArrayToText(binary)
                if (text.startsWith("err ")) {
                    console.error(text.slice(4))
                } else if (text.startsWith("stdout ")) {
                    handleStdout(text.slice(7))
                } else if (text.startsWith("stderr ")) {
                    handleStderr(text.slice(7))
                } else {
                    console.log("Unknown message", text)
                }
            }
        }
    }

    function sendStdin(s: string) {
        ws.send(textToUint8Array("stdin " + s))
    }

    return {stop: () => {
        console.trace("kill from where")
            ws.send(textToUint8Array("kill"))
            setTimeout(_ => {
                if (ws.readyState === WebSocket.OPEN) console.error("send kill but websocket still open")
            }, 1000)
        },
        sendStdin
    }
}

export function run(lang, code) {
    return new Promise(res => {
        // open websocket to localhost 8765
        const ws = new WebSocket('ws://localhost:8765');
        ws.onopen = () => {
            // send lang {lang}
            // send code {code}
            // send run + space
            
            ws.onmessage = async (event) => {
                let text = ""
                // parse event.data in text
                if (typeof event.data === "string") {
                    text = event.data
                } else if (event.data instanceof Blob) {
                    text = await event.data.text()
                } else {
                    errorToast('Unknown data type')
                }
                // console.log("text", text)
                const t = text.split(' ', 1)[0];
                const data = text.slice(t.length + 1);
                if (t === 'error') {
                    errorToast(data)
                } else if (t === 'result') {
                    res(formatOutput(data));
                } else  {
                    console.log('Unknown response type', t)
                    console.log('text', text)
                }
            }
            
            ws.send(`lang ${lang}`);
            ws.send(`code ${code}`);
            ws.send('run ');

        }
        
    })
}

function formatOutput(output: string) {
    // TODO: sort output
    let str = output.split("\n").filter(line => line.startsWith("result ")).map(line => line.slice(7)).join("\n") + "\n\n"
    let blob = new Blob([str]);
    let filename = "b" + document.querySelector("[name=seq]").value.slice(1) + ".txt"
    let file = new File([blob], filename, {type: "application/octet-stream"});
    return file
}