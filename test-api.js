const axios = require('axios');

async function testEndpoints() {
    const baseURL = 'http://localhost:5000/api';
    
    try {
        // Test root endpoint
        console.log('Testing root endpoint...');
        const rootResponse = await axios.get(baseURL);
        console.log('✅ Root endpoint:', rootResponse.data);
        
        // Test projects endpoint
        console.log('\nTesting projects endpoint...');
        const projectsResponse = await axios.get(`${baseURL}/projects`);
        console.log(`✅ Projects endpoint: Found ${projectsResponse.data.length} projects`);
        
        // Test testimonials endpoint
        console.log('\nTesting testimonials endpoint...');
        const testimonialsResponse = await axios.get(`${baseURL}/testimonials`);
        console.log(`✅ Testimonials endpoint: Found ${testimonialsResponse.data.length} testimonials`);
        
        // Test internships endpoint
        console.log('\nTesting internships endpoint...');
        const internshipsResponse = await axios.get(`${baseURL}/internships`);
        console.log(`✅ Internships endpoint: Found ${internshipsResponse.data.length} internships`);
        
    } catch (error) {
        if (error.response) {
            // The request was made and the server responded with a status code
            console.error('❌ Error response:', {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data
            });
        } else if (error.request) {
            // The request was made but no response was received
            console.error('❌ No response received:', error.request);
        } else {
            // Something happened in setting up the request
            console.error('❌ Request setup error:', error.message);
        }
    }
}

testEndpoints();
