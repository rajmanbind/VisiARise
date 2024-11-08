import User from "../models/user.model.js";

import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

const generateToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { refreshToken };
  } catch (error) {
    console.log(error.message);
    return res.status(500).json(ApiResponse(500, {}, "Internal server error"));
  }
};

const registerUser = asyncHandler(async (req, res) => {

  const { name, email, password } = req.body;
  console.log(name, email, password);
  if ([email, name, password].some((field) => field?.trim() === "")) {
    return res
      .status(400)
      .json(ApiResponse(400, {}, "All fields are required!"));
  }

  const existedUser = await User.findOne({ email });
  if (existedUser) {
    return res
      .status(500)
      .json(ApiResponse(409, {}, "User with email or username already exist!"));
  }

  const user = await User.create({
    email,
    password,
    fullName: name,
  });
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    return res
      .status(500)
      .json(
        ApiResponse(500, {}, "Something went wrong while registering the user")
      );
  }

  return res
    .status(201)
    .json(ApiResponse(200, createdUser, "User registerd successfully!"));

});

const loginUser = asyncHandler(async (req, res) => {
  const { email, phone, password } = req.body;
  try {
    if (!email && !phone) {
      return res
        .status(400)
        .json(ApiResponse(400, {}, "phone or email required!"));
    }
    if (!password) {
      return res.status(400).json(ApiResponse(400, {}, "password required!"));
    }
    const user = await User.findOne({email});

    // console.log(user);
    if (!user) {
      return res.status(401).json(ApiResponse(401, {}, "user does not exist!"));
    }
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json(ApiResponse(401, {}, "Invalid user credentials"));
    }

    const { refreshToken } = await generateToken(user._id);

    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("refreshToken", refreshToken, options)
      .json(
        ApiResponse(
          200,
          {
            user: loggedInUser,
            refreshToken,
          },
          "User logged In Successfully"
        )
      );
  } catch (error) {
    return res.status(500).json(ApiResponse(500, {}, error.message));
  }
});

export { registerUser, loginUser };
