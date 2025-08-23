import  mongoose from "mongoose";

const userSchema = new mongoose.Schema({
	username: String,
	email: {type: String, unique: true, sparse: true},
	password: String,
	googleId: String,
})

export default mongoose.model("User", userSchema);
