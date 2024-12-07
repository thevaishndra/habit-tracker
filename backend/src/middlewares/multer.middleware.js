import multer from 'multer';

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    //where to save uploaded files
    callback(null, "./public/temp");
  }, //null is passed to indicate no error
  filename: function (req, file, callback) {
    //what to name the saved file
    callback(null, file.originalname);
  }, //it uses the same name when it was uploaded
});

export const upload = multer({storage : storage});