from flask import Flask, jsonify, request
import boto3
import os
import uuid
from pydantic import BaseModel
from openai import OpenAI
from typing import List

app = Flask(__name__)
openai = OpenAI()

# Information to retrieve using OpenAI
class TerraformCode(BaseModel):
    filename: str
    code: str

class ImageProcessing(BaseModel):
    explanation: str
    code_files: List[TerraformCode]

# Route to process an infrastructure image
@app.route('/ProcessInfrastructureImage', methods=['POST'])
def process_infrastructure_image():
    try:
        # Receive the image URL
        image_url = request.json.get('image_url')

        completion = openai.beta.chat.completions.parse(
            model="gpt-4o-2024-08-06",
            response_format=ImageProcessing,
            messages=[
                {
                    "role": "system",
                    "content": """You are a highly skilled DevOps engineer tasked with creating infrastructure as code for a given image. Imagine you’re building a well-structured environment where each component has a specific role. For example, the network is like a communication system, the storage is where important data is kept, and servers act as the brains, processing tasks and requests. Your job is to write Terraform code that mirrors the infrastructure shown in the image. Make sure to clearly define each component—like the network, storage, and servers—and explain how they all work together, ensuring a smooth and efficient system. The goal is to create clear and effective instructions that describe the infrastructure as seen in the image, and anyone should be able to understand the connection and purpose of each piece."""
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": image_url
                            }
                        }
                    ]
                }
            ]
        )

        message = completion.choices[0].message

        print(message.parsed)

        return jsonify(message.parsed.dict())
    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(debug=True)

def handle_rest(event, context):
    app.run(host="0.0.0.0", port=8080)
