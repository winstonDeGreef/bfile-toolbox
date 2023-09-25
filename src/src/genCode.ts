import type { LengthGuessAlgorithm, ProgData } from "./data"

const PARI_BASE = (
`default(parisize, 50 * 1024 * 1024);
{CODE}
{LOOP}

print("done") \\ client processes line only after receiving newline. This makes sure that the done is recieved.
print("done")
`)

const EXPLICIT_LOOP = `
for(i={OFFSET}, 10000, s=Str(i, " ", {MAIN}(i)); if(length(s) > 1000, break); print(Str("result ", s));)
`

// for(i=0, 10000, s=Str(i, " ", a(i)); if(length(s) > 1000, break); print(Str("result ", s));)
const LIST_LOOP = `
vecmap(v, f) = {
    for(i=1, length(v), v[i] = f(v[i], i));
    v;
}
v=[0]
size=0
linelength = 0
sizes = {SIZES}
sizeindex = 1
{

    while((linelength <= 999) && (sizeindex <= #sizes),
        size = sizes[sizeindex];
        sizeindex++;
        print("listsize ", size)
        v={MAIN}(size);
        linelength = vecmax(vecmap(v, (x, i) -> length(Str(i-1+{OFFSET}, " ", x))));
        print("listresult ", v)
    )
}

\\\\ for(i=1, 10000+1-{OFFSET}, s=Str(i-1+{OFFSET}, " ", v[i]); if(length(s) > 1000, break); print(Str("result ", s)))
`

const CHECK_LOOP = `
amount_calculated = 0
for(i=)

`
function formatLengthFromLengthGuessAlgorithm(algo: LengthGuessAlgorithm, offset: number) {
    let outp: number[] = []
    
    if (algo.type === "custom") outp = algo.customGuesses
    else {
        let current = algo.start
        outp = [current]
        do {
            current += algo.increment
            outp.push(current)
        } while (current < 10000 - offset + 10)
    }

    return "[" + outp.join(", ") + "]"
    
}

export function genPari(code: string, main: string, type: ""|"list"|"explicit"|"check", offset: number, progData: ProgData) {
    if (!type) return ""
    if (type === "check") throw new Error("Not implemented")
    let loop = type === "list" ? LIST_LOOP : EXPLICIT_LOOP
    let result =  PARI_BASE
            .replaceAll("{LOOP}", loop)
            .replaceAll("{MAIN}", main)
            .replaceAll("{CODE}", code)
            .replaceAll("{OFFSET}", offset.toString())
    if (type === "list") result = result.replaceAll("{SIZES}", formatLengthFromLengthGuessAlgorithm(progData.listSettings.lengthGuessAlgorithm, offset))
    return result
}