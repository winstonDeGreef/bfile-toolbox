import requests
import concurrent.futures
from validate import parse

f1 = open("problems.txt", "a")
f2 = open("warnings.txt", "a")
t1 = 0
t2 = 0
f1.write("geee")
def process_number(i):
    zpadded = str(i).zfill(6)
    btext = requests.get(f"https://oeis.org/A{zpadded}/b{zpadded}.txt").text
    result = parse(btext)
    if not result[1].is_empty():
        print("A" + zpadded, result[1])
        t1 += 1
        f1.flush()
        f1.write(str(i) + "\n")
    elif not result[2].is_empty():
        print(zpadded, result[2])
        t2 += 1
        f2.flush()
        f2.write(str(i) + "\n")

with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
    for i in range(154, 1000):
        print(i)
        executor.submit(process_number, i)

f1.close()
f2.close()
