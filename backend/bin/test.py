import requests
import json

def send_email(recipient_email, subject, body_html):
    """
    Send an email using the Golang Fiber email API.
    
    Args:
        recipient_email (str): Email address of the recipient
        subject (str): Subject line of the email
        body_html (str): HTML content of the email body
    
    Returns:
        dict: Response from the API
    """
    # API endpoint URL (update with your actual server address)
    url = "http://localhost:3001/send-email"
    
    # Prepare the email data
    email_data = {
        "to": [recipient_email],  # Can include multiple recipients in this list
        "subject": subject,
        "body": body_html
    }
    
    # Convert data to JSON format
    json_data = json.dumps(email_data)
    
    # Set headers for JSON content
    headers = {
        "Content-Type": "application/json"
    }
    
    # Make the POST request
    response = requests.post(url, data=json_data, headers=headers)
    
    # Check if the request was successful
    if response.status_code == 200:
        print("Email sent successfully!")
        return response.json()
    else:
        print(f"Failed to send email. Status code: {response.status_code}")
        print(f"Response: {response.text}")
        return None

# Example usage
if __name__ == "__main__":
    # Email details
    recipient = "darwil.nicolas@gmail.com"
    email_subject = "Test Email from Python"
    email_body = """
    <html>
        <body>
            <h1>Hello from Python!</h1>
            <p>This is a test email sent using Python requests to our Golang Fiber API.</p>
            <p>Have a great day!</p>
        </body>
    </html>
    """
    
    # Send the email
    result = send_email(recipient, email_subject, email_body)
    
    # Print the result
    if result:
        print(f"API Response: {result}")