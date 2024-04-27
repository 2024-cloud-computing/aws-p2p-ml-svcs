## Instruction

### Build

```
sudo docker build . -t img-gen-node
```

### Run

```
sudo docker run --network=host img-gen-node:latest
```

### Clean up

```
sudo docker image rm -f img-gen-node
```