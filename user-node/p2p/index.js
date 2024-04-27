const Libp2p = require('libp2p');
const Bootstrap = require('libp2p-bootstrap')
const Gossipsub = require('libp2p-gossipsub')
const MPLEX = require('libp2p-mplex')
const { NOISE } = require('libp2p-noise')
const PubsubPeerDiscovery = require('libp2p-pubsub-peer-discovery')
const TCP = require('libp2p-tcp')

const config = require('./config.json')
const bootstrapMultiaddrs = config['bootstrapMultiaddrs']

async function createPeerNode() {
    const node = await Libp2p.create({
        addresses: {
            listen: ['/ip4/0.0.0.0/tcp/2025']
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

    return node
}

async function startPeerNode() {
    try{
        node = await createPeerNode()
        myPeerId = node.peerId.toB58String()

        node.on('peer:discovery', (peerId) => {
            console.log(`Peer ${myPeerId}, Discovered: ${peerId.toB58String()}`)
        });

        await node.start()

        // Delay message publishing to ensure subscription is active
        setTimeout(() => {
            node.pubsub.publish("TEST", Buffer.from(`HELLO WORLD from ${myPeerId}!`));
            console.log("Message published on TEST");
        }, 5000);


        // Subscribe to its own peer ID to receive summarization responses
        await node.pubsub.subscribe(myPeerId, (msg) => {
            const summarizedText = msg.data.toString();
            console.log(`Received Sentiment Metrics : ${summarizedText}`);
        });

        // Send a summarization request after a delay
        setTimeout(() => {
            const textToSummarize = "I am very happy to be here";
            node.pubsub.publish("sentiment_analysis_request", Buffer.from(textToSummarize));
            console.log("Sentiment Ananlysis request sent");
        }, 5000);

    } catch (e) {
        console.log(e)
    }
}

async function main() {
    startPeerNode()
}

main()
