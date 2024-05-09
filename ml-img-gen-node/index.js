// P2P
const Libp2p = require('libp2p');
const Bootstrap = require('libp2p-bootstrap')
const Gossipsub = require('libp2p-gossipsub')
const MPLEX = require('libp2p-mplex')
const { NOISE } = require('libp2p-noise')
const PubsubPeerDiscovery = require('libp2p-pubsub-peer-discovery')
const TCP = require('libp2p-tcp')

const bootstrapMultiaddrs = process.env.RELAY_URL ? [process.env.RELAY_URL] : ''
const uint8ArrayToString = require('uint8arrays/to-string')

// Image generation
const imageGeneration = require('./imageGeneration');

function P2PmessageToObject(message) {
    return JSON.parse(uint8ArrayToString(message.data))
}

async function createPeerNode() {
    const node = await Libp2p.create({
        addresses: {
            listen: ['/ip4/0.0.0.0/tcp/2030']
        },
        modules: {
            transport: [TCP],
            connEncryption: [NOISE],
            streamMuxer: [MPLEX],
            pubsub: Gossipsub,
            peerDiscovery: [Bootstrap, PubsubPeerDiscovery]
        },
        config: {
            peerDiscovery: {
                [PubsubPeerDiscovery.tag]: {
                    interval: 1000,
                    enabled: true
                },
                [Bootstrap.tag]: {
                    enabled: true,
                    list: bootstrapMultiaddrs
                }
            }
        }
    })

    return node;
}

async function startPeerNode() {
    try {
        node = await createPeerNode()
        const myPeerId = node.peerId.toB58String()

        node.on('peer:discovery', (peerId) => {
            console.log(`Peer ${myPeerId}, Discovered: ${peerId.toB58String()}`)
        })

        node.pubsub.on('img_gen_query', async (msg) => {
            console.log('message title: img_gen_query')

            const { imgInput, from, queryId, type } = P2PmessageToObject(msg);

            try {
                const imageResult = await imageGeneration(imgInput);
                const imageResponse = { ...imageResult, type: "img_gen_response", from, queryId }

                await node.pubsub.publish(from, Buffer.from(JSON.stringify(imageResponse)));

                console.log(`img_gen_request has been successfully processed and the response was sent back to '${from}'`);
            } catch (err) {
                const imageResult = { data: [{ Image: `${__dirname}/sample_output_image.png` }] };
                const imageResponse = { ...imageResult, type: "img_gen_response", from, queryId }

                await node.pubsub.publish(from, Buffer.from(JSON.stringify(imageResponse)));

                console.log(`img_gen_request has been failed to process and the mock data was sent back to '${from}'. Printing out error stack below`);
                console.log(err);
            }
        })

        console.log("Subscribed to img_gen_query");

        await node.start()

        await node.pubsub.subscribe("TEST", (msg) => {
            console.log(`Received message on TEST: ${msg.data.toString()}`);
        });
        console.log("Subscribed to TEST");

        await node.pubsub.subscribe('img_gen_query')
    } catch (err) {
        console.log(err)
    }
}

startPeerNode();