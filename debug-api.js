// Debug script to test API endpoints
// Copy this to browser console when app is running

// Test current user
async function testCurrentUser() {
  try {
    const response = await fetch('https://talentbridge-production-4e59.up.railway.app/api/v1/auth/me', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    console.log('Current User:', data);
  } catch (error) {
    console.error('Current User Error:', error);
  }
}

// Test my applications
async function testMyApplications() {
  try {
    const response = await fetch('https://talentbridge-production-4e59.up.railway.app/api/v1/applications/my-applications', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    console.log('My Applications:', data);
  } catch (error) {
    console.error('My Applications Error:', error);
  }
}

// Test token
console.log('Current Token:', localStorage.getItem('token'));
console.log('Current User ID:', localStorage.getItem('userId'));
console.log('Current Role:', localStorage.getItem('role'));

// Run tests
testCurrentUser();
testMyApplications();
