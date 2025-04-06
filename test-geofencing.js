// Test script for geofencing and attendance features
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000';
let authCookie = '';

async function login() {
  const response = await fetch(`${API_BASE}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'admin',
      password: 'password'
    }),
    redirect: 'manual'
  });
  
  // Extract session cookie for subsequent requests
  const cookies = response.headers.get('set-cookie');
  if (cookies) {
    authCookie = cookies;
    console.log('Login successful');
  } else {
    console.log('Login failed, no cookie received');
  }
  
  return response;
}

async function getGeofenceZones() {
  const response = await fetch(`${API_BASE}/api/geofence-zones`, {
    headers: { 
      'Cookie': authCookie 
    }
  });
  const data = await response.json();
  console.log('Geofence zones:', JSON.stringify(data, null, 2));
  return data;
}

async function getAttendanceRecords() {
  const response = await fetch(`${API_BASE}/api/attendance`, {
    headers: { 
      'Cookie': authCookie 
    }
  });
  const data = await response.json();
  console.log('Attendance records:', JSON.stringify(data, null, 2));
  return data;
}

async function main() {
  try {
    await login();
    await getGeofenceZones();
    await getAttendanceRecords();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();