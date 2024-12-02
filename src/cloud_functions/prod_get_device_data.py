import json
import boto3
from boto3.dynamodb.conditions import Key, Attr


# Initialize DynamoDB resource

dynamodb = boto3.resource('dynamodb')
TABLE_NAME = 'synthetic_data_two_year'
table = dynamodb.Table(TABLE_NAME)


def lambda_handler(event, context):
    try:
        # Enable CORS by setting appropriate headers
        headers = {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',  # Update this to specific domains in production
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
        
        
        # Parse the request body
        body = json.loads(event.get('body', '{}'))
        device_id = body.get('deviceId')
        user_id = body.get('userId')
        start_date = body.get('startDate')
        end_date = body.get('endDate')
        
        # Validate input parameters
        missing_params = [param for param in ['deviceId', 'userId', 'startDate', 'endDate'] if not body.get(param)]
        if missing_params:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'message': f'Missing required parameters: {", ".join(missing_params)}'})
            }
        
        # Initialize variables for pagination
        filtered_items = []
        last_evaluated_key = None
        
        while True:
            # Build the query parameters
            query_params = {
                'KeyConditionExpression': Key('deviceId').eq(device_id) & Key('timestamp').between(start_date, end_date),
                'ProjectionExpression': '#ts, #st',
                'ExpressionAttributeNames': {
                    '#ts': 'timestamp',
                    '#st': 'state'
                },
                'FilterExpression': Attr('userId').eq(user_id)
            }
            
            # Include ExclusiveStartKey only if last_evaluated_key is not None
            if last_evaluated_key:
                query_params['ExclusiveStartKey'] = last_evaluated_key
            
            # Perform the query
            response = table.query(**query_params)
            
            items = response.get('Items', [])

            
            # Append filtered items
            for item in items:
                filtered_items.append({
                    'timestamp': item['timestamp'],
                    'state': item['state']
                })
            
            # Check if there are more pages to fetch
            last_evaluated_key = response.get('LastEvaluatedKey')
            if not last_evaluated_key:
                break  # No more pages
        
        # Sort the filtered items by timestamp
        filtered_items.sort(key=lambda x: x['timestamp'])
        

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps(filtered_items)
        }
    
    except json.JSONDecodeError:
        # Handle JSON parsing errors
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            'body': json.dumps({'message': 'Invalid JSON format in request body'})
        }
    except Exception as e:
        # Handle unexpected errors
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            'body': json.dumps({'message': 'Internal server error', 'error': str(e)})
        }