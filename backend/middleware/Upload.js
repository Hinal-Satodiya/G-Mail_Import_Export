const multer = require('multer');
const path = require('path');


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads');
    },
    filename: (req, file, cb) => {
        console.log(file)
        const rename = Date.now() + "-" + file.originalname;
        cb(null, rename);
    }
});

const upload = multer({ storage: storage });
module.exports = upload;
