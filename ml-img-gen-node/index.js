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
    try{
        node = await createPeerNode()
        const myPeerId = node.peerId.toB58String()

        node.on('peer:discovery', (peerId) => {
            console.log(`Peer ${myPeerId}, Discovered: ${peerId.toB58String()}`)
        })

        node.pubsub.on('img_gen_query', (msg) => {
            console.log('message title: img_gen_query')
            const queryMessageBody = JSON.parse(uint8ArrayToString(msg.data))
            console.log(queryMessageBody);
            const responseMessageBody = {
                type: 'img_gen_query',
                queryId: queryMessageBody['queryId'],
                from: myPeerId
            }
            node.pubsub.publish(queryMessageBody['from'], uint8ArrayFromString(JSON.stringify(responseMessageBody)))
        });

        await node.start()
        
        await node.pubsub.subscribe("TEST", (msg) => {
            console.log(`Received message on TEST: ${msg.data.toString()}`);
        });
        console.log("Subscribed to TEST");

        node.pubsub.on(myPeerId, async (msg) => {
            const { imgInput, from, queryId, type } = msg;

            console.log(`Received an image generation request: ${JSON.stringify(msg)}`);
    
            if (type == 'img_gen_query') {
                const imageResult = await imageGeneration(imgInput);
                const imageResponse = { ...imageResult, type: "img_gen_response", from, queryId }

                await node.pubsub.publish(from, Buffer.from(JSON.stringify(imageResponse)));

                console.log(`${type} (Query ID: '${queryId}') has been successfully processed and the response was sent back to '${from}'`);
            }
        })

        console.log("Subscribed to image_generation");
    } catch (err) {
        console.log(err)
    }
}

startPeerNode();