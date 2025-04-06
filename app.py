from flask import Flask, jsonify, request
from flask_cors import CORS  # Enable CORS to allow frontend requests

app = Flask(__name__)
CORS(app)  # Allow all domains for testing

@app.route('/api/students', methods=['GET'])
def get_students():
    # Sample data for demonstration purposes
    students = [
        {
            "firstName": "Darshan",
            "middleName": "",
            "lastName": "Sahoo",
            "dateOfBirth": "2025-03-13",
            "gender": "Male",
            "bloodGroup": "B+",
            "admissionClass": "X",
            "section": "B",
            "rollNo": "1",
            "previousSchool": "",
            "previousClass": "",
            "address": "Jatni",
            "city": "Jatni",
            "pinCode": "752050",
            "mobileNumber": "7894561230",
            "email": "darshansahoo20@gmail.com",
            "fatherName": "aasdf",
            "fatherOccupation": "asdf",
            "motherName": "Lakshya Institute Of Technology",
            "motherOccupation": "asdfasdsf",
            "guardianName": "asdfadsf",
            "guardianRelation": "asdfasdf",
            "parentMobile": "7894561230",
            "parentEmail": "asdfasdfa@asdfadf.clm",
            "id": "id_1742708521387_8m6t97szr",
            "status": "Active",
            "admissionDate": "2025-03-23"
        },
        {
            "firstName": "Darshan",
            "middleName": "Saidarsan",
            "lastName": "Sahoo",
            "dateOfBirth": "2025-03-06",
            "gender": "Male",
            "bloodGroup": "",
            "admissionClass": "VIII",
            "section": "A",
            "rollNo": "1",
            "previousSchool": "",
            "previousClass": "",
            "address": "Jatni",
            "city": "Jatni",
            "pinCode": "752050",
            "mobileNumber": "7894561230",
            "email": "jetofop842@rustetic.com",
            "fatherName": "aasdf",
            "fatherOccupation": "",
            "motherName": "Lakshya Institute Of Technology",
            "motherOccupation": "asdfasdsf",
            "guardianName": "",
            "guardianRelation": "",
            "parentMobile": "7894561230",
            "parentEmail": "",
            "id": "id_1742710138355_291rr65uv",
            "status": "Active",
            "admissionDate": "2025-03-23"
        },
        {
            "firstName": "Siboi",
            "middleName": "Saidarsan",
            "lastName": "Sahoo",
            "dateOfBirth": "2025-03-06",
            "gender": "Female",
            "bloodGroup": "B+",
            "admissionClass": "XI",
            "section": "B",
            "rollNo": "1",
            "previousSchool": "",
            "previousClass": "",
            "address": "Jatni",
            "city": "Jatni",
            "pinCode": "752050",
            "mobileNumber": "7894561230",
            "email": "darshansahoo20@gmail.com",
            "fatherName": "aasdf",
            "fatherOccupation": "asdf",
            "motherName": "Lakshya Institute Of Technology",
            "motherOccupation": "asdfasdsf",
            "guardianName": "asdfadsf",
            "guardianRelation": "asdfasdf",
            "parentMobile": "7894561230",
            "parentEmail": "asdfasdfa@asdfadf.clm",
            "id": "id_1742710200129_bwd4a7961",
            "status": "Active",
            "admissionDate": "2025-03-23"
        }
    ]
    return jsonify(students)

@app.route('/api/students', methods=['POST'])
def post_students():
    data = request.get_json()
    # Here you would typically save the data to a database
    # For demonstration, we'll just return the received data
    print(data)
    return jsonify(data), 201

if __name__ == '__main__':
    app.run(port=8000, debug=True)
