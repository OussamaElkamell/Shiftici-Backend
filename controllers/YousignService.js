// yousignService.js
import fetch from 'node-fetch'; // Ensure you install node-fetch

export const sendToYousign = async (contractFilePath, doctorId) => {
    const url = 'https://api.yousign.com/v1/signatures'; // Replace with your actual Yousign endpoint

    const formData = new FormData();
    formData.append('file', fs.createReadStream(contractFilePath)); // Assuming you have access to the file
    formData.append('recipient', JSON.stringify({
        email: 'doctor@example.com', // Replace with the doctor's email
        name: 'Doctor Name' // Replace with the doctor's name
    }));
    // Add other necessary fields according to Yousign's API requirements

    const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
            // Add necessary headers for Yousign API, if required
            // For example: 'Authorization': 'Bearer YOUR_API_KEY'
        }
    });

    if (!response.ok) {
        throw new Error('Failed to send to Yousign: ' + response.statusText);
    }

    return await response.json();
};
