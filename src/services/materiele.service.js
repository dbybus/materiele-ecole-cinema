import http from "../http-common";
var axios = require("axios").default;

class MaterieleDataService {
  getAccessToken() {
    return axios.post(
      "https://dev-y3473-1j.us.auth0.com/oauth/token",
      {
        grant_type: "client_credentials",
        client_id: configuration.MGMT_API_ID,
        client_secret: configuration.MGMT_API_SECRET,
        audience: "https://dev-y3473-1j.us.auth0.com/api/v2/"
      },
      { headers: { "content-type": "application/json" } }
    ).then(result => {
      // Handle result…
      console.log(result.data);
    }).catch((e) => {
        console.log(e);
        alert(e)
    });
  }
  getAll() {
    /* var auth0 = new ManagementClient({
      domain: 'dev-y3473-1j.us.auth0.com',
      clientId: 'bE1GNeCncuxyByuftibdpOmG0dYkbVIC',
      clientSecret: 'q6jRVj5aEch9NGjCraKB_xF8qqyC-EQB2JVsizGIwj_mHjmHoe1q3C9po-iUeEmX',
      scope: 'read:users update:users'
    });
    console.log(auth0) */
      /* http.post(
      "https://dev-y3473-1j.us.auth0.com/oauth/token",
      { 
        headers: { "content-type": "application/json" },
        body: {"client_id":"pB6AxS4EHqUO5CDINTt5MohQm0KcYfis","client_secret":"-5b7nLTFcvZS3NADhYPmnfzNwZ60NedH3wj8_9QAszNza7dB2r2N0hvWQ8tWfyz-","audience":"https://dev-y3473-1j.us.auth0.com/api/v2/","grant_type":"client_credentials"}
       }
        
    ).then(result => {
      // Handle result…
      console.log(result.data);
    }).catch((e) => {
        console.log(e);
        alert(e)
    }); */

    return http.get("/materiele/findAll", {
      headers:{
        'Content-Type': 'application/json',
        'Access-Control-Allow-Methods':'GET,PUT,POST,DELETE',

      }
    })
  }

 get(id) {
    return http.get(`/materiele/findOne/${id}`);
  }

  async create(data) {
    return http.post("/materiele/create", data)
      .then(result => {
        // Handle result…
        console.log(result.data);
      }).catch((e) => {
          console.log(e);
          alert(e)
      });
  }

  update(id, data) {
    return http.put(`/materiele/update/${id}`, data);
  }

  delete(id) {
    return http.delete(`/materiele/delete/${id}`);
  }

  deleteAll() {
    return http.delete(`/materiele/deleteAll`);
  }

  async uploadImgMat(file) {
    console.log(file);
    return http.post('/materiele/uploadImgMat', file, {
      headers:{
        'content-type': 'multipart/form-data',
        "Access-Control-Allow-Origin": "*",
        'Access-Control-Allow-Methods':'GET,PUT,POST,DELETE',
      }
    }).then(result => {
        // Handle result…
        console.log(result.data);
    }).catch((e) => {
        console.log(e);
        alert(e)
    });
  }

  getFiles() {
    return http.get("/materiele");
  }

  deleteImgMat(data) {
    return http.post('/materiele/deleteImgMat', data, {
      headers:{
        'Content-Type': 'application/json',
        "Access-Control-Allow-Origin": "*",
        'Access-Control-Allow-Methods':'GET,PUT,POST,DELETE',
      }
    });
  }
}

export default new MaterieleDataService();