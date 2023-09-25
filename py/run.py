import asyncio
import subprocess
import threading
from websockets.server import serve
# data format: command + SPACE + data
# receive:
#   code: set code to execute
#   lang: set lang to execute
#   run: run code
#   cancel: stop running
# send:
#   err: error
#   stdout: program stdout
#   stderr: program stderr

def handlestdout(data, process):
    result = b""
    while True:
        line = process.stdout.readline()
        if line == b"":
            break
        result += line
        print(line.decode("utf-8"), end="")
    data["to_send"].append("result " + result.decode("utf-8"))

def run(data):
    if data["lang"] == "PARI":
        process = subprocess.Popen(["gp"], stdin=subprocess.PIPE, stdout=subprocess.PIPE)
        process.stdin.write(data["code"].encode("utf-8") + b"\n\n\n")
        process.stdin.close()
        print("running")
        # open thread to handle stdout
        threading.Thread(target=handlestdout, args=(data, process)).start()
        
    else:
        data["to_send"].append("err unsupported lang")


async def receive(websocket, data):
    async for message in websocket:
        command, contents = message.split(" ", 1)
        if command in ["code", "lang"]:
            data[command] = contents
        elif command == "run":
            run(data)
        elif command == "cancel":
            if data["running"]:
                data["to_send"].append("err cancel not implemented")
            else:
                data["to_send"].append("err cant cancel as program is not running")

async def send(websocket, data):
    while True:
        if len(data["to_send"]):
            await websocket.send(data["to_send"].pop(0))
        else:
            await asyncio.sleep(0.1)

async def handler(websocket):
    data = {
        "lang": "",
        "code": "",
        "running": False,
        "to_send": []
    }
    await asyncio.gather(
        receive(websocket, data),
        send(websocket, data)
    )

async def main():
    async with serve(handler, "localhost", 8765):
        await asyncio.Future()  # run forever

asyncio.run(main())
