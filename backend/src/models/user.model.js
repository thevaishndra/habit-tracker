import mongoose, { Schema } from "mongoose";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    profilePic: {
      type: String,//cloudinary url
      default: "",
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    refreshToken : {
      type : String,
    }
  },
  { timestamps: true }
);

//hashing the password before saving
userSchema.pre("save", async function (next) {//it gets triggered whenever save is called
  if(!this.isModified("password")) return next();//it checks if password is modified
  this.password = await bcrypt.hash(this.password, 10);//it hashes the password, 10 is used as default
  next();//these functions take time 
})

//verifying password
userSchema.methods.isPasswordCorrect = async function (password){
  return await bcrypt.compare(password, this.password)//it is comparing given password with stored hashed password
}

//creating access token - short lived
userSchema.methods.generateAccessToken = function () {
  return jwt.sign (
    {
      _id : this._id,
      email : this.email,
      password : this.password,
      fullName : this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn : process.env.ACCESS_TOKEN_EXPIRY
    }
  )
}
//creating refresh token - long lived
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign (
    {
      _id : this._id
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn : process.env.REFRESH_TOKEN_EXPIRY
    }
  )
}
//refesh token is used to get mew access token if current one expires

export const User = mongoose.model("User", userSchema)