const RelayServer = require('libp2p-relay-server')

async function startRelayServer() {
    const relay = await RelayServer({
        listenAddresses: ['/ip4/0.0.0.0/tcp/2024'],
    })

    await relay.start()
    console.log(`libp2p relay started with id: ${relay.peerId.toB58String()}`)

    relay.connectionManager.on('peer:connect', (connection) => {
        console.log('Connected to:', connection.remotePeer.toB58String());
    })
}

async function main() {
    startRelayServer()
}

main()
