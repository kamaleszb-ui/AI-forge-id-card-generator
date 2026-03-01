const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8001;

const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
};

http.createServer((request, response) => {
    // Parse the URL to remove query strings and hash
    const parsedUrl = url.parse(request.url).pathname;
    console.log(`[${new Date().toLocaleTimeString()}] ${request.method} ${parsedUrl}`);

    let filePath = '.' + parsedUrl;
    if (filePath === './') {
        filePath = './index.html';
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                // Return a simple 404 if file not found
                response.writeHead(404, {
                    'Content-Type': 'text/plain',
                    'Cache-Control': 'no-cache'
                });
                response.end('404 Not Found: ' + parsedUrl);
            }
            else {
                // Server error
                response.writeHead(500);
                response.end('Server Error: ' + error.code);
            }
        }
        else {
            // Success
            response.writeHead(200, {
                'Content-Type': contentType,
                'Cache-Control': 'no-cache, no-store, must-revalidate' // Prevent caching for dev
            });
            response.end(content, 'utf-8');
        }
    });

}).listen(PORT);

console.log(`Server running at http://localhost:${PORT}/`);

