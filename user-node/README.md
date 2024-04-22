## p2p

```bash
cd p2p
sudo docker build . -t user-node
sudo docker run --network=host user-node:latest

sudo docker image rm -f user-node
```

## browser

Database is called `CloudComputing`. Right now ther is only one table called `Users`.

### Start

```bash
export DB_PASSWORD=<db password>
docker run --name mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=$DB_PASSWORD --rm mysql

cd browser
docker build . -t browser 
docker run -p 3000:3000 -e DB_PASSWORD=$DB_PASSWORD --network=host browser
```

### Cleanup

```bash
docker stop mysql
```
