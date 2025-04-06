export function GetSomething() {

    console.log("Get Get Something...");
    const base_url = "https://nicely-clear-joey.ngrok-free.app";
    // const fetch = require('node-fetch');  // Import node-fetch for Node.js environment
    // const endpoint = base_url + "/students/post_student"; // Student Admission Endpoint
    const endpoint = base_url + "/academic/post_academic";

    const jsonData = {
        "id": "103",
        "firstName": "Justice v3",
        "middleName": "Varun v3",
        "lastName": "Noname v3",
        "dateOfBirth": "2000-11-16",
        "gender": "Male",
        "bloodGroup": "O +ve",
        "photoUrl": "assdfasdfasdfasdfasdfasdfsadf"
    };

    const jsonAcademicData = {
        "admission_class" : "X",
        "section" : "A",
        "roll_no" : 102,
        "previous_school" : "XYZ",
        "previous_class" : "IX"
 
 }

    console.error("Something Went Wrong...");

    // Use the fetch API to send a POST request
    fetch(endpoint, {
        method: 'POST', // or 'PUT' depending on the API you're using
        headers: {
            'Content-Type': 'application/json', // The type of data being sent
        },
        body: JSON.stringify(jsonAcademicData), // Convert the JSON object to a string
    })
        .then(response => {
            if (!response.ok) {
                // Log status code and status text to understand why it failed
                console.log(`Error: ${response.status} - ${response.statusText}`);
                return response.text(); // Get the response body as text
            }
            return response.json(); // Parse the successful JSON response
        })
        .then(data => {
            console.log('Success:', data); // Log the successful response
        })
        .catch(error => {
            console.error('Error:', error); // Catch any network errors
        });
}

// GetSomething();