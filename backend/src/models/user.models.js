import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

async function generateUniqueUsername() {
  let username;
  let exists = true;

  while (exists) {
    const randomNum = Math.floor(100 + Math.random() * 900);
    username = `person${randomNum}`;
    exists = await mongoose.models.User.findOne({ username });
  }

  return username;
}

const userSchema = new Schema(
  {
    username: {
      // for leaderboard names
      type: String,
      required: false,
      trim: true,
      unique: true,
    },
    email: {
      // for signup login
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      // for signup login
      type: String,
      required: [true, "Password is required"],
    },
    description: {
      // for leaderboard or profile
      type: String,
      required: false,
    },
    // field: {          // for caterogry leaderboard or profile
    //     type: String,
    //     trim: true
    // },
    avatar: {
      // for actual photo or default given by system
      type: String,
      required: false,
    },
    // friends:
    //     [
    //         {
    //             type: Schema.Types.ObjectId,
    //             ref: "User"
    //         }
    //     ],
    isActive: {
      type: Boolean,
      default: true,
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 8);
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.pre("save", async function () {
  // hash password
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 8);
  }

  // generate username if missing
  if (!this.username) {
    this.username = await generateUniqueUsername();
  }
});

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

export const User = mongoose.model("User", userSchema);
