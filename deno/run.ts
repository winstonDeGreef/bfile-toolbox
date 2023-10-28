// websocket interface is very simple
// /?command=command&arg0=a&arg1=b
// where args are passed as separate query params
// this will execute command with ?bash? (maybe different environment)
// deno will listen to messages. any starting with "stdin " + .* will be sent to the process (removing the stdin part)
// you can also send the kill message, which will kill the process
// stdout and stderr will be sent to the client, with the same preceding string
// err will be sent to the client with the preceding string "err "


// only works for ASCII text. not unicode
function binaryMatchesStart(binary: Uint8Array, text: string): boolean {
    if (text.length > binary.length) {
        return false;
    }
    for (let i = 0; i < text.length; i++) {
        if (text.charCodeAt(i) != binary[i]) {
            return false;
        }
    }
    return true;
}

// only works for ASCII text. not unicode
function binaryIsText(binary: Uint8Array, text: string): boolean {
    if (text.length !== binary.length) return false
    return binaryMatchesStart(binary, text)
}

async function handleStdReader(type: "out" | "err", reader: ReadableStreamDefaultReader<Uint8Array>, socket: WebSocket) {
    let prefix = "std" + type + " "
    // turn prefix into uint8array
    let prefixBinary = new Uint8Array(prefix.length);
    for (let i = 0; i < prefix.length; i++) prefixBinary[i] = prefix.charCodeAt(i);


    while (true) {
        let { value, done } = await reader.read();
        if (done || !value) break
        socket.send(concatUint8(prefixBinary, value));
    }
}

function concatUint8(a: Uint8Array, b: Uint8Array): Uint8Array {
    let result = new Uint8Array(a.length + b.length);
    result.set(a);
    result.set(b, a.length);
    return result;
}

function wait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function main(port: number) {
    return Deno.serve({port}, (req) => {
        if (req.headers.get("upgrade") != "websocket") {
            return new Response("this is a websocket only server", { status: 501 });
        }
        const queryParams = new URL(req.url).searchParams;
        const commandStr = queryParams.get("command");
        const args: string[] = [];
        
        for (let [key, value] of queryParams) {
            let match = key.match(/^arg(\d)+$/);
            if (match) args[parseInt(match[1])] = value;
        }

        if (!commandStr) {
            const { socket, response } = Deno.upgradeWebSocket(req);
            socket.addEventListener("open", () => {
                socket.send("err no command specified");
            });
    
            return response;
    
        }
    
        const command = new Deno.Command(commandStr, {
            args,
            stdin: "piped",
            stdout: "piped",
            stderr: "piped",
        });
        const process = command.spawn();
        
    
        const stdin = process.stdin.getWriter();
        const stdout = process.stdout.getReader();
        const stderr = process.stderr.getReader();
        
    
        const { socket, response } = Deno.upgradeWebSocket(req);
        socket.binaryType = "arraybuffer";
        
    
        handleStdReader("out", stdout, socket);
        handleStdReader("err", stderr, socket);
    
        process.status.then(_ => {
            socket.send("err proccess closed")
            console.log("process closed")
            // would kill, but this causes an internal error in deno
        })
    
        socket.addEventListener("message", (event) => {
            let data = event.data;
            if (!(data instanceof ArrayBuffer)) {
                socket.send(
                    "err invalid message type. expected ArrayBuffer, got" +
                    data.constructor.name,
                );
                return;
            }
    
            let binary = new Uint8Array(data);
    
            if (binaryIsText(binary, "kill")) {
                process.kill();
            } else if (binaryMatchesStart(binary, "stdin")) {
                let payload = binary.slice("stdin ".length);
    
                stdin.write(payload).catch((err) => {
                    socket.send(
                        "err tried to write to stdin, but it failed: " + JSON.stringify(err),
                    );
                });
            } else {
                socket.send("err message was not kill or does not start with stdin");
            }
        });
    
        return response;
    });    
}

const defaultPort = 3946
let port = defaultPort

while (true) {
    try {
        let server = main(port)
        if (port !== defaultPort) {
            console.log(`Pay attention: not using default port. You will need to change the url on the oeis page`)
        }
        break
        
    } catch (e) {
        if (e instanceof Deno.errors.AddrInUse) {
            console.log(`port ${port} already in use, retrying on ${port + 1}`)
            port++
        } else {
            console.error(e)
        }
    }
}