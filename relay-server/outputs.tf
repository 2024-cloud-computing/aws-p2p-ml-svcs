output "instance_public_ip" {
  value = aws_instance.relay_server.public_ip
  description = "The public IP address of the EC2 instance."
}

output "instance_id" {
  value = aws_instance.relay_server.id
  description = "The ID of the EC2 instance."
}