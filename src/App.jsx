import React, { useState } from 'react';
import JSZip from 'jszip';

function App() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);

  // Handle the file upload
  const handleFileChange = (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setError(null);
    }
  };

  // Extract images from the uploaded zip file, rename them, and trigger download
  const handleUpload = async () => {
    if (!file) {
      setError('Please upload a zip file first.');
      return;
    }

    const zip = new JSZip();
    try {
      const zipContent = await zip.loadAsync(file);

      // Filter for image files inside the zip
      const files = Object.keys(zipContent.files).filter(fileName =>
        fileName.match(/\.(jpg|jpeg|png|gif|bmp)$/i) // Only image files
      );

      // Create a new zip instance for the updated files
      const newZip = new JSZip();
      
      // Add the images back to the same folder (preserve folder structure)
      for (let i = 0; i < files.length; i++) {
        const fileName = files[i];
        const fileData = await zipContent.files[fileName].async('blob');

        // Extract folder path (if any) and the original file name
        const filePath = fileName.split('/').slice(0, -1).join('/'); // Get the folder path (if any)
        const originalFileName = fileName.split('/').pop(); // Get the actual file name (without folder)

        // Generate the new file name with the sequential number at the start (e.g., 0001_image.jpg)
        const newFileName = `${String(i + 1).padStart(5, '0')} ${originalFileName}`;

        // If the file is in a folder, preserve the folder structure
        if (filePath) {
          newZip.folder(filePath).file(newFileName, fileData);
        } else {
          // If no folder, just add the file directly
          newZip.file(newFileName, fileData);
        }
      }

      // Generate the updated zip file
      const zipBlob = await newZip.generateAsync({ type: 'blob' });

      // Trigger the download of the updated zip file
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipBlob);
      link.download = 'updated_images.zip';
      link.click();
    } catch (err) {
      setError('Error extracting zip file.');
    }
  };

  return (
    <div>
      <h1>Upload and Rename Images</h1>

      <input type="file" accept=".zip" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload & Extract</button>

      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
}

export default App;
