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
            listen: ['/ip4/0.0.0.0/tcp/2026']
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
        })

        node.connectionManager.on('peer:connect', (connection) => {
            console.log(`Peer ${myPeerId}, Connected: ${connection.remotePeer.toB58String()}`);
        })

        node.connectionManager.on('peer:disconnect', (connection) => {
            console.log(`Peer ${myPeerId}, Disconnected: ${connection.remotePeer.toB58String()}`);
        })

        await node.start()
        
        await node.pubsub.subscribe("TEST", (msg) => {
            console.log(`Received message on TEST: ${msg.data.toString()}`);
        });
        
        node.pubsub.on('sentiment_analysis_request', (msg) => {
            console.log('message title: sentiment_analysis_request')
            const queryMessageBody = P2PmessageToObject(msg);
            console.log(queryMessageBody);
            const responseMessageBody = {
              type: 'sentiment_analysis_response',
              queryId: queryMessageBody['queryId'],
              from: myPeerId
            }
            node.pubsub.publish(queryMessageBody['from'], ObjectToP2Pmessage(responseMessageBody))
          })
          
        await node.pubsub.subscribe("sentiment_analysis_request");
        
        console.log("Subscribed to TEST");

    } catch (e) {
        console.log(e)
    }
}

async function main() {
    startPeerNode()
}

main()
