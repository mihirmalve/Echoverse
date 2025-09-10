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
    unique: true,
  },
  avatar: {
            type: String,
            required: false,
            get: (avatar) => {
                if (avatar) {
                    return `${process.env.BASE_URL}${avatar}`;
                }
                return avatar;
            },
        },
  activated: {
    type: Boolean,
    default: false,
  },
},
 {
    timestamps: true,
    toJSON: { getters: true },
});

export default model("User", userSchema);