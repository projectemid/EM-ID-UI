import json
import boto3
import traceback
from botocore.exceptions import ClientError

def lambda_handler(event, context):
    # Initialize the DynamoDB resource
    dynamodb = boto3.resource('dynamodb')
    
    # Specify the table names
    devices_table_name = 'prod_devices'
    live_state_table_name = 'prod_device_live_state'
    devices_table = dynamodb.Table(devices_table_name)
    live_state_table = dynamodb.Table(live_state_table_name)
    
    try:
        # Parse the incoming event
        body = json.loads(event['body'])
        
        # Extract required parameters
        userId = body.get('userId')
        deviceId = body.get('deviceId')
        
        # Check for required parameters
        if userId is None or deviceId is None:
            return {
                'statusCode': 400,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'POST'
                },
                'body': json.dumps({'message': 'Invalid input: userId and deviceId are required'})
            }
        
        # Extract optional parameters with default values if needed
        brand = body.get('brand', '')
        category = body.get('category', '')
        label = body.get('label', '')
        model = body.get('model', '')
        location = body.get('location', '')
        showTimeLine = body.get('showTimeLine', False)
        wattageOn = body.get('wattageOn', 0)
        wattageStandby = body.get('wattageStandby', 0)
        on_state = body.get('on', False)  # Default to False if not provided
        
        # Prepare the item for prod_devices table
        devices_item = {
            'userId': userId,
            'deviceId': deviceId,
            'brand': brand,
            'category': category,
            'label': label,
            'model': model,
            'location': location,
            'showTimeLine': showTimeLine,
            'wattageOn': wattageOn,
            'wattageStandby': wattageStandby
        }
        
        # Remove attributes with empty strings or None values
        devices_item = {k: v for k, v in devices_item.items() if v not in ['', None]}
        
        # Put item into prod_devices table
        devices_table.put_item(Item=devices_item)
        
        # Prepare the item for prod_device_live_state table
        live_state_item = {
            'deviceId': deviceId,
            'on': on_state
        }
        
        # Put item into prod_device_live_state table
        live_state_table.put_item(Item=live_state_item)
        
        # Return success response
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST'
            },
            'body': json.dumps({'message': f'Device {deviceId} added successfully'})
        }
        
    except ClientError as e:
        print(f"ClientError: {e.response['Error']['Message']}")
        traceback.print_exc()
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST'
            },
            'body': json.dumps({'message': 'Internal server error'})
        }
    except Exception as e:
        print(f"Unhandled exception: {str(e)}")
        traceback.print_exc()
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST'
            },
            'body': json.dumps({'message': 'Internal server error'})
        }
