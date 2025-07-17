import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {Request, Response} from "express";
import {prisma} from "../app";
import dotenv from "dotenv";
dotenv.config();

export const register = async (req: Request, res: Response) => {
  const {name, email, password} = req.body;

  if (!name || !email || !password) {
    res.status(400).json({message: "All fields are required."});
    return;
  }
  try {
    const existingUser = await prisma.user_d.findUnique({where: {email}});
    if (existingUser) {
      res.status(400).json({message: "User with this email already exists."});
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user_d.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    res
      .status(201)
      .json({message: "User created successfully", userId: user.id});
  } catch (error) {
    res.status(500).json({message: "Server error", error});
  }
};
export const login = async (req: Request, res: Response) => {
  console.log("Login request received:", req.body);
  const {email, password} = req.body;

  try {
    const user = await prisma.user_d.findUnique({where: {email}});
    if (!user) {
      res.status(401).json({message: "Invalid credentials."});
      return;
    }
    //    console.log("Login request--------- received:", req.body);
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      res.status(401).json({message: "Invalid credentials."});
      return;
    }

    const jwtSecret = process.env.JWT_SECRET as string;

    const token = jwt.sign(
      {userId: user.id, email: user.email},
      jwtSecret,
      {expiresIn: "5h"} // Token expires in 1 hour
    );
    //  console.log("Login successful for user:", user);
    res.status(200).json({token, userId: user.id, name: user.name});
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({message: "Server error", error});
  }
};
