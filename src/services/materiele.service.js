import http from "../http-common";

class MaterieleDataService {
  getAll(token) {
    return http.get("/materiele/findAll", {
      headers:{
        'Authorization': `Bearer ${token}`
      }
    })
  }

 get(id, token) {
    return http.get(`/materiele/findOne/${id}`, {
      headers:{
        'Authorization': `Bearer ${token}`
      }
    });
  }

  async create(data, token) {
    return http.post("/materiele/create", data, {
      headers:{
        'Authorization': `Bearer ${token}`
      }
    })
      .then(result => {
        // Handle result…
        console.log(result.data);
      }).catch((e) => {
          console.log(e);
          alert(e)
      });
  }

  update(id, data, token) {
    return http.put(`/materiele/update/${id}`, data, {
      headers:{
        'Authorization': `Bearer ${token}`
      }
    });
  }

  delete(id, token) {
    return http.delete(`/materiele/delete/${id}`, {
      headers:{
        'Authorization': `Bearer ${token}`
      }
    });
  }

  deleteAll(token) {
    return http.delete(`/materiele/deleteAll`, {
      headers:{
        'Authorization': `Bearer ${token}`
      }
    });
  }

  async uploadImgMat(file, token) {
    console.log(file);
    return http.post('/materiele/uploadImgMat', file, {
      headers:{
        'content-type': 'multipart/form-data',
        "Access-Control-Allow-Origin": "*",
        'Access-Control-Allow-Methods':'GET,PUT,POST,DELETE',
        'Authorization': `Bearer ${token}`
      }
    }).then(result => {
        // Handle result…
        console.log(result.data);
    }).catch((e) => {
        console.log(e);
        alert(e)
    });
  }

  deleteImgMat(data, token) {
    return http.post('/materiele/deleteImgMat', data, {
      headers:{
        'Content-Type': 'application/json',
        "Access-Control-Allow-Origin": "*",
        'Access-Control-Allow-Methods':'GET,PUT,POST,DELETE',
        'Authorization': `Bearer ${token}`
      }
    });
  }
}

export default new MaterieleDataService();