import axios from "axios";

export default axios.create({
  baseURL: "http://192.168.176.35:3001/api",
  headers: {
    "Content-type": "application/json",
    "Access-Control-Allow-Origin": "*",
    'Access-Control-Allow-Methods':'GET,PUT,POST,DELETE'
  }
});