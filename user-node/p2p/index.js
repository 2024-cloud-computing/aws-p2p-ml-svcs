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

// const express = require('express');
// const path = require('path');

var request_index = 0;
var queryMap = new Map();
var responseMap = new Map();
var myPeerId;

function P2PmessageToObject(message) {
  return JSON.parse(uint8ArrayToString(message.data))
}

function ObjectToP2Pmessage(message) {
  return uint8ArrayFromString(JSON.stringify(message));
}


// query ID is peerId + timestamp + request_index, example: QmPtbwUx8wLRwzZyFtWjTJvJCCv1ZonHcUdj1uTv373aKc-1619730560381-0
function generateQueryId() {
  const current_index = request_index;

  // update request_index
  if (request_index == Number.MAX_SAFE_INTEGER) {
    request_index = 0;
  } else {
    request_index++;
  }

  return myPeerId + `-` + (new Date()).getTime() + `-` + current_index;
}

// function handleQueryHit(messageBody) {
//   const messageQueryId = messageBody['queryId'];

//   if (queryMap.has(messageQueryId)) {
//     const providerPeerId = messageBody['from'];
//     const requestMessageBody = queryMap.get(messageQueryId);
//     node.pubsub.publish(providerPeerId, ObjectToP2Pmessage(requestMessageBody));
//     queryMap.delete(messageQueryId);
//   }
// }


// function startServer() {
//   const app = express();
//   const port = process.env.PORT || 8081;

//   app.use(express.json());
//   app.use(express.urlencoded({
//     extended: true
//   }));
//   app.use(express.static(__dirname + '/public'));

//   // Send search item query to other peers
//   app.post('/txtgen', function (req, res) {
//     var queryId = generateQueryId()

//     var queryMessageBody = {
//       from: myPeerId,
//       queryId: queryId
//     }

//     var requestMessageBody = req.body;
//     requestMessageBody['from'] = myPeerId;
//     requestMessageBody['queryId'] = queryId;
//     requestMessageBody['type'] = 'txt_gen_query';
//     requestMessageBody['txtInput'] = 

//     // Record the query in the queryMap
//     queryMap.set(queryId, requestMessageBody);

//     // Send p2p message
//     node.pubsub.publish('txt_gen_query', ObjectToP2Pmessage(queryMessageBody));

//     res.status(204).send();
//   });


//   app.listen(port);
//   console.log('Server started at http://localhost:' + port);
// }

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
    

        node.connectionManager.on('peer:connect', (connection) => {
            console.log(`Peer ${myPeerId}, Connected: ${connection.remotePeer.toB58String()}`);
        })

        node.connectionManager.on('peer:disconnect', (connection) => {
            console.log(`Peer ${myPeerId}, Disconnected: ${connection.remotePeer.toB58String()}`);
        })

        await node.start()

        // Delay message publishing to ensure subscription is active
        setTimeout(() => {
            node.pubsub.publish("TEST", Buffer.from(`HELLO WORLD from ${myPeerId}!`));
            console.log("Message published on TEST");
        }, 5000);


        // Subscribe to its own peer ID to receive summarization responses
        await node.pubsub.subscribe(myPeerId, (msg) => {
            console.log("message title: my peer id");
            const messageBody = P2PmessageToObject(msg);
            console.log(messageBody);
            if (messageBody['type'] == 'txt_gen_response') {
            const summarizedText = messageBody['data'].toString();
            console.log(`Received Sentiment Metrics : ${summarizedText}`);
            }
        });

        var queryId = generateQueryId()
        console.log(`queryId : ${queryId}`);

        var queryMessageBody = {
        from: myPeerId,
        queryId: queryId,
        txtInput: 'I am very happy to be here'
        }

        const requestMessageBody = {
            type: 'txt_gen_query',
            queryId: queryId,
            from: myPeerId,
            txtInput: 'I am very happy to be here'
        }

        
        // Send p2p message
        // Delay message publishing to ensure subscription is active
        setTimeout(() => {
            node.pubsub.publish('txt_gen_query', ObjectToP2Pmessage(queryMessageBody));
            console.log("Message published on txt_gen_query");
        }, 5000);

        

    } catch (e) {
        console.log(e)
    }
}

async function main() {
    startPeerNode()
}

main()
