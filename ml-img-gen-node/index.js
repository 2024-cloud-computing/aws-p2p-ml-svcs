// P2P
const Libp2p = require('libp2p');
const Bootstrap = require('libp2p-bootstrap')
const Gossipsub = require('libp2p-gossipsub')
const MPLEX = require('libp2p-mplex')
const { NOISE } = require('libp2p-noise')
const PubsubPeerDiscovery = require('libp2p-pubsub-peer-discovery')
const TCP = require('libp2p-tcp')

const config = require('./config.json')
const bootstrapMultiaddrs = config['bootstrapMultiaddrs']

// Image generation
const imageGeneration = require('./imageGeneration');

async function createPeerNode() {
    return await Libp2p.create({
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
}

async function startPeerNode() {
    try{
        node = await createPeerNode()
        myPeerId = node.peerId.toB58String()

        node.on('peer:discovery', (peerId) => {
            console.log(`Peer ${myPeerId}, Discovered: ${peerId.toB58String()}`)
        })

        await node.start()
        
        await node.pubsub.subscribe("TEST", (msg) => {
            console.log(`Received message on TEST: ${msg.data.toString()}`);
        });
        console.log("Subscribed to TEST");

        await node.pubsub.subscribe("image_generation_request", async (msg) => {
            const { imgInput, from, queryId, type } = msg;

            console.log(`Received an image generation request: ${msg}`);
    
            const imageResponse = await imageGeneration(imgInput);
            await node.pubsub.publish(from, Buffer.from(imageResponse));

            console.log(`${type} (Query ID: '${queryId}') has been successfully processed and the response was sent back to '${from}'`);
        });

        console.log("Subscribed to image_generation");
    } catch (err) {
        console.log(err)
    }
}

startPeerNode();