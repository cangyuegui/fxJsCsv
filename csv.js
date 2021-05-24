function stringAllReplace(inString, inStrArg, inRepArg) {
    while (true) {
        let index = inString.indexOf(inStrArg)
        if (index >= 0) {
            inString = inString.replace(inStrArg, inRepArg)
        }
        else {
            break
        }
    }

    return inString
}


var STATE = {
    UN: 0,
    SP: 1,
    NR: 2
}

class CellAc {
    //构造函数
    constructor() {
        this.state = STATE.UN

        this.content = ''
        this.sp = ''
    }

    initz = function () {
        this.state = STATE.UN

        this.content = ''
        this.sp = ''
    }

}

function parseSplit(splitersObj) {
    var res = [] //stringList

    var last = ''//string
    var first = '' //string

    var sp = splitersObj.sp

    var lastCell = ''
    while (sp.length != 0) {
        var c = sp[sp.length - 1]
        sp = sp.substring(0, sp.length - 1)

        lastCell += c

        if (lastCell == "\"\"") {
            last = "\"" + last
            lastCell = ''
        }
    }

    first = lastCell

    res.push(first)
    res.push(last)

    splitersObj.sp = ''

    return res
}

function parseNormal(inObj) {
    //CellAc inObj.char string bool
    //inObj.cell, inObj.c, inObj.resContent, inObj.changeLine

    if (inObj.cell.state == STATE.UN) {
        if (inObj.c == '\"') {
            inObj.cell.sp += inObj.c
        }
        else if (inObj.c == ',' || inObj.c == '\n' || inObj.c == '\r') {
            inObj.cell.initz()
            inObj.resContent = ''
            inObj.changeLine = (inObj.c == ',' ? false : true)

            return true
        }
        else {
            if (inObj.cell.sp.length == 0) {
                inObj.cell.state = STATE.NR
                inObj.cell.content += inObj.c
            }
            else {
                var res = parseSplit(inObj.cell)

                if (res[0].length == 0) {
                    if (res[res.length - 1].length >= 1) {
                        if (inObj.c == ',' || inObj.c == '\n' || inObj.c == '\r') {
                            var rRes = res[res.length - 1]
                            rRes.shift()
                            inObj.cell.initz()
                            inObj.resContent = rRes

                            inObj.changeLine = (inObj.c == ',' ? false : true)

                            return true
                        }
                        else {
                            var rRes = res[res.length - 1]
                            rRes.shift()
                            inObj.cell.sp = ''
                            inObj.cell.content = rRes
                            inObj.cell.content += inObj.c
                            inObj.cell.state = STATE.SP
                            return false
                        }
                    }
                    else {
                        inObj.console.log("error")
                        throw ("parse error")
                        return false
                    }
                }
                else {
                    var rRes = res[res.length - 1]
                    inObj.cell.sp = ''
                    inObj.cell.content = rRes
                    inObj.cell.content += inObj.c
                    inObj.cell.state = STATE.SP

                    return false
                }
            }
        }
    }
    else if (inObj.cell.state == STATE.SP) {
        if (inObj.c == '\"') {
            inObj.cell.sp += inObj.c
        }
        else {
            if (inObj.cell.sp.length == 0) {
                inObj.cell.content += inObj.c
            }
            else {
                var res = parseSplit(inObj.cell.sp)

                if (res[0].length == 0) {
                    inObj.cell.content += res[res.length - 1]
                    inObj.cell.content += inObj.c
                }
                else {
                    inObj.cell.content += res[res.length - 1]

                    if (inObj.c == ',' || inObj.c == '\n'  || inObj.c == '\r') {
                        inObj.resContent = inObj.cell.content
                        inObj.cell.initz()

                        inObj.changeLine = (inObj.c == ',' ? false : true)

                        return true
                    }
                    else {
                        inObj.cell.content += res[0]
                    }

                    inObj.cell.content += inObj.c
                }
            }
        }
    }
    else if (inObj.cell.state == STATE.NR) {
        if (inObj.c == ',' || inObj.c == '\n'  || inObj.c == '\r') {
            inObj.resContent = inObj.cell.content
            inObj.cell.initz()
            inObj.changeLine = (inObj.c == ',' ? false : true)

            return true
        }
        else {
            inObj.cell.content += inObj.c
        }
    }
    else {
        console.log("parse error")
        throw ("parse error")
        return false
    }

    return false
}

// res [[], []]
function csvParse(lineContentPre) {
    var resCsv = []
    if (lineContentPre.length == 0) {
        return resCsv
    }

    lineContent = lineContentPre + "\n"

    var inObj = {}
    inObj.cell = new CellAc
    inObj.cell.initz()

    inObj.resContent = ''
    inObj.changeLine = false
    inObj.c = ''

    var csvLine = []

    for (let i = 0; i < lineContent.length; ++i) {
        inObj.c = lineContent[i]
        inObj.resContent = ''
        inObj.changeLine = false

        if (parseNormal(inObj)) {
            csvLine.push(inObj.resContent)
            if (inObj.changeLine) {
                resCsv.push(csvLine)
                csvLine = []
            }
        }
    }

    return resCsv
}

function csvCell(content) {
    var res = content
    res = stringAllReplace(res, "\"", "\"\"")
    res = util.format("\"%s\"", res)
    return res
}

module.exports = {
    csvParse,
    csvCell
}
