
import axios from 'axios';

// Define the API domain and paths we need for our requests


export default {

    getUserById(id) {
        return axios.post(`${process.env.VUE_APP_URL}/auth/getUserById`, {
            data: {
                id: id,
                token: localStorage.getItem("jwt")
            }
        });
    }

};