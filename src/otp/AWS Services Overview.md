AWS Services Overview
This document provides an overview of the AWS services currently utilized in the Classento environment, detailing the core components: Amazon SNS, Amazon SES, and Amazon S3, as well as the user roles configured within the account.

Amazon SNS (Simple Notification Service)
Purpose:
Amazon SNS is leveraged for sending notifications across various endpoints. It is primarily used for managing the communication between microservices and for sending alerts, such as system notifications or updates to relevant stakeholders.

Usage Highlights:

Topic-based notifications
High throughput and flexible message delivery options (HTTP/S, email, SMS, etc.)
Amazon SES (Simple Email Service)
Purpose:
Amazon SES is employed for email communication purposes within the platform. It is used to send transactional and marketing emails to customers and stakeholders.

Sender Email:

Configured sender email: noreply-classento.com
Region:

Service is deployed in the ap-south-1 region.
Amazon S3 (Simple Storage Service)
Amazon S3 is used to store and manage files securely with high durability and availability. Two S3 buckets are actively managed:

classento-dev
This bucket is used for development purposes, including storing assets, backups, and logs related to ongoing development activities.

classento-backend
This bucket stores production assets, including critical data, files, and backups necessary for the smooth operation of backend services.

AWS User Roles
Two user roles are set up to manage AWS resources securely:

Root User
The root user has full administrative access to all AWS resources but is only used for essential configuration and management tasks due to security best practices.

IAM Developer
The IAM Developer user is assigned permissions for day-to-day management of the AWS services, focusing on development and operational tasks. This role is restricted to only the resources necessary for development to ensure a secure and controlled environment.
