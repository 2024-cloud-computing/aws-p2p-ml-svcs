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

Contain the frontend code implemented with `flask` to authenticate users against a MySQL database.

## mysql

Contain the terraform scripts for a MySQL server istance on AWS RDS. The database is named `CloudComputing` that has one table called `Users` with the following schema:

```sql
#Users
username VARCHAR(200),
password VARCHAR(200),
firstname VARCHAR(200),
lastname VARCHAR(200)
```

## Deploy

make sure you have the relay server"s address at hand, e.g., `/ip4/127.0.0.1/tcp/2024/p2p/QmQLuEX6ELbNscTSUM5wj4y7Cb1nxJwC46xAkzKSG9zxqj`.

```bash
export RELAY_SERVER=<relay server address>
export TESTING=false # `false` if using service nodes, `true` if using mock data
```

### Option1: local mysql

The data is persisted under `/var/lib/docker/volumes/`. **If you are changing `DB_PASSWORD`, please remove the volume by running cleanup command before starting again.**

```bash
export DB_PASSWORD=<db password>
docker-compose -f docker-compose-local.yml build
docker-compose -f docker-compose-local.yml up
```

clean up

```bash
docker-compose -f docker-compose-local.yml down -v
```

### Option2: remote mysql (via Terraform)

Install terraform CLI and make sure AWS profile is set locally [doc](https://registry.terraform.io/providers/hashicorp/aws/latest/docs#shared-configuration-and-credentials-files)

```bash
export TF_VAR_DB_PASSWORD=<db password>
cd mysql
terraform init
terraform apply --auto-approve
export DB_HOST=$(terraform output db_instance_address)
cd ..
docker-compose -f docker-compose-remote.yml build
docker-compose -f docker-compose-remote.yml up
```

clean up

```bash
docker-compose -f docker-compose-remote.yml down
terraform destroy --auto-approve
```
