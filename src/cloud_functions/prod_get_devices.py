import json
import boto3
from botocore.exceptions import ClientError
from decimal import Decimal

def lambda_handler(event, context):
    # Initialize the DynamoDB resource
    dynamodb = boto3.resource('dynamodb')
    
    # Specify the table name
    table_name = 'prod_devices'
    table = dynamodb.Table(table_name)
    
    try:
        # Scan the table to retrieve all items
        response = table.scan()
        devices = response.get('Items', [])
        
        # Continue scanning if there are more items (pagination)
        while 'LastEvaluatedKey' in response:
            response = table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
            devices.extend(response.get('Items', []))
        
        # Convert Decimal objects to int or float
        devices = convert_decimal_to_num(devices)
        
        # Return the response with CORS headers
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',  # Allow all origins
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET'
            },
            'body': json.dumps(devices)
        }
        
    except ClientError as e:
        # Handle DynamoDB errors
        print(f"Error fetching data from {table_name}: {e.response['Error']['Message']}")
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',  # Allow all origins
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET'
            },
            'body': json.dumps({'error': 'Internal server error'})
        }

def convert_decimal_to_num(obj):
    if isinstance(obj, list):
        return [convert_decimal_to_num(i) for i in obj]
    elif isinstance(obj, dict):
        return {k: convert_decimal_to_num(v) for k, v in obj.items()}
    elif isinstance(obj, Decimal):
        # Convert Decimal to int if it's a whole number, or float if it has a fractional part
        if obj % 1 == 0:
            return int(obj)
        else:
            return float(obj)
    else:
        return obj
