## Instruction

### Environment Variable

The image generation node is featured by Lepton AI and you need to set `LEPTON_API_TOKEN` environment variable locally before running the node. Please refer to [this page](https://www.lepton.ai/docs/overview/quickstart) how to obtain the API token.

### Build

make sure you have the `RELAY_URL` at hand, e.g., `/ip4/127.0.0.1/tcp/2024/p2p/QmQLuEX6ELbNscTSUM5wj4y7Cb1nxJwC46xAkzKSG9zxqj`.

```
export LEPTON_API_TOKEN=<Your lepton API token>
export RELAY_URL=<relay server address>
```

```
sudo docker build . -t img-gen-node
```

### Run

```
sudo docker run --network=host -e RELAY_URL img-gen-node:latest
```

### Clean up

```
sudo docker image rm -f img-gen-node
```
