# run gp t0.gp and print recieved chunk every time that a piece of stdout is recieved
import subprocess
process = subprocess.Popen(['gp', 't0.gp'], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
while True:
    output = process.stdout.read(1)
    if output == '' and process.poll() is not None:
        break
    if output:
        print(output.strip())