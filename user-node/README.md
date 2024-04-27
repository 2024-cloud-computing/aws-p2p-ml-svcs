# user-node
## p2p

Contains the backend code implemented with `libp2p` and `express.js` to make requests and receive responses through p2p network.

### P2P Data Payload

#### ML Text Svc

`txt_gen_query`
```json
{
    txtInput: "This is a text input that will be analyzed by the sentiment analysis svc",
    from: "QmXpEfNw98FLZrSbR5xPphPFuBrtGrdkUnYoJhXG1FBosD",
    queryId: "QmXpEfNw98FLZrSbR5xPphPFuBrtGrdkUnYoJhXG1FBosD-1714249400169-0",
    type: "txt_gen_query"
}
```

`txt_gen_response`
```json
{
    from: "QmXpEfNw98FLZrSbR5xPphPFuBrtGrdkUnYoJhXG1FBosD",
    queryId: "QmXpEfNw98FLZrSbR5xPphPFuBrtGrdkUnYoJhXG1FBosD-1714249400169-0",
    type: "txt_gen_response"
    data: [
            {
                Input: "This is a text input that will be analyzed by the sentiment analysis svc",
                Label: "Positive",
                Score: 0.9
            }
    ]
}
```

#### ML Image Svc

`img_gen_query`
```json
{
    imgInput: "This is a image description based on which the image generation svc will use",
    from: "QmXpEfNw98FLZrSbR5xPphPFuBrtGrdkUnYoJhXG1FBosD",
    queryId: "QmXpEfNw98FLZrSbR5xPphPFuBrtGrdkUnYoJhXG1FBosD-1714249400169-0",
    type: "img_gen_query"
}
```

`img_gen_response`

```json
{
    from: "QmXpEfNw98FLZrSbR5xPphPFuBrtGrdkUnYoJhXG1FBosD",
    queryId: "QmXpEfNw98FLZrSbR5xPphPFuBrtGrdkUnYoJhXG1FBosD-1714249400169-0",
    type: "img_gen_response"
    data: [
        {
            Image: <imgUrl>
        },
        {
            Image: <imgUrl>
        },
        ...
    ]
}
```

## browser

Contain the frontend code implemented with `flask` to authenticate users against a MySQL database. The database is named `CloudComputing` that has one table called `Users` with the following schema:

```sql
#Users
username VARCHAR(200),
password VARCHAR(200),
firstname VARCHAR(200),
lastname VARCHAR(200)
```

## mysql

### local setup
The data is persisted under `/var/lib/docker/volumes/`

### remote setup

TBD

## Start

make sure you have the relay server"s address at hand, e.g., `/ip4/127.0.0.1/tcp/2024/p2p/QmQLuEX6ELbNscTSUM5wj4y7Cb1nxJwC46xAkzKSG9zxqj`.

```bash
export RELAY_SERVER=<relay server address>
export DB_PASSWORD=<db password>
export DB_HOST=<db host> #if running locally, then set this to `localhost`
docker-compose build
docker-compose up
```

## Cleanup

```bash
docker-compose down
```
