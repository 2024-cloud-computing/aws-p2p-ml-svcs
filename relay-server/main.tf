resource "aws_security_group" "relay_server_sg" {
  name = "relay_server_sg"
  ingress {
    from_port   = 2024
    to_port     = 2024
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_key_pair" "deployer" {
  key_name   = "deployer-key"
  public_key = file("deployer-key.pub")
}

resource "aws_instance" "relay_server" {
  ami           = "ami-09b90e09742640522"  # Update with the latest AMI for your region
  instance_type = "t2.micro"
  key_name      = aws_key_pair.deployer.key_name

  security_groups = [aws_security_group.relay_server_sg.name]

  user_data = <<-EOF
              #!/bin/bash
              yum update -y
              yum install docker -y
              systemctl start docker
              systemctl enable docker
              EOF
}