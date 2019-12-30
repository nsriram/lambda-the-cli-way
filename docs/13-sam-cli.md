# AWS Serverless Application Model (SAM)

In this section we will understand 'SAM _(Serverless Application Model)_' & 'SAM CLI'. 
 

### SAM & SAM CLI
[SAM](https://github.com/awslabs/aws-sam-cli)  is an open-source framework from AWS for building and deploying 
lambda based serverless applications on AWS. The source code is available on github and is well maintained.
SAM enables designing of serverless applications using AWS Lambda and event sources in a descriptive template.
[SAM Templates](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-specification-template-anatomy.html) 
for serverless applications can be defined in YAML. SAM simplifies the definition compared to AWS Cloud Formation. 

SAM CLI tool makes development and deployment of lambda applications simple. SAM CLI is built in Python and 
uses Docker for local deployments. 

Using the CLI tool,
- serverless project scaffold can be created for specific runtimes and other config
- lambda can be built, packaged and deployed locally, and migrated to AWS
- API gateways can be run locally
- testing and debugging can be done locally
- integrations and event sources can be specified

### Hello World Lambda on Local Machine Using SAM
We will build and deploy a basic AWS lambda serverless application on local machine using SAM.

#### (1) Install SAM
SAM can be installed on Mac using Homebrew. You can tap into AWS repository and install aws-sam-cli.

```shell script
brew tap aws/tap
brew install aws-sam-cli
sam --version
```
> Output: The SAM CLI version while writing this section was 0.39.0.  
```
SAM CLI, version 0.39.0
```

#### (2) Initialize a serverless project 
Let's initialize a SAM project, for Lambda using NodeJS runtime, with npm as dependency manager. 

```shell script
sam init --name sam-app \
    --runtime nodejs10.x \
    --dependency-manager npm \
    --app-template hello-world
```

The sam init will create a `sam-app` root folder. If you list the contents of the sam-app folder, you will
see the following. The key files of interest are
1. `app.js` - lambda source, that returns JSON with status code of 200, and "hello world" message
2. `sam-app/template.yaml` - SAM definition of the scaffold project created (defines HelloWorld function as a resource)
3. `event.json` - place for defining event based integration
4. `tests` - for unit tests (_the package.json contains the test framework dependencies_) 

```
➜  ls -ld sam-app/**/*
-rw-r--r--  1 sriramn  staff  7494 Dec 30 21:21 sam-app/README.md

drwxr-xr-x  3 sriramn  staff    96 Dec 30 21:21 sam-app/events
-rw-r--r--  1 sriramn  staff  1997 Dec 30 21:21 sam-app/events/event.json

drwxr-xr-x  6 sriramn  staff   192 Dec 30 21:21 sam-app/hello-world
-rw-r--r--  1 sriramn  staff  1046 Dec 30 21:21 sam-app/hello-world/app.js
-rw-r--r--  1 sriramn  staff   468 Dec 30 21:21 sam-app/hello-world/package.json
drwxr-xr-x  3 sriramn  staff    96 Dec 30 21:21 sam-app/hello-world/tests
drwxr-xr-x  3 sriramn  staff    96 Dec 30 21:21 sam-app/hello-world/tests/unit
-rw-r--r--  1 sriramn  staff   651 Dec 30 21:21 sam-app/hello-world/tests/unit/test-handler.js

-rw-r--r--  1 sriramn  staff  1625 Dec 30 21:21 sam-app/template.yaml
```

#### (3) Build the serverless project
Let's build the project as-is. `sam build` will create artifacts in `sam-app/.aws-sam/build` folder. Our example is on
NodeJS runtime. We will see `node_modules, package.json` & SAM template file in the build folder. 
_(The scaffold creates the sample hello world with `axios` npm dependency. You will find it and it second 
level dependencies in node_modules)_.

```shell script
➜  cd sam-app
➜  sam build
```
At any point, the clod formation templates can be validated using `sam validate`.

#### (4) Deploy Lambda on local machine

##### (4.1) Start Local Instance of Lambda
We will need to start Docker on local machine. If you are on Mac, you can start by `open -a Docker.app`. If you 
don't have Docker, you need to install. Assuming Docker is running, we can start the lambda on local machine.

```shell script
# From sam-app folder
➜ sam local start-lambda
```
> Output: You should see the local lambda service started with the following message.
```
Starting the Local Lambda Service. You can now invoke your Lambda Functions defined in your template through the endpoint.
2019-12-30 22:36:20  * Running on http://127.0.0.1:3001/ (Press CTRL+C to quit)
``` 
##### (4.2) Test Local Instance
The local instance of lambda can be tested using the following.

```shell script
➜ aws lambda invoke --function-name "HelloWorldFunction" \
    --endpoint-url "http://127.0.0.1:3001" \
    --no-verify-ssl out.txt
```

> *Output*: The first invocation will fetch the `lambci/lambda:nodejs10.x` docker container image and return the following
response.

> *Logs*: On your local instance you can see the  logs detailing the docker image pull , mounting it and the 
lambda execution. The logs will be the same as how it appears on AWS Lambda, on the cloud.

```shell script
{
    "StatusCode": 200
}
```

#### (5) Deploy API Gateway on local machine
A local instance of API Gateway can be started as follows. The API gateway will invoke the lambda and respond back
with its contents.

```shell script
➜ sam local start-api
```
Test the local API gateway instance using `curl` as below.

```shell script
➜ curl http://127.0.0.1:3000/hello
```
> Output:
```
➜ {"message":"hello world2"}
```
#### (6) More
SAM templates are quite powerful and a lot of functionality can be built using it. Event processing can be configured
via yaml and Lambda can be integrated with S3, DynamoDB and others. `sam deploy` can be used to deploy
stacks using cloud formation templates. The packages for deployment can be generated using `sam package`. 


🏁 **Congrats !** You learnt the basics of SAM and local deployment of Lambda 🏁

**Next**: [Teardown](14-teardown.md) 

