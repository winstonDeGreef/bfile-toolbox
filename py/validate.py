# an oeis data file is formatted like so:
# it contains data lines, empty lines and comment lines.
# data lines are formatted like so:
# -?\d+ -?d+
# comment lines start with a #
# empty lines are empty
# if an empty line is found between to data lines, the parser should warn
# if an line does not match any of this: the parser should error, except if an empty line contains whitespace
# file is in unicode, byte order marks are not allowed
import re
from dataclasses import dataclass, field

def first_few(l):
    p = 5
    r = l[0:p]
    if len(l) > p: r += ["..."]
    return ", ".join([str(v) for v in r])
    

@dataclass
class Problems:
    bom: bool = False
    non_ascii: bool = False
    non_printable: bool = False
    non_sequential_index: list[int] = field(default_factory=list)
    unknown_format: list[int] = field(default_factory=list)
    too_long_longest: int = -1
    def is_empty(self):
        return not any([self.bom, self.non_ascii, self.non_printable, len(self.non_sequential_index), len(self.unknown_format)])
    
    def __repr__(self) -> str:
        r = []
        if self.bom: r.append("bom")
        if self.non_ascii: r.append("non ascii")
        if self.non_printable: r.append("non printable characters (except LF)")
        if len(self.non_sequential_index): r.append(f"non sequential index at {first_few(self.non_sequential_index)}")
        if len(self.unknown_format): r.append(f"unknown format at {first_few(self.unknown_format)}")
        if self.too_long_longest != -1: r.append(f"too long longest line is {self.too_long_longest}")
        return "Problems: " + ". ".join(r)



@dataclass
class Warnings:
    cr: bool = False
    empty_line_with_whitespace: list[int] = field(default_factory=list)
    comment_line_with_whitespace: list[int] = field(default_factory=list)
    index_minus_zero: list[int] = field(default_factory=list)
    num_minus_zero: list[int] = field(default_factory=list)
    def is_empty(self):
        return not any([self.cr, len(self.empty_line_with_whitespace), len(self.comment_line_with_whitespace), len(self.index_minus_zero), len(self.num_minus_zero)])
    
    def __repr__(self) -> str:
        r = []
        if self.cr: r.append("contains CR")
        if len(self.empty_line_with_whitespace): r.append(f"empty line with whitespace at {first_few(self.empty_line_with_whitespace)}")
        if len(self.comment_line_with_whitespace): r.append(f"comment line beginning with whitespace at {first_few(self.comment_line_with_whitespace)}")
        if len(self.index_minus_zero): r.append(f"index is -0 at {first_few(self.index_minus_zero)}")
        if len(self.num_minus_zero): r.append(f"num is -0 at {first_few(self.num_minus_zero)}")
        return "Warnings: " + ". ".join(r)




def parse(bfile: str):
    # detect byte order mark
    problems = Problems()
    warnings = Warnings()
    if bfile[:3] == "\xef\xbb\xbf": problems.bom = True
    
    # detect characters outside of ascii code 32 upto and including 126
    if not bfile.isascii(): problems.non_ascii = True
    if not bfile.replace("\n", "").isprintable(): problems.non_printable = True

    # check that line endings are 
    if bfile.find("\r") != -1: warnings.cr = True

    lines = bfile.splitlines()
    # remove empty lines and commented
    def filer_line(line: str, i):
        if line == "": return False
        if line[0] == "#": return False
        if line.isspace():
            warnings.empty_line_with_whitespace.append(i)
            return False
        if line.strip()[0] == "#":
            warnings.comment_line_with_whitespace.append(i)
            return False
        return True
    
    lines = [line for i, line in enumerate(lines) if filer_line(line, i)]

    passed = {"longest_line": [0, 0], "last_index": 0}
    def parse_line(line: str, line_number: int, passed):
        # one line has the following format: /^(-?\d+) (-?\d+)$/
        match = re.match(r"^(-?\d+) (-?\d+)$", line)
        if match:
            # get first match group
            index = match.group(1)
            if index == "-0": warnings.index_minus_zero.append(line_number)
            index = int(index)
            num = match.group(2)
            if num == "-0": warnings.num_minus_zero.append(line_number)
            if len(num) > passed["longest_line"][0]: passed["longest_line"] = [len(num), line_number]
            if line_number != 1 and passed["last_index"] + 1 != index:
                problems.non_sequential_index.append(line_number)
            
            passed["last_index"] = index
            return index, num
        else:
            problems.unknown_format.append(line_number)
            return None
    
    for i, line in enumerate(lines):
        parse_line(line, i+1, passed)
    
    if passed["longest_line"][0] >= 1100: problems.too_long_longest = passed["longest_line"][1]
    
    return [], problems, warnings




