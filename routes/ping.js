export default function ping(client, message) {
    client.sendMessage(message.from, 'pong');
}
