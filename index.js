import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import fs from 'fs';
import { parseIni } from './tools';

const config = parseIni(fs.readFileSync('./config.ini', 'utf-8'));

const client = new Client({
    authStrategy: new LocalAuth(),
});

client.on('ready', () => {
    console.log('Client is ready!');
});

let commands = new Map();

client.on('message_create', (message) => {
    console.log(`[${message.from}] ${message.body}`);
    if (message.body.startsWith(config.bot.prefix)) {
        let command = message.body
            .slice(config.bot.prefix.length)
            .split(' ')[0];
        console.log(`Command: ${command}`);
        if (commands.has(command)) {
            commands.get(command)(client, message);
        } else {
            client.sendMessage(message.from, `Command ${command} not found.`);
        }
    }
});

function loadCommands() {
    console.log('Loading commands...');
    console.log(`Prefix: ${config.bot.prefix}`);
    const commandFiles = fs
        .readdirSync('./routes')
        .filter((file) => file.endsWith('.js'));

    for (const file of commandFiles) {
        import(`./routes/${file}`).then((command) => {
            commands.set(command.default.name, command.default);
        });
    }
}

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

loadCommands();
client.initialize();
