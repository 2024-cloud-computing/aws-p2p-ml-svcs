cd txt-gen-node
sudo docker build . -t txt-gen-node
sudo docker run txt-gen-node:latest
sudo docker run --network=host txt-gen-node:latest

sudo docker image rm -f txt-gen-node
