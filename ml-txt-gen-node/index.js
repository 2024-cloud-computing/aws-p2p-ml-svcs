const Libp2p = require('libp2p');
const Bootstrap = require('libp2p-bootstrap')
const Gossipsub = require('libp2p-gossipsub')
const MPLEX = require('libp2p-mplex')
const { NOISE } = require('libp2p-noise')
const PubsubPeerDiscovery = require('libp2p-pubsub-peer-discovery')
const TCP = require('libp2p-tcp')
const uint8ArrayFromString = require('uint8arrays/from-string')
const uint8ArrayToString = require('uint8arrays/to-string')

const config = require('./config.json')
const bootstrapMultiaddrs = config['bootstrapMultiaddrs']

// Helper functions
function P2PmessageToObject(message) {
    return JSON.parse(uint8ArrayToString(message.data))
}
  
function ObjectToP2Pmessage(message) {
    return uint8ArrayFromString(JSON.stringify(message));
}

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

const axios = require('axios');

async function summarizeText(messageText) {
    const restEndpoint = "https://ccproject-noqeg.eastus2.inference.ml.azure.com/score";
    const apiKey = "RqSaTbUiFNcfn5ftUph8izvjscNAo6Pr"; // Replace with your actual API key

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
    };

    const data = {
        "inputs": messageText
    };

    try {
        const response = await axios.post(restEndpoint, data, { headers: headers });
        return JSON.stringify(response.data);
    } catch (error) {
        console.error("Error in summarizeText:", error.message);
        // Supreeta, check if the endpoint is unreachable or returns an error
        if (error.response === undefined || error.response.status >= 500) {
            // Supreeta, return a dummy response if the actual service is unavailable
            return JSON.stringify({"label": "Neutral", "score": 0.5});
        }
        // Supreeta, return a generic error message for other types of errors
        return "Error processing your request";
    }
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
        console.log("Subscribed to TEST");

        await node.pubsub.subscribe("txt_gen_query", async (msg) => {
            console.log('message title: txt_gen_query')
            const queryMessageBody = P2PmessageToObject(msg);
            console.log(queryMessageBody);
            const summarizedText = await summarizeText(queryMessageBody['txtInput']);

            const responseMessageBody = {
              type: 'txt_gen_response',
              queryId: queryMessageBody['queryId'],
              from: myPeerId,
              data: summarizedText
            }
            console.log(`data being sent back is ${responseMessageBody['data']}`);
            node.pubsub.publish(queryMessageBody['from'], ObjectToP2Pmessage(responseMessageBody))
            console.log(`Sentiment of the text sent back to ${queryMessageBody['from']}`);
        });
        console.log("Subscribed to sentiment_analysis");

        

    } catch (e) {
        console.log(e)
    }
}

async function main() {
    startPeerNode()
}

main()
