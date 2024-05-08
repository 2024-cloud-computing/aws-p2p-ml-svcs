## Instruction

### Environment Variable

The image generation node is featured by Lepton AI and you need to set `LEPTON_API_TOKEN` environment variable locally before running the node. Please refer to [this page](https://www.lepton.ai/docs/overview/quickstart) how to obtain the API token. When the token is ready, you need to create `.env` file at the root level of `ml-img-gen-node` directory and add the following line in it.

```
LEPTON_API_TOKEN="<Your lepton API token>"
```

### Build

```
sudo docker build . -t img-gen-node
```

### Run

```
sudo docker run --network=host img-gen-node:latest
```

### Clean up

```
sudo docker image rm -f img-gen-node
```