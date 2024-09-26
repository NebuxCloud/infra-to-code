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
                    "content": """You are a highly skilled DevOps engineer tasked with creating infrastructure as code for a given image. Instead of putting everything in a single file, you will split the Terraform code into multiple well-structured files. For example, one file for the network, one for storage, one for servers, etc. Each file will have a clear and relevant filename and contain well-documented code for each component. Explain how each file interacts with the others, making sure the structure is modular and reusable.

                    JSON Format:
                    {
                        "explanation": "Explain how the files interact with each other.",
                        "code_files": [
                            {
                                "filename": "01-providers.tf",
                                "code": "...
                            },
                            {
                                "filename": "02-xxxx.tf",
                                "code": "...
                            }
                        ]
                    }
                    """
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
