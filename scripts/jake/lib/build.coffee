fs = require 'fs'
exports.desc = 'Builds a npm module-wrapped version of Kelvin Tan\'s luceneQueryValidator.js'
exports.task = ()-> 
    head = fs.readFileSync 'src/head.js'
    foot = fs.readFileSync 'src/foot.js'
    script = fs.readFileSync 'src/luceneQueryValidator.js'
    fs.writeFileSync('lib/query-validator.js',"#{head}#{script}#{foot}")