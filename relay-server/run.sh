# Generate SSH key pair if it does not exist
if [ ! -f "deployer-key" ]; then
    ssh-keygen -f deployer-key -t rsa -b 2048 -N ''
    echo "SSH key pair generated."
else
    echo "SSH key pair already exists."
fi

# Ensure the private key has the correct permissions
chmod 400 deployer-key

# Initialize Terraform
terraform init

# Apply Terraform configuration without manual approval
terraform apply --auto-approve

# Extract the public IP address of the instance using Terraform output
IP=$(terraform output -raw instance_public_ip)

# Wait for the ec2 instance to be ready
# while state=$(aws ec2 describe-instances --instance-ids $(terraform output -raw instance_id) --query 'Reservations[*].Instances[*].State.Name' --output text); test "$state" = "pending"; do
#   sleep 10
#   echo "Waiting for instance to be in running state..."
# done

# Wait for the EC2 instance to be fully initialized
echo "Waiting for EC2 instance to initialize..."
sleep 120  # wait for 2 minutes

# Use the IP to copy files to the EC2 instance
scp -i ./deployer-key -r Dockerfile index.js package.json ec2-user@$IP:/home/ec2-user/

# Log into the EC2 instance and execute Docker commands
ssh -i ./deployer-key ec2-user@$IP << EOF
sudo docker build . -t relay-server
sudo docker run --network=host relay-server:latest
EOF
