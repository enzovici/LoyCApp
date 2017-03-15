http = require('http'); 
rndStr = require('randomstring');     
mysql = require("mysql");        
deasync = require('deasync');

// Inizializzazione del database e connessione
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "vincidomini"
});

con.connect(function (err) {
    if (err) {
        console.log('Error connecting to Db');
        return;
    }

    console.log('Connection established');
});


// server callback
server = http.createServer(function (req, res) {

    // Handle json respose
    function response(text) {
        res.writeHead(200, { "Content-Type": "application/json" });
        var json = JSON.stringify({
            type: "Response",
            result: text
        });
        res.end(json);
    }

    // Handle exception
    process.on('uncaughtException', function (err) {
        console.log('Caught exception: ' + err);
        response("ERROR");
    });

    // Recognise request method
    if (req.method == 'POST') {

        var body = '';

        // receiving data callback
        req.on('data', function (data) {
            // Parsing data
            body += data;
            var data = JSON.parse(body);
            // check format
            if (typeof data.request == 'undefined') {
                response("ERROR");
            } else {
                switch (data.request) {
                    case "addAcc":
                        // check format
                        cond = typeof data.name == 'undefined' || typeof data.password == 'undefined';
                        if (cond)
                            response("ERROR");
                        else {
                            // Create id and verify it's unique
                            var found = true;
                            while (found) {
                                var id = rndStr.generate();
                                var a = "empty";
                                con.query('SELECT * FROM account WHERE ID = ?', [id], function (err, rows) {
                                    if (err) throw err;

                                    a = rows.length;
                                });

                                // sync request
                                while (a == "empty") {
                                    deasync.runLoopOnce();
                                }

                                // if genereated id is new end 
                                if (a == 0) {
                                    found = false;
                                }
                            }

                            // Insert account 
                            var account = {
                                ID: id,
                                NAME: data.name,
                                PASS: data.password
                            };
                            
                            con.query('INSERT INTO account SET ?', account, function (err, result) {
                                if (err) throw err;
                                response(account);
                            });

                        }
                        break;
                    case "removeAcc":
                        cond = typeof data.id == 'undefined' || typeof data.password == 'undefined';
                        if (cond)
                            response("ERROR");
                        else {
                            var a = 'empty';
                            con.query('SELECT * FROM account WHERE ID = ? AND PASS = ?',[data.id,data.password], function (err, rows) {
                                if (err) throw err;
                                
                                a = rows.length;
                            });
                            while (a == "empty") {
                                deasync.runLoopOnce();
                            }
                            if (a!=0) {
                                con.query('DELETE FROM account WHERE ID = ?', [data.id] , function (err, rows) {
                                    if (err) throw err;
                                    response("Account deleted");
                                });
                            } else {
                                response("Account not found");
                            }
                        }
                        break;
                    case "login":
                        cond = typeof data.id == 'undefined' || typeof data.password == 'undefined';
                        if (cond)
                            response("ERROR");
                        else {
                            var a = 'empty';
                            con.query('SELECT * FROM account WHERE ID = ? AND PASS = ?',[data.id, data.password], function (err, rows) {
                                if (err) throw err;

                                a = rows.length;
                            });
                            while (a == "empty") {
                                deasync.runLoopOnce();
                            }
                            if (a!=0) {
                                response("Account found");
                            } else {
                                response("Account not found");
                            }
                        }
                        break;
                    case "addBar":
                        cond = typeof data.id == 'undefined' || typeof data.password == 'undefined'|| typeof data.nameBar == 'undefined'|| typeof data.barcode == 'undefined';
                        if (cond) {
                            response("ERROR");
                        } else {
                            var a = 'empty';
                            con.query('SELECT * FROM account WHERE ID = ? AND PASS = ?',[data.id, data.password], function (err, rows) {
                                if (err) throw err;
                                a = rows.length;
                            });
                            while (a == "empty") {
                                deasync.runLoopOnce();
                            }
                            if (a!=0) {
                                var found = true;
                                while (found) {
                                    var idBar = rndStr.generate();
                                    var a = "empty";
                                    con.query('SELECT * FROM card WHERE ID = ? AND ACCOUNT = ?',[idBar,data.id], function (err, rows) {
                                        if (err) throw err;
                                        a = rows.length;
                                    });
                                    while (a == "empty") {
                                        deasync.runLoopOnce();
                                    }
                                    if (a == 0) {
                                        found = false;
                                    }
                                }
                                var bar = {
                                    ID: idBar,
                                    VALUE: data.barcode,
                                    DESCRIPTION: data.nameBar,
                                    FAVORITE : false,
                                    ACCOUNT : data.id
                                };
                                                               
                                con.query('INSERT INTO card SET ?', bar, function (err, result) {
                                    if (err) throw err;
                                    response(bar);
                                });
                            } else {
                                response("Account not found");
                            }
                        }
                        break;
                    case "removeBar":
                        cond = typeof data.id == 'undefined' || typeof data.password == 'undefined' || typeof data.idBar == 'undefined';
                        if (cond)
                            response("ERROR");
                        else {
                            var a = 'empty';
                            con.query('SELECT * FROM account WHERE ID = ? AND PASS = ?',[data.id, data.password], function (err, rows) {
                                if (err) throw err;
                                a = rows.length;
                            });
                            while (a == "empty") {
                                deasync.runLoopOnce();
                            }
                            if (a!=0) {
                                con.query('DELETE FROM card WHERE ID = ? AND ACCOUNT = ?',[data.idBar, data.id], function (err, rows) {
                                    if (err) throw err;
                                    response("Barcode deleted");
                                });
                            } else {
                                response("Account not found");
                            }
                        }
                        break;
                    case "getBar":
                        cond = typeof data.id == 'undefined' || typeof data.password == 'undefined';
                        if (cond)
                            response("ERROR");
                        else {
                            var a = 'empty';
                            con.query('SELECT * FROM account WHERE ID = ? AND PASS = ?',[data.id, data.password], function (err, rows) {
                                if (err) throw err;
                                
                                a = rows.length;
                            });
                            while (a == "empty") {
                                deasync.runLoopOnce();
                            }
                            if (a!=0) {
                                con.query('SELECT ID,VALUE,DESCRIPTION,FAVORITE FROM card WHERE ACCOUNT = ?',[data.id], function (err, rows) {
                                    if (err) throw err;
                                    response(rows);
                                });
                            } else {
                                response("Account not found");
                            }
                        }
                        break;
                    case "updateBar":
                        cond = typeof data.id == 'undefined' || typeof data.password == 'undefined' || typeof data.idBar == 'undefined' || typeof data.favorite == 'undefined';
                        if (cond)
                            response("ERROR");
                        else {
                            var a = 'empty';
                            con.query('SELECT * FROM account WHERE ID = ? AND PASS = ?',[data.id, data.password], function (err, rows) {
                                if (err) throw err;
                                a = rows.length;
                            });
                            while (a == "empty") {
                                deasync.runLoopOnce();
                            }
                            if (a!=0) {
                                con.query('UPDATE card SET FAVORITE = ? WHERE ID = ? AND ACCOUNT = ?',[data.favorite, data.idBar, data.id], function (err, rows) {
                                    if (err) throw err;
                                    response("Barcode updated");
                                });
                            } else {
                                response("Account not found");
                            }
                        }
                        break;
                    default:
                        response("ERROR");
                        break;
                }
            }
        });
    } else { // only POST accepted
        response("ERROR");
    }

});

// Initialise server on IP:Port
port = 3000;
host = '127.0.0.1';
server.listen(port, host);