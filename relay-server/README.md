cd relay-server
sudo docker build . -t relay-server
sudo docker run --network=host relay-server:latest

sudo docker image rm -f relay-server
