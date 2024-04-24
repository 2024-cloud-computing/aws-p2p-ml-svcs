## p2p

```bash
cd p2p
sudo docker build . -t user-node
sudo docker run --network=host user-node:latest

sudo docker image rm -f user-node
```

## browser

Database is called `CloudComputing`. Right now there is only one table called `Users`. The data is persisted under `/var/lib/docker/volumes/`

### Start

```bash
export DB_PASSWORD=<db password>
docker-compose build
docker-compose up
```

### Cleanup

```bash
docker-compose down
```
