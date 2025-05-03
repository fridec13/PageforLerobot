import axios from 'axios';

const API_URL = 'http://localhost:8080/api/users';

export const signupUser = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/signup`,userData);
        return response.data;
    } catch(error) {
        console.error('회원가입 오류 : ', error.response?.data || error.message);
        throw error;
    }
}