import axios from "axios";
import TokenService from '../src/services/token.service';

const axiosApiInstance =  axios.create(
{ 
  //baseURL: "https://localhost:3001/api",
  baseURL: "https://192.168.176.35:3001/api",
  headers: {
    'Content-type': 'application/json',
    'Access-Control-Allow-Methods':'GET,PUT,POST,DELETE',
    'Access-Control-Allow-Origin': '*',
    "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept"
  }
});

// Request interceptor for API calls
axiosApiInstance.interceptors.request.use(
  (config) => {
    
    const token = TokenService.getLocalAccessToken();
    
    console.log("AXIOS TOKEN ",token)
    if (token) {
      config.headers["Authorization"] = 'Bearer ' + token;  // for Spring Boot back-end
      //config.headers["x-access-token"] = token; // for Node.js Express back-end
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosApiInstance.interceptors.response.use(
  (res) => {
    //console.log(res)
 
    return res;
  },
  async (err) => {
    const originalConfig = err.config;

    if (originalConfig.url !== "/auth/signin" && err.response) {
      // Access Token was expired
      if (err.response.status === 401 && !originalConfig._retry) {
        originalConfig._retry = true;
        /* try {
          const rs = await instance.post("/auth/refreshtoken", {
            refreshToken: TokenService.getLocalRefreshToken(),
          });

          const { accessToken } = rs.data;
          TokenService.updateLocalAccessToken(accessToken);

          return instance(originalConfig);
        } catch (_error) {
          return Promise.reject(_error);
        } */
      }
    }

    return Promise.reject(err);
  }
);


export default axiosApiInstance;