import axios from "axios";

export default ({ req }) => {

    if(typeof window === 'undefined'){
        //on server
        return axios.create({
            baseURL: 'http://www.ticketing-app-online.xyz/',
            headers : req.headers
        });
    }
    else{
        //on browser
        return axios.create({
            baseURL: '/'
        }); 
    }
};