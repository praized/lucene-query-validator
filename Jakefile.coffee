###
 add current path to requires in first order
###
require.paths.unshift __dirname

### 
    require some modules
###

FS          = require 'fs'
FS.basename = require( 'path' ).basename
FS.readdirSync( "scripts/jake" ).map (pth)->
    pthstat = FS.statSync "scripts/jake/#{pth}" 
    tasks   = {}
    if pthstat.isDirectory()
        tasks[pth] ||= []
        FS.readdirSync( "scripts/jake/#{pth}"  ).map (filename)->
            try
                def = require "scripts/jake/#{pth}/#{filename}"
            catch E
                def = 
                    desc: "Show what when wrong when loading this task."
                    task: ()->  console.log( E )
            def.name = FS.basename filename, '.coffee'
            tasks[pth].push def
    for ns, set of tasks
        namespace ns, ->
            set.forEach (def)->
                desc( def.desc || 'No description provided' )
                task def.name, def.deps||[], def.task|| ()->  console.log( 'No task provided' )
