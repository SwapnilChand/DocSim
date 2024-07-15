// src/App.js
import React, { useState } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';

function App() {
    const [files, setFiles] = useState([]);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);

    const onDrop = (acceptedFiles) => {
        setFiles(acceptedFiles);
    };

    const { getRootProps, getInputProps } = useDropzone({ onDrop });

    const handleUpload = async () => {
        const formData = new FormData();
        formData.append('file', files[0]);
        formData.append('id', Date.now().toString());

        try {
            await axios.post(`http://localhost:8000/api/upload/`, formData);
            alert("File uploaded successfully!");
        } catch (error) {
            console.error("Error uploading file:", error);
        }
    };

    const handleSearch = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/api/similar`, {
                params: { query }
            });
            setResults(response.data);
        } catch (error) {
            console.error("Error searching:", error);
        }
    };

    return (
        <div>
            <h1>Document Similarity Finder</h1>
            <div {...getRootProps({ className: 'dropzone' })}>
                <input {...getInputProps()} />
                <p>Drag 'n' drop a document here, or click to select one</p>
            </div>
            <button onClick={handleUpload}>Upload Document</button>
            <br />
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter search query"
            />
            <button onClick={handleSearch}>Search Similar Documents</button>
            <ul>
                {results.map((result) => (
                    <li key={result.id}>{result.id} - Score: {result.score}</li>
                ))}
            </ul>
        </div>
    );
}

export default App;
