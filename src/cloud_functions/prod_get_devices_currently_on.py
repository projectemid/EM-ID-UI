import json
import boto3
from boto3.dynamodb.conditions import Attr
from botocore.exceptions import ClientError

def lambda_handler(event, context):
    # Initialize the DynamoDB resource
    dynamodb = boto3.resource('dynamodb')
    
    # Specify the new table name
    table_name = 'prod_device_live_state'
    table = dynamodb.Table(table_name)
    
    try:
        # Scan the table to get devices where 'on' is True
        response = table.scan(
            FilterExpression=Attr('on').eq(True)
        )
        devices = response.get('Items', [])
        
        # Continue scanning if there are more items (pagination)
        while 'LastEvaluatedKey' in response:
            response = table.scan(
                FilterExpression=Attr('on').eq(True),
                ExclusiveStartKey=response['LastEvaluatedKey']
            )
            devices.extend(response.get('Items', []))
        
        # Extract device IDs
        device_ids = [item['deviceId'] for item in devices]
        
        # Return the response with CORS headers
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',  # Allow all origins
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET'
            },
            'body': json.dumps({'devices_on': device_ids})
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
