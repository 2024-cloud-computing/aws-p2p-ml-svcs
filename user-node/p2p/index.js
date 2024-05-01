const Libp2p = require('libp2p');
const Bootstrap = require('libp2p-bootstrap')
const Gossipsub = require('libp2p-gossipsub')
const MPLEX = require('libp2p-mplex')
const { NOISE } = require('libp2p-noise')
const PubsubPeerDiscovery = require('libp2p-pubsub-peer-discovery')
const TCP = require('libp2p-tcp')
const uint8ArrayFromString = require('uint8arrays/from-string')


const config = require('./config.json')
const bootstrapMultiaddrs = process.env.RELAY_URL ? [process.env.RELAY_URL] : config.bootstrapMultiaddrs

// express for frontend communication
const express = require('express');
var cors = require('cors');

var request_index = 0;
var myPeerId;
var queryMap = new Map();
var responseMap = new Map();


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
        })

        node.connectionManager.on('peer:connect', (connection) => {
            console.log(`Peer ${myPeerId}, Connected: ${connection.remotePeer.toB58String()}`);
        })

        node.connectionManager.on('peer:disconnect', (connection) => {
            console.log(`Peer ${myPeerId}, Disconnected: ${connection.remotePeer.toB58String()}`);
        })
        
        // listen to responses and send the request to that particular server node who responded
        node.pubsub.on(myPeerId, (msg) => {
            console.log(P2PmessageToObject(msg));
    
            const messageBody = P2PmessageToObject(msg);
            if (messageBody['type'] == 'txt_gen_query_hit' || messageBody['type'] == 'img_gen_query_hit') {
                handleHit(messageBody);
            }else if (messageBody['type'] == 'txt_gen_response' || messageBody['type'] == 'img_gen_response'){
                handleResponse(messageBody);
            }
        })

        await node.start()
        
        await node.pubsub.subscribe(myPeerId)
        
        // Delay message publishing to ensure subscription is active
        setTimeout(() => {
            node.pubsub.publish("TEST", Buffer.from(`HELLO WORLD from ${myPeerId}!`));
            console.log("Message published on TEST");
        }, 5000);

    } catch (e) {
        console.log(e)
    }
}


function handleHit(messageBody) {
    const messageQueryId = messageBody['queryId'];
    if (queryMap.has(messageQueryId)) {
      const providerPeerId = messageBody['from'];
      var requestMessageBody = queryMap.get(messageQueryId);
      if (messageBody['type'] == 'txt_gen_query_hit')
        requestMessageBody['type'] = 'txt_gen_request';
      else if (messageBody['type'] == 'img_gen_query_hit')
        requestMessageBody['type'] = 'img_gen_request';
      node.pubsub.publish(providerPeerId, ObjectToP2Pmessage(requestMessageBody));
      queryMap.delete(messageQueryId);
    }
  }

  function handleResponse(messageBody) {
    const queryId = messageBody['queryId'];
    responseMap.set(queryId, messageBody);
}

  // P2P response will be put into responseMap when received, this function wait for that condition. 
function ensureResponseArrives(queryId, timeout) {
    var start = Date.now();
    return new Promise(waitForResponse);
  
    function waitForResponse(resolve, reject) {
      if (responseMap.has(queryId))
        resolve(responseMap.get(queryId));
      else if (timeout && (Date.now() - start) >= timeout)
        reject(new Error("timeout"));
      else
        setTimeout(waitForResponse.bind(this, resolve, reject), 30);
    }
  }

// query ID is peerId + timestamp + request_index
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

async function startServer() {
    const app = express();
    const port = process.env.PORT || 8080;
  
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({
      extended: true
    }));
  
    // Send text generation request to ml txt server
    app.get('/txtgen', async function (req, res) {
      var queryMessageBody = req.query;

      const queryId = generateQueryId();
      queryMessageBody['from'] = myPeerId;
      queryMessageBody['queryId'] = queryId;
      
      queryMessageBody['type'] = 'txt_gen_query';
      console.log(queryMessageBody);
      /*
      // Record the query in the queryMap
      queryMap.set(queryId, queryMessageBody);
      
      // Send p2p message
      node.pubsub.publish('txt_gen_query', ObjectToP2Pmessage(queryMessageBody));
  
      // Wait for response
      var txtAnalysis;
      await ensureResponseArrives(queryId, 1000000).then(function () {
        txtAnalysis = responseMap.get(queryId);
        responseMap.delete(queryId);
      });
      */
      
      txtAnalysis = {
        "data": [
            {
                "Input": "I am a good person",
                "Label": "Positive",
                "Score": 0.9
            }
        ]
      }
      res.status(200).send(txtAnalysis);
    });
  
    app.get('/imggen', async function (req, res) {
        var queryMessageBody = req.query;
        
        const queryId = generateQueryId();
        queryMessageBody['from'] = myPeerId;
        queryMessageBody['queryId'] = queryId;
        
        queryMessageBody['type'] = 'img_gen_query';
        console.log(queryMessageBody);
        
        /*
        // Record the query in the queryMap
        queryMap.set(queryId, queryMessageBody);
        
        // Send p2p message
        node.pubsub.publish('img_gen_query', ObjectToP2Pmessage(queryMessageBody));
    
        // Wait for response
        var imgGen;
        await ensureResponseArrives(queryId, 1000000).then(function () {
            imgGen = responseMap.get(queryId);
          responseMap.delete(queryId);
        });
        */
        imgGen = {
            "data": [
                {
                    "Image": "https://www.w3schools.com/w3images/fjords.jpg"
                },
                {
                    "Image": "https://www.w3schools.com/w3images/lights.jpg"
                },
                {
                    "Image": "https://www.w3schools.com/w3images/nature.jpg"
                }
            ]
        }
        res.status(200).send(imgGen);
    });
  
    app.listen(port);
    console.log('Server started at http://localhost:' + port);
  }
  

async function main() {
    startPeerNode()
    startServer()
}

main()
