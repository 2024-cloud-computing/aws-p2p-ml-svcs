The following vaiable values may change based on the models being deployed on the Azure ML:
'''
export REST_ENDPOINT=https://ccproject-noege.eastus2.inference.ml.azure.com/score
export API_KEY=RqSaTbUiFnCfnSfItUp8hi3zvjc5Na0GPr

sudo docker build . -t txt-gen-node
docker run --network=host -e REST_ENDPOINT -e API_KEY txt-gen-node:latest 

sudo docker image rm -f txt-gen-node
'''