# user-node
[TOC]
## p2p

Contains the backend code implemented with `libp2p` and `express.js` to make requests and receive responses through p2p network.

### Dataflow explaination
The following diagram from TreasureBox illustrates how the request and response should be handled in a P2P connection. It is something similar to a three-way handshake where the user sends a query to see if any service node is available, then upon receiving a hit acknowledgment from a service node, the user sends the actual request, and lastly, the service node sends back a response. Hence, every service node should be able to handle two kinds of requests.

![](https://raw.githubusercontent.com/yuhanzz/TreasureBox/master/images/image5.png)

#### ML Text Svc

`txt_gen_query`: user -> service
```
{
    txtInput: "This is a text input that will be analyzed by the sentiment analysis svc",
    from: <peerId>,
    queryId: <queryId-genereated-by-user>,
    type: "txt_gen_query"
}
```

`txt_gen_query_hit`: service -> user
```
{
    txtInput: "This is a text input that will be analyzed by the sentiment analysis svc",
    from: <peerId>,
    queryId: <queryId-genereated-by-user>,
    type: "txt_gen_query_hit"
}
```

`txt_gen_request`:  user -> service
```
{
    from: <peerId>,
    queryId: <queryId-genereated-by-user>,
    type: "txt_gen_request",
    txtInput: "This is a text input that will be analyzed by the sentiment analysis svc"
}
```

`txt_gen_response`:  service -> user
```
{
    from: <peerId>,
    queryId: <queryId-genereated-by-user>,
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

`img_gen_query`: user -> service
```
{
    imgInput: "This is a image description based on which the image generation svc will use",
    from: <peerId>,
    queryId: <queryId-genereated-by-user>,
    type: "img_gen_query"
}
```

`img_gen_query_hit`: service -> user
```
{
    imgInput: "This is a image description based on which the image generation svc will use",
    from: <peerId>,
    queryId: <queryId-genereated-by-user>,
    type: "img_gen_query_hit"
}
```

`img_gen_request`:  user -> service
```
{
    imgInput: "This is a image description based on which the image generation svc will use",
    from: <peerId>,
    queryId: <queryId-genereated-by-user>,
    type: "img_gen_request"
}
```

`img_gen_response`: service -> user

```
{
    from: <peerId>,
    queryId: <queryId-genereated-by-user>,
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
export TESTING=false # `false` if using service nodes, `true` if using mock data
docker-compose build
docker-compose up
```

## Cleanup

```bash
docker-compose down
```
