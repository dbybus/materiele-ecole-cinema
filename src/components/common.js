const moment = require("moment")

module.exports.RoleEnum = { Admin: '0', Editor: '1', Reader: '3'};

module.exports.setImagePath = function(filename){
    let extension = filename.substring(filename.lastIndexOf('.') + 1, filename.length) || filename;
    let fileName = filename.substring(0, filename.lastIndexOf('.')) || filename;
    let now = moment().format("DDMMyyHHmm");

    return fileName+"_"+now+"."+extension;
};

module.exports.convertDateToFr = function(date){
    moment.locale('FR')
    
    return moment(date).format("DD MMMM YYYY");
}

module.exports.calcDays = function(startDate, endDate){
    
    var difference_in_time = endDate - startDate;
    var difference_in_days = (difference_in_time / (1000 * 3600 * 24)) + 1;

    return difference_in_days;
}

module.exports.calcTotalPrice = function(materiel){
 
    let total = 0;
    
    materiel.map(async (element, index) =>{
        total += element.tarifLoc * element.quantite;
        //setTotatSum(total);
    })

    return total;
}