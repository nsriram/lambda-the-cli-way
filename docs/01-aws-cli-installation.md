# AWS CLI Installation

### AWS Account
Examples used in this tutorial will be run on MacOS, using AWS CLI. You can sign-up for a new AWS account if you 
don't have one here [Sign-up AWS](https://portal.aws.amazon.com/billing/signup#/start). 
AWS lambda offers free tier up to 1 million requests per month. This is applicable for both existing and new customers.

### Installation
AWS [Documentation](https://docs.aws.amazon.com/cli/latest/userguide/install-macos.html) here, explains the necessary 
steps to install AWS CLI tool. Post installation, you can verify using the version command.

```
➜  aws --version
aws-cli/1.16.236 Python/3.7.4 Darwin/18.0.0 botocore/1.12.226
```

The examples in this tutorial are run on the versions above _(latest while writing this tutorial)_. 
You can also verify the current (root) user your CLI is configured for using the command below.
```
➜  aws configure list
      Name                    Value             Type    Location
      ----                    -----             ----    --------
   profile                <not set>             None    None
access_key     ****************XYXY shared-credentials-file
secret_key     ****************aBcd shared-credentials-file
    region                us-east-1      config-file    ~/.aws/config
```

#### Quick Notes
- `~/.aws` _(dot aws)_ folder in your user home is a location where AWS CLI references for configuration & credentials. 
- `~/.aws/config` file is used for specifying various aws profiles.
    The `[default]` profile entry here will be used by AWS CLI, for executing the commands. 
- `~/.aws/credentials` is a file where the `aws_access_key_id` and `aws_secret_access_key` of the profiles can be specified. 

**Note**: `aws_secret_access_key` is mentioned in plain text in ~/.aws/credentials file. This is not recommended for 
security reasons, if you are on a shared laptop or feel, the file can be accessed by others. But, we will proceed with 
this tutorial using this approach. At th end of the tutorial the credentials will be removed. 

🏁 **Congrats !** You got your AWS CLI Setup completed 🏁