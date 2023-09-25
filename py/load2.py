import requests
saved = {}
def get(seq, pos):
    if saved[seq]:
        pass
    lines = requests.get(f"https://oeis.org/A{seq}/b{seq}.txt").text.split("\n")
    filter(lambda l: )