export function splitIntoLines(s: string, maxLength: number) {
    let r = ""
    while (s.length > 0) {
        r += s.slice(0, maxLength) + "\n# "
        s = s.slice(maxLength)
    }
    return r.slice(0, -3)
}

export function joinFromLines(s: string) {
    return s.replaceAll("\n# ", "")
}