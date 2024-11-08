import User from "../models/user.model.js";
import apiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer", "");
        console.log(token);
        if (!token) {
        return res.status(401).json(apiResponse(401, {}, "Unauthorized Token"));
    }
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken._id).select(
      "-password -refreshToken"
    );
    if (!user) {
      //Todo discuss about frontend
      return res.status(401).json(ApiResponse(401, {}, "Invalid Access Token"));
    }
    
    req.user = user;
    next();
} catch (error) {
      return res.status(401).json(ApiResponse(401, {}, error?.message ||"Invalid Access Token"));
  }
});

export default verifyJWT;
