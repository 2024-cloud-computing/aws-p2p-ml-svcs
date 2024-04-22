sudo docker build . -t user-node
sudo docker run --network=host user-node:latest

sudo docker image rm -f user-node
