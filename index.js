const http = require('http');
const dgram = require('dgram');
const url = require('url');

const server = http.createServer((req, res) => {
    // Parse da URL para pegar os parâmetros: ?host=x&port=y&size=z&time=t
    const queryObject = url.parse(req.url, true).query;
    
    if (queryObject.host) {
        const host = queryObject.host;
        const port = parseInt(queryObject.port) || Math.floor(Math.random() * 65535) + 1;
        const size = parseInt(queryObject.size) || 64;
        const time = parseInt(queryObject.time) || 10; // segundos
        
        const client = dgram.createSocket('udp4');
        const message = Buffer.alloc(size, 'X');
        let packetsSent = 0;
        const endTime = Date.now() + (time * 1000);

        // Função de envio recursiva para não travar o Event Loop
        const sendPacket = () => {
            if (Date.now() < endTime) {
                // No Node, o send é assíncrono
                client.send(message, 0, message.length, port, host, (err) => {
                    if (!err) packetsSent++;
                    // "setImmediate" permite que o Node processe outras coisas entre os envios
                    setImmediate(sendPacket);
                });
            } else {
                client.close();
                console.log(`Demonstração finalizada para ${host}. Pacotes: ${packetsSent}`);
            }
        };

        sendPacket();

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`<h1>Teste UDP Iniciado</h1>
                 <p>Alvo: ${host}:${port}</p>
                 <p>Tamanho: ${size} bytes</p>
                 <p>Duração: ${time}s</p>
                 <p>Verifique o console do servidor para o resultado final.</p>`);
    } else {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1>Monitor de Teste UDP</h1><p>Aguardando parâmetros via URL...</p>');
    }
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
