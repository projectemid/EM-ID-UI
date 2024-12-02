import json
import boto3
from botocore.exceptions import ClientError
import decimal

def lambda_handler(event, context):
    # Define CORS headers
    headers = {
        'Access-Control-Allow-Origin': '*',  # Update this to restrict origins if needed
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    }
    
    # Handle CORS preflight request
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': ''
        }

    try:
        # Parse the JSON body
        body = json.loads(event.get('body', '{}'))
    except json.JSONDecodeError:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'message': 'Invalid JSON format'})
        }
    
    # Extract userId and deviceId
    user_id = body.get('userId')
    device_id = body.get('deviceId')
    
    if not user_id:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'message': 'Missing required field: userId'})
        }
    
    if not device_id:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'message': 'Missing required field: deviceId'})
        }
    
    # Define allowed fields for update (exclude 'userId' and 'deviceId')
    allowed_fields = {
        'brand',
        'category',
        'label',
        'model',
        'room',
        'showTimeLine',
        'wattageOn',
        'wattageStandby'
    }
    
    # Extract fields to update, excluding 'userId' and 'deviceId'
    update_fields = {k: v for k, v in body.items() if k in allowed_fields}
    
    if not update_fields:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'message': 'No valid fields provided for update'})
        }
    
    # Dynamically build the UpdateExpression and ExpressionAttributeValues
    update_expression_parts = []
    expression_attribute_values = {}
    
    for idx, (field, value) in enumerate(update_fields.items()):
        placeholder = f":val{idx}"
        update_expression_parts.append(f"{field} = {placeholder}")
        expression_attribute_values[placeholder] = value
    
    update_expression = "SET " + ", ".join(update_expression_parts)
    
    # Initialize DynamoDB resource
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('prod_devices')  # Ensure this is the correct table name
    
    try:
        # Perform the update operation
        response = table.update_item(
            Key={
                'userId': user_id,     # Partition Key
                'deviceId': device_id  # Sort Key
            },
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_attribute_values,
            ReturnValues='UPDATED_NEW'
        )
    except ClientError as e:
        print(f"Error updating device {device_id} for user {user_id}: {e.response['Error']['Message']}")
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({
                'message': 'Internal server error',
                'error': e.response['Error']['Message']
            })
        }
    
    # Convert Decimal objects to native Python types
    updated_attributes = convert_decimals(response.get('Attributes', {}))
    
    # Success response with updated attributes
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({
            'message': 'Device updated successfully',
            'updatedAttributes': updated_attributes
        })
    }

def convert_decimals(obj):
    """
    Recursively convert Decimal objects to int or float.
    """
    if isinstance(obj, list):
        return [convert_decimals(item) for item in obj]
    elif isinstance(obj, dict):
        return {key: convert_decimals(value) for key, value in obj.items()}
    elif isinstance(obj, decimal.Decimal):
        # Convert to int if no decimal part, else to float
        if obj % 1 == 0:
            return int(obj)
        else:
            return float(obj)
    else:
        return obj
