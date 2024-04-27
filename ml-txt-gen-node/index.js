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

        await node.start()
        
        await node.pubsub.subscribe("TEST", (msg) => {
            console.log(`Received message on TEST: ${msg.data.toString()}`);
        });
        console.log("Subscribed to TEST");

        await node.pubsub.subscribe("sentiment_analysis_request", async (msg) => {
            const messageText = msg.data.toString();
            const senderPeerId = msg.from;
            console.log(`Received sentiment analysis request: ${messageText}`);
    
            const summarizedText = await summarizeText(messageText); // This is your ML summarization logic function
    
            // Assuming the sender's peer ID is valid and can be used as a response topic
            await node.pubsub.publish(senderPeerId, Buffer.from(summarizedText));
            console.log(`Sentiment of the text sent back to ${senderPeerId}`);
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
