/**
 * Created by Administrator on 2016/9/29.
 */
var childProcess = require('child_process');
var fs = require('fs');

childProcess.exec("git log master -1",
    function(error, stdout, stderr) {
        var version = stdout.match(/commit ([a-z0-9]{8})/)[1];
        var str = "window.pageVersion = '"+ version + "'";
        fs.writeFileSync('src/js/lib/version.js',str);
        console.log('version file has created');
    });

