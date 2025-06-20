import mongoose from "mongoose";
import { type } from "os";
const {Schema , model} = mongoose;
 

const userSchema = new Schema({
  name:{
    type : String,
    required: false,
  },
  phone:{
    type : String,
    required: true,
  },
  avatar: {
    type: String,
    required: false,
  },
  activated: {
    type: Boolean,
    default: false,
  },
},
 {
    timestamps: true
});

export default model("User", userSchema);