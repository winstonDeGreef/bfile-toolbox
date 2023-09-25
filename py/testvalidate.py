import requests
from validate import parse

f1 = open("problems.txt", "a")
f2 = open("warnings.txt", "a")
t1 = 0
t2 = 0

for i in range(154, 1000):
    print(i)
    zpadded = str(i).zfill(6)
    btext = requests.get(f"https://oeis.org/A{zpadded}/b{zpadded}.txt").text
    result = parse(btext)
    if not result[1].is_empty():
        print("A" + zpadded, result[1])
        t1 += 1
        if t1 % 10 == 0: f1.flush()
        f1.write(str(i) + "\n")
    elif not result[2].is_empty():
        print(zpadded, result[2])
        t2 += 1
        if t2 % 10 == 0: f2.flush()
        f2.write(str(i) + "\n")

# Note: 81, 108, A000115