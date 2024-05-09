The following vaiable values may change based on the models being deployed on the Azure ML:

make sure you have the `RELAY_URL` at hand, e.g., `/ip4/127.0.0.1/tcp/2024/p2p/QmQLuEX6ELbNscTSUM5wj4y7Cb1nxJwC46xAkzKSG9zxqj`.

```
export REST_ENDPOINT=
export API_KEY=
export RELAY_URL=<relay server address>

sudo docker build . -t txt-gen-node
docker run --network=host -e REST_ENDPOINT -e API_KEY txt-gen-node:latest

sudo docker image rm -f txt-gen-node
```
