const moment = require("moment")

module.exports.RoleEnum = { Admin: '0', Editor: '1', Reader: '3'};

module.exports.setImagePath = function(filename){
    let extension = filename.substring(filename.lastIndexOf('.') + 1, filename.length) || filename;
    let fileName = filename.substring(0, filename.lastIndexOf('.')) || filename;
    let now = moment().format("DDMMyyHHmm");

    return fileName+"_"+now+"."+extension;
};

