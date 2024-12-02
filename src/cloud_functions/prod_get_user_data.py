import json
import boto3


# Initialize the DynamoDB resource
dynamodb = boto3.resource('dynamodb')
TABLE_NAME = "prod_users"
table = dynamodb.Table(TABLE_NAME)

def lambda_handler(event, context):
    try:
        # Extract 'userId' from query parameters
        query_params = event.get('queryStringParameters') or {}
        user_id = query_params.get('userId')

        if not user_id:
            return generate_response(400, {"message": "Missing required parameter: userId."})

        # Retrieve the user item from DynamoDB
        response = table.get_item(
            Key={
                'userId': user_id
            }
        )

        # Check if the item exists
        if 'Item' not in response:
            return generate_response(404, {"message": f"User with userId '{user_id}' not found."})

        user_item = response['Item']

        # Optional: Convert numerical strings to actual numbers
        # For example, convert 'baseRatePerKWh' and 'peakRatePerKWh' from strings to floats
        if 'baseRatePerKWh' in user_item:
            user_item['baseRatePerKWh'] = float(user_item['baseRatePerKWh'])
        if 'peakRatePerKWh' in user_item:
            user_item['peakRatePerKWh'] = float(user_item['peakRatePerKWh'])
        if 'offPeakRatePerKWh' in user_item:
            try:
                user_item['offPeakRatePerKWh'] = float(user_item['offPeakRatePerKWh'])
            except ValueError:
                # Handle cases where 'offPeakRatePerKWh' might not be a number
                pass

        # Return the user item
        return generate_response(200, {"data": user_item})

    except Exception:
        return generate_response(500, {"message": "Internal server error."})

def generate_response(status_code, body):
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",  # Replace '*' with specific origins for better security
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        },
        "body": json.dumps(body)
    }
