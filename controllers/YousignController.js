import { readFileSync } from 'fs';
import fetch from 'node-fetch';
import FormData from 'form-data';
import { join } from 'path';
import Mission from '../models/Mission.js';


const apiBaseUrl = `https://api-sandbox.yousign.app/v3`;
const apiKey = `5CQ7QlgM0Hof1EJ0FyKc0glxfnZFep3T`;

export const sendContractForSigning = async (req, res) => {
  const { doctorInfo, contractPath,missionId } = req.body;

  if (!contractPath) {
    return res.status(400).json({ error: 'Contract path is required.' });
  }
console.log("contract path",contractPath);

  try {
    const pdfDocumentToSign = join(process.cwd(), contractPath); // Convert to absolute path

    // 1. Create a signature request
    const requestBodyPayload = {
      name: 'Signer le contrat',
      delivery_mode: 'email',
      timezone: 'Europe/Paris',
    };

    let response = await fetch(`${apiBaseUrl}/signature_requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBodyPayload),
    });

    const signatureRequest = await response.json();
    await Mission.findByIdAndUpdate(
      missionId,
      { signatureRequestId: signatureRequest.id }, // Directly set the attribute
      { new: true } // Return the updated document
    );
  console.log("signatureRequestId",signatureRequest);
  
    // 2. Upload the PDF document to Yousign
    const form = new FormData();
    const buffer = readFileSync(pdfDocumentToSign); // Load the file using absolute path
    form.append('file', buffer, 'file.pdf');
    form.append('nature', 'signable_document');

    response = await fetch(`${apiBaseUrl}/signature_requests/${signatureRequest.id}/documents`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: form,
    });

    const document = await response.json();
console.log("document",document);

    // 3. Add signer information
    const signerPayload = {
      info: {
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        locale: 'tn',
      },
      signature_authentication_mode: 'no_otp',
      signature_level: 'electronic_signature',
      fields: [
        {
          document_id: document.id,
          type: 'signature',
          height: 40,
          width: 85,
          page: 1,
          x: 100,
          y: 100,
        },
      ],
    };

    await fetch(`${apiBaseUrl}/signature_requests/${signatureRequest.id}/signers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(signerPayload),
    });

    // 4. Activate the signature request
    await fetch(`${apiBaseUrl}/signature_requests/${signatureRequest.id}/activate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
    });

    res.status(200).json({ message: 'Signature request created and activated successfully.' });
  } catch (error) {
    console.error('Error during the Yousign process:', error);
    res.status(500).json({ error: 'Failed to send contract for signing.' });
  }
};
// 5. Check the status of the signature request
export const checkSignatureStatus = async (req, res) => {
  const { signatureRequestId } = req.params;


  try {
    const response = await fetch(`${apiBaseUrl}/signature_requests/${signatureRequestId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch signature status');
    }

    const signatureRequestStatus = await response.json();
console.log("signatureRequestStatus.status",signatureRequestStatus.status);

    res.status(200).json({
      status: signatureRequestStatus.status, // Possible statuses: 'pending', 'signed', 'completed', etc.
      message: 'Signature request status retrieved successfully.',
    });
  } catch (error) {
    console.error('Error fetching signature status:', error);
    res.status(500).json({ error: 'Failed to retrieve signature status.' });
  }
};

