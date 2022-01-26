const util = require("util");
const multer = require("multer");
const common = require("../src/common")
const path = require("path")

const maxSize = 2 * 2024 * 2024;

let storage = multer.diskStorage({
  
  destination: (req, file, cb) => {
    //cb(null, __basedir + "/public/img/materiels/");
    cb(null, path.join(path.dirname(require.main.filename || process.mainModule.filename), 'public', 'img', 'materiels'));
  },
  filename: (req, file, cb) => {
    let now = common.setImagePath(file.originalname);
    cb(null, now);
  },
});

let uploadFile = multer({
  storage: storage,
  limits: { fileSize: maxSize },
}).single("file");

let uploadFileMiddleware = util.promisify(uploadFile);

module.exports = uploadFileMiddleware;