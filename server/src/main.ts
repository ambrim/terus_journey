import { createServer } from 'https';
import { readFileSync, readFile } from 'fs';
import express from 'express';
import favicon from 'serve-favicon';
import { GameServer } from './gserver.js';
import { AuthCookie } from './authcookie.js';


const options = {
	key: readFileSync('cert/key.pem'),
	cert: readFileSync('cert/cert.pem')
};

const app = express();
const server = createServer(options, app);
const gs = new GameServer();
const auth = new AuthCookie();

app.use(favicon("favicon.ico"));
app.use('/', express.static('public'));

app.post("/login", (req, res) =>
{
	const userId = auth.getAuth(req.get('cookie'));
	if(userId !== null)
	{
		res.status(200).send("Authentication successful");
		return;
	}
	res.writeHead(200, {
		'Set-Cookie': [auth.makeCookie(gs.newId())]
	}).end("New credentials generated successfully");
});

server.on('upgrade', function(req, socket, head)
{
	const userId = auth.getAuth(req.headers.cookie);
	if(userId === null)
	{
		socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
		socket.destroy();
		return;
	}
	gs.loginPlayer(req, socket, head, userId);
});

server.listen(8080);