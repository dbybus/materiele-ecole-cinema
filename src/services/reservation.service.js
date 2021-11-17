import http from "../http-common";
var axios = require("axios").default;

class ReservationDataService {
  getAll() {
    return http.get("/reservation/findAll", {
      headers:{
        'Content-Type': 'application/json',
        'Access-Control-Allow-Methods':'GET,PUT,POST,DELETE',
      }
    })
  }

  async create(data) {
    return http.post("/reservation/create", data)
      .then(result => {
        // Handle result…
        console.log(result.data);
      }).catch((e) => {
          console.log(e);
          alert(e)
      });
  }

  update(id, data) {
    return http.put(`/reservation/update/${id}`, data);
  }

  delete(id) {
    return http.delete(`/reservation/delete/${id}`);
  }
}

export default new ReservationDataService();