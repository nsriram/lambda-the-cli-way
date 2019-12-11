# AWS Lambda the CLI Way

The objective of this tutorial is to understand AWS Lambda in-depth, beyond executing functions, using CLI. 
This tutorial walks through setting up AWS CLI, dependencies for AWS Lambda, getting your first Lambda function running, 
many of its important features & finally integrating with other AWS services. AWS CLI (Command Line Interface) will be 
the primary medium of demonstrating all these examples.

## Target Audience
Target audience for this tutorial series are developers comfortable using AWS CLI. 
A little background understanding of serverless will help. 
> Note : The tutorial will not discuss examples using the AWS website UI.     

## Serverless Introduction
Serverless computing has become a mainstream architectural option for building software today. 
Many large organisations have started adopting serverless seriously in a large scale. 
It eases technologists by taking away the infrastructure overhead of managing, monitoring servers and allows them 
to focus only on the business/technical problem in hand to solve. 
The pay-per-use model helps in managing costs. 

### The ecosystem, a quick glance
Leading cloud providers AWS, Google Cloud, Azure have all their mainstream serverless offering today. 
Providers like AWS and GoogleCloud have made hosting as simple as 'Click of a button'  (e.g., Google Run) 
The first-class integration provisions to their other services (e.g., S3, Kinesis, DynamoDB integration to Lambda), 
help serverless approaches address larger architectural concerns seamlessly. 
Apart from these mainstream cloud solution providers there are options to host serverless on premise or on your kubernetes clusters.  
Apache OpenWhisk is an open source serverless hosting option.  If you want to run serverless on your kubernetes cluster, 
there are options like KNative and Kubeless. Frameworks like serverless.com have made building, bundlign serverless apps 
simpler. They also provide monitoring options.

### AWS Lambda
Lambda is one of the leading, matured serverless offering from AWS. 
Lambda supports a wide range of languages and hosting configurations. 
Lambda also has provisions for setting up triggers to listen to other aws services, handle HTTP requests, 
consume events from a queue or run on a schedule. AWS Lambda has much more features offered and 
You will find the following tutorials covering all these.

*Let's get started !*

## Tutorials

* [Prerequisites and Setup](docs/01-aws-cli-installation.md)
* [IAM Account For Tutorial](docs/02-iam-account-setup.md)
* [Hello World - Your First Lambda](docs/03-hello-world-your-first-lambda.md)
* [Packaging With Dependencies](docs/04-packaging-lambda-with-dependencies.md)
* [Lambda Layers](docs/05-lambda-layers.md)
* [Version Lambda](docs/06-version-lambda.md)
* [Managing Lambda](docs/07-managing-lambda.md)
* [Integrate with S3](docs/08-integrate-with-s3.md)
* [Integrate with Kinesis](docs/09-integrate-with-kinesis.md)
* [Integrate with DynamoDB]
* [Integrate with APIGateway]
* [SAM CLI]
* [Tear down]

## References
- [AWS Lambda](https://aws.amazon.com/lambda/)
- [Google Cloud Functions](https://cloud.google.com/functions/)
- [Azure Functions](https://azure.microsoft.com/en-gb/services/functions/)
- [Apache OpenWhisk](https://openwhisk.apache.org/)
- [KNative](https://cloud.google.com/knative/)
- [Kubeless](https://kubeless.io/)
- [Serverless](https://serverless.com/)  

**Let's Begin (First Step)**: [Prerequisites and Setup](docs/01-aws-cli-installation.md)