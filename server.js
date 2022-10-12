var http = require('http');
var mysql = require('mysql');
var fs = require('fs');
var url = require('url');
const path = require('path');

var mysqlConnection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1392',
    database: 'employeedb',
    multipleStatements: true
});

mysqlConnection.connect((err) => {
    if (!err) {
        console.log('DB connection succeeded');
    } else {
        console.log('DB connection faild \n Error: ' + JSON.stringify(err, undefined, 2));
    }
});

const server = http.createServer((req, res) => {
    if (req.url === '/users') {
        mysqlConnection.query('SELECT * FROM Employee', (err, result) => {
            if (!err) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.write(JSON.stringify(result));
                res.end();
            } else {
                console.log(err);
                res.end();
            }
        });
    }
    if (url.parse(req.url).pathname === '/delete') {
        var id = url.parse(req.url).query;
        mysqlConnection.query('delete from employee where EmpID = ?', [id], (err, result) => {
            if (err) throw err;
            console.log('1 recoed deleted');
        })
    }

    if (url.parse(req.url).pathname === '/edit') {
        var id = url.parse(req.url).query;

        const chunks = [];
        req.on("data", (chunk) => {
            chunks.push(chunk);
        });

        req.on("end", () => {
            console.log("all parts/chunks have arrived");
            const data = JSON.parse(Buffer.concat(chunks).toString());
            console.log("Data: ", data);
            console.log(data.Name);

            var query = "update employee set Name = ?, EmpCode = ?, Salary = ? where EmpID = ?";

            mysqlConnection.query(query, [data.Name, data.EmpCode, data.Salary, id], (err, rows, fields) => {
                if (!err) {
                    console.log('updated employee id ' + id);
                } else {
                    console.log(err);
                }
            })
        });
    }

    if (req.url === '/create') {
        const chunks = [];
        req.on("data", (chunk) => {
            chunks.push(chunk);
        });
        req.on("end", () => {
            console.log("all parts/chunks have arrived");
            const data = JSON.parse(Buffer.concat(chunks).toString());
            console.log("Data: ", data);
            console.log(data.Name);

            var query = `insert into employee (Name, EmpCode, Salary) values( ?, ?, ?)`
            mysqlConnection.query(query, [data.Name, data.EmpCode, data.Salary], (err, rows, fields) => {
                if (!err) {
                    console.log('inserted employee id ' + data.Name);
                } else {
                    console.log(err);
                }
            })
        });
    }

    if (req.url.includes('.') || req.url === '/') {
        // Build file path
        let filePath = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url);

        // Extension of file
        let extname = path.extname(filePath);

        // Check ext and set content type
        switch (extname) {
            case '.html':
                contentType = 'text/html';
                break;
            case '.js':
                contentType = 'text/javascript';
                break;
            case '.css':
                contentType = 'text/css';
                break;
            case '.json':
                contentType = 'application/json';
                break;
            case '.png':
                contentType = 'image/png';
                break;
            case '.jpg':
                contentType = 'image/jpg';
                break;
        }

        // Read file
        fs.readFile(filePath, (err, content) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    //Page not Found
                    fs.readFile(path.join(__dirname, 'public', '404.html'), (err, content) => {
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.end(content, 'utf8');
                    });
                } else {
                    // Some server error
                    res.writeHead(500);
                    res.end(`Server Error: ${err.code}`)
                }
            } else {
                //Success
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content, 'utf8');
            }
        });
    }

});

server.listen(8080);