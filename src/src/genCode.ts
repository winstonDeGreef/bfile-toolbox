import { Bfile } from "./Bfile"
import type { DataUnit } from "./DataSizeInput.svelte"
import type { COMPUTE_TYPE, LengthGuessAlgorithm, ProgData } from "./data"
import pariMemoizeLib from "./pariMemoizeLib"

const PARI_BASE = (
`
default(parisize,    {PARISIZE});
default(parisizemax, {PARISIZEMAX});

{CODE}
{LOOP}
`)

const EXPLICIT_LOOP = `
{
    for(i={OFFSET}, {MAXOFFSET}, s=Str(i, " ", {MAIN}(i)); if(length(s) > 1000, break); print(Str("result ", s)););
    print("done"); print("done");
}
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
        print("listsize ", size);
        v={MAIN}(size);
        linelength = vecmax(vecmap(v, (x, i) -> length(Str(i-1+{OFFSET}, " ", x))));
        print("listresult ", v)
    );
    print("done"); print("done");
}
`

const CHECK_LOOP = `
startcheck = {STARTCHECK}
i = startcheck
sendupdateevery = 500 \\\\ in ms
lastupdate = getwalltime()
{
    while (1, 
        if (getwalltime() - lastupdate > sendupdateevery,
            print("checkupto ", i);
            lastupdate = getwalltime();
        );
        if ({MAIN}(i),
            print("checkresult ", i)
        );
        i++
    );
    print("done"); print("done");
}
`

const GET_ROW_FROM_N = `get_row_from_n(n) = floor((sqrtint(1 + 8*n) - 1)  / 2)`
const ANTIDIAGONAL_WRAPPER = (upward: boolean) => `
${GET_ROW_FROM_N}
main_old = {MAIN}
a(n) = {
    my(row = get_row_from_n(n));
    my(remainder = n - row*(row+1)/2);
    my(a = row - remainder, b = remainder);
    ${!upward ? "my(t = b); b = a; a = t;" : ""}
    main_old(a + {XOFFSET}, b + {YOFFSET})
}`

const TRIANGLE_WRAPPER = `
${GET_ROW_FROM_N}
a(n) = {
    my(row = get_row_from_n(n));
    my(remainder = n - row*(row+1)/2);
    {MAIN}(row + {XOFFSET}, remainder + {YOFFSET})
}
`

const INCLUDE_MEMOIZE = pariMemoizeLib
const INCLUDE_MEMOIZE_SHORT = `\\\\ <memoize code> (press the view full code button below to see the generated code including libraries\n`

const LOAD_A = `
OEISSequenceData = Map()
loadSeq(seq) = if(!mapisdefined(OEISSequenceData, seq), mapput(OEISSequenceData, seq, Map())); n -> {
    my(M = mapget(OEISSequenceData, seq));
    if (mapisdefined(M, n), mapget(M, n),
        print("loaddata ", seq, " ", n);
        my(r = input());
        my(offset = r[1]);
        for(i = 0, #r - 2, mapput(M, offset + i, r[i + 2]));
        mapput(OEISSequenceData, seq, M);
        self()(n)
    )
}
`

function progDataToMaxIndex(progData: ProgData) {
    if (progData.limit.maxIndex.type === "index") {
        return progData.limit.maxIndex.maxIndex
    } else if (progData.limit.maxIndex.type === "antidiagonals") {
        let n = progData.limit.maxIndex.maxAntidiaonal
        return progData.offset + n * (n + 1) / 2 - 1 + progData.offset
    }
}

function dataSizeToNumber({amount, unit}: {amount: number, unit: DataUnit}) {
    let power = {"b": 0, "kb": 1, "mb": 2, "gb": 3}[unit]
    return `round(${amount} * 1024 ^ ${power})`
}

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

export function genPari(code: string, main: string, type: COMPUTE_TYPE, offset: number, progData: ProgData, shortened = true) {
    if (!type) return ""
    if (!["list", "explicit", "check", "table explicit"].includes(type)) throw new Error("unimplemented type:" + type)
    let loop = {list: LIST_LOOP, explicit: EXPLICIT_LOOP, check: CHECK_LOOP, "table explicit": EXPLICIT_LOOP}[type]
    if (type === "table explicit") {
        let base = progData.tableSettings.type === "triangle"
            ? TRIANGLE_WRAPPER
            : ANTIDIAGONAL_WRAPPER(progData.tableSettings.squareUpward)
        code += "\n" + base
                .replaceAll("{MAIN}", main)
                .replaceAll("{XOFFSET}", progData.tableSettings.xoffset.toString())
                .replaceAll("{YOFFSET}", progData.tableSettings.yoffset.toString())
        main = "a"
    }

    if (progData.importBfilesFor.length) {
        code = LOAD_A + progData.importBfilesFor.map(seq => `${seq} = loadSeq(${Bfile.getNumFromSeq(seq)})\n`).join() + code
    }

    let result =  PARI_BASE
            .replaceAll("{PARISIZE}", dataSizeToNumber(progData.langSettings.pari.parisize).toString())
            .replaceAll("{PARISIZEMAX}", dataSizeToNumber(progData.langSettings.pari.parisizemax).toString())
            .replaceAll("{LOOP}", loop)
            .replaceAll("{MAXOFFSET}", progDataToMaxIndex(progData).toString())
            .replaceAll("{MAIN}", main)
            .replaceAll("{STARTCHECK}", progData.checkSettings.checkStart.toString())
            .replaceAll("{CODE}", (progData.langSettings.pari.includeMemoize ? (shortened ? INCLUDE_MEMOIZE_SHORT : INCLUDE_MEMOIZE) : "") + code)
            .replaceAll("{OFFSET}", offset.toString())
    if (type === "list") result = result.replaceAll("{SIZES}", formatLengthFromLengthGuessAlgorithm(progData.listSettings.lengthGuessAlgorithm, offset))
    return result.trim() + "\n"
}