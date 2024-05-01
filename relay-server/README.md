# Relay-Server

## Prerequisites
- Install [terraform](https://developer.hashicorp.com/terraform/install?ajs_aid=ed249051-f377-40c5-a163-f2114be4d6f7&product_intent=terraform) if not available.
- Setup AWS profile locally following [install AWS CLi](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) and [AWS provider for terraform](https://registry.terraform.io/providers/hashicorp/aws/latest/docs#shared-configuration-and-credentials-files).

### How to deploy

1. To create an AWS EC2 instance and run the relay-server on it.

```
chmod +x run.sh
./run.sh
```

2. Make sure to note down the public IP (the variable `instance_public_ip`) of the EC2 instance from the logs, and also the peer-id from running the docker container as we need this to update our `config.json` files for the other p2p nodes to connect. The peer id should look something like `QmbpNoifa9hDL1uyV1SmET3enVkUbvH3NxjbxJrhfEbmqg`.
