import { toast } from "@zerodevx/svelte-toast";
import { errorToast } from "./toast";

function textToUint8Array(text: string) {
    return new TextEncoder().encode(text);
}

function Unint8ArrayToText(array: Uint8Array) {
    return new TextDecoder().decode(array);
}

function randomHex(length: number) {
    let result = ""
    for (let i = 0; i < length; i++) {
        result += Math.floor(Math.random() * 16).toString(16)
    }
    return result
}

export function serverIsValid(server: string, _: any): Promise<{error: boolean, message: string}> {
    return new Promise(res => {
        let hex = randomHex(8)
        let url = createUrl(server, "echo", [hex]);
        const ws = new WebSocket(url);
        ws.binaryType = "arraybuffer"

        let timeout = setTimeout(() => res({error: true, message: "Server took too long to respond."}), 3000)
        let errorTimeout: null | number = null
        let noMessageTimeout:null|number = null
        ws.onopen = () => {
            clearTimeout(timeout)
            noMessageTimeout = setTimeout(() => {
                res({error: true, message: "Server took too long to send a message."})
            }, 1000);
        }

        ws.onmessage = (event) => {
            if (noMessageTimeout !== null) clearTimeout(noMessageTimeout)
            if (errorTimeout === null) setTimeout(() => res({error: true, message: "Server responded with incorrect message."}), 1000)
            if (event.data instanceof ArrayBuffer) {
                let binary = new Uint8Array(event.data)
                let text = Unint8ArrayToText(binary)
                if (text.includes(hex)) {
                    console.log("success")
                    res({error: false, message: "Server is valid."})
                }
            }
        }

        ws.onerror = e => {
            res({
                error: true,
                message: "There was an error connecting to the server."
            })
        }
    })
}

function createUrl(server: string, command: string, args: string[] = []) {
    let url = new URL(server);
    url.protocol = "ws:";
    url.searchParams.set("command", command);
    args.forEach((arg, index) => {
        url.searchParams.set("arg" + index, arg);
    })
    return url;
}

export function run2(lang: "PARI", code: string, handleStdout: (text: string) => void, handleStderr: (text: string) => void, server: string) {
    const ws = new WebSocket(createUrl(server, "gp"))
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