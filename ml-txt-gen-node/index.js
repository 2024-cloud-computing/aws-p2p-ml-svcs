const Libp2p = require('libp2p');
const Bootstrap = require('libp2p-bootstrap')
const Gossipsub = require('libp2p-gossipsub')
const MPLEX = require('libp2p-mplex')
const { NOISE } = require('libp2p-noise')
const PubsubPeerDiscovery = require('libp2p-pubsub-peer-discovery')
const TCP = require('libp2p-tcp')
const uint8ArrayFromString = require('uint8arrays/from-string')
const uint8ArrayToString = require('uint8arrays/to-string')

const bootstrapMultiaddrs = process.env.RELAY_URL ? [process.env.RELAY_URL] : ''
const axios = require('axios');


// Global variables
var node;
var myPeerId;

// Helper functions
function P2PmessageToObject(message) {
    return JSON.parse(uint8ArrayToString(message.data))
}

function ObjectToP2Pmessage(message) {
    return uint8ArrayFromString(JSON.stringify(message));
}

async function analyzedText(messageText) {
    const restEndpoint = process.env.REST_ENDPOINT;
    const apiKey = process.env.API_KEY;

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
    };

    const data = {
        "inputs": messageText
    };

    try {
        const response = await axios.post(restEndpoint, data, { headers: headers });
        // Create a new response object within an array
        let responseData = [{
            Input: messageText,
            Label: response.data[0].label,
            Score: response.data[0].score
        }];
        return JSON.stringify(responseData);
    } catch (error) {
        console.error("Error in analyzedText:", error.message);
        if (error.response === undefined || error.response.status >= 500) {
            return JSON.stringify([{
                Input: messageText,
                Label: "Neutral",
                Score: 0.5
            }]
            );
        }
        return "Error processing your request";
    }
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

async function startPeerNode() {
    try {
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

        // listeners
        node.pubsub.on('txt_gen_query', (msg) => {
            console.log('message title: txt_gen_query')
            const queryMessageBody = P2PmessageToObject(msg);
            console.log(queryMessageBody);
            const responseMessageBody = {
                type: 'txt_gen_query_hit',
                queryId: queryMessageBody['queryId'],
                from: myPeerId,
                txtInput: queryMessageBody['txtInput']
            }
            node.pubsub.publish(queryMessageBody['from'], ObjectToP2Pmessage(responseMessageBody))
        })

        node.pubsub.on(myPeerId, async (msg) => { // Mark this function as async
            console.log('message title: my peer id')
            const messageBody = P2PmessageToObject(msg);
            console.log(messageBody);
            const analyzedTextResult = await analyzedText(messageBody['txtInput']);
            const responseMessageBody = {
                type: 'txt_gen_response',
                queryId: messageBody['queryId'],
                from: myPeerId,
                data: analyzedTextResult
            }

            console.log(`data being sent back is ${responseMessageBody['data']}`);
            node.pubsub.publish(messageBody['from'], ObjectToP2Pmessage(responseMessageBody));
            console.log(`Sentiment of the text sent back to ${messageBody['from']}`);
        });

        await node.start()

        await node.pubsub.subscribe("TEST", (msg) => {
            console.log(`Received message on TEST: ${msg.data.toString()}`);
        });
        console.log("Subscribed to TEST");

        await node.pubsub.subscribe('txt_gen_query')
        await node.pubsub.subscribe(myPeerId)

    } catch (e) {
        console.log(e)
    }
}

async function main() {
    startPeerNode()
}

main()
