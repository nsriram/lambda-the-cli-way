# Packaging AWS Lambda function with dependencies  

This section explains how to deploy a lambda function with library dependencies, on Node JS. Most of the parts
will continue to remain similar but the bundling will be different. Following example will use a 
node.js library `accounting.js` to format a number into currency.

#### (1) Initialize node.js project
```
➜ mkdir format-currency-lambda
➜ cd format-currency-lambda
➜ npm init -y
```

#### (2) Install accounting.js dependency using npm
This will install a lightweight node_module, accounting.js

```
➜ npm install accounting
```

#### (3) Create the lambda function using the accounting dependency
```
➜  echo "const accounting = require(\"accounting\");

exports.handler = (event, context, callback) => {
  const value = event.value;
  callback(null, { "amount": accounting.formatMoney(value) });
};
" > formatCurrencyLambda.js
```

> Note: The accounting js is imported and used for formatting. ES6 syntax is intentionally kept out to avoid bundling 
babel dependencies.

#### (4) Compress the lambda source file with dependencies
Here, we will bundle the source file with its `node_module` dependencies. The compressed `formatCurrencyLambda.zip` 
is the artifact to be deployed.
 
```
zip -r /tmp/formatCurrencyLambda.js.zip node_modules formatCurrencyLambda.js
```

#### (5) Deploy the lambda with dependencies
Note: Here we will use the role `lambda-cli-role` created in tutorial (3)
```
➜  export LAMBDA_ROLE_ARN=arn:aws:iam::919191919191:role/lambda-cli-role
➜  export AWS_REGION=us-east-1
➜  export AWS_PROFILE=lambda-cli-user
➜  aws lambda create-function \
     --region "$AWS_REGION" \
     --function-name formatCurrencyLambda \
     --handler 'formatCurrencyLambda.handler' \
     --runtime nodejs10.x \
     --role "$LAMBDA_ROLE_ARN" \
     --zip-file 'fileb:///tmp/formatCurrencyLambda.js.zip' \
     --profile "$AWS_PROFILE"

```

#### (6) Invoke the lambda to test the dependency
```
aws lambda invoke --function-name formatCurrencyLambda --log-type Tail --payload '{"value": 123456789}' --profile "$AWS_PROFILE" outputfile.txt
```

You should see the following output of executing the lambda function.
> output
```
"{"amount":"$123,456,789.00"}"
```

🏁 **Congrats !** You deployed your first AWS Lambda function with its dependencies and invoked it successfully. 🏁

**Next**: [Packaging With Dependencies](04-packaging-lambda-with-dependencies.md)

 