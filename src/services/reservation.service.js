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
}

export default new ReservationDataService();