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

  // Resolves with the created item; rejects on failure.
  // (It used to swallow errors and resolve with undefined, so a failed save looked successful.)
  create(data, token) {
    return http.post("/materiele/create", data, {
      headers:{
        'Authorization': `Bearer ${token}`
      }
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

  // Resolves with the server response ({ url, filename, message }); rejects on failure so callers can react.
  // (It used to swallow errors and resolve with undefined, so callers could never know what happened.)
  uploadImgMat(formData, token) {
    return http.post('/materiele/uploadImgMat', formData, {
      headers:{
        'content-type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
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