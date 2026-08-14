import axios from 'axios';

export const BASE_URL = 'http://192.168.1.188:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
});

export const registerStudent = async (firstName, lastName, matricule, password) => {
  const response = await api.post('/auth/student/register', {
    firstName,
    lastName,
    matricule,
    password
  });
  return response.data;
};

export const loginStudent = async (matricule, password) => {
  const response = await api.post('/auth/student/login', {
    matricule,
    password
  });
  return response.data;
};
export const loginAdmin = async (email, password) => {
  const response = await api.post('/auth/admin/login', {
    email,
    password
  });
  return response.data;
};