import jwt from "jsonwebtoken";
import UserModel from "../models/UserModel.js";
import { compare } from "bcrypt";
import { renameSync, unlinkSync } from "fs"


const maxAge = 3 * 24 * 60 * 60 * 1000;
const createToken = (email, userId) => {
    return jwt.sign({ email, userId }, process.env.JWT_KEY, { expiresIn: maxAge })
}

export const signup = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and Password is required' });
        }

        const user = await UserModel.create({ email, password });
        res.cookie("jwt", createToken(email, user.id), {
            maxAge,
            secure: true,
            sameSite: "None",
        });
        return res.status(201).json({
            message: "User Registered successfully",
            user: {
                id: user.id,
                email: user.email,
                profileSetup: user.profileSetup,
            }
        })

    } catch (error) {
        console.log({ error });
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and Password is required' });
        }

        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User with the given email not found' });
        }

        const auth = await compare(password, user.password);
        if (!auth) {
            return res.status(404).json({ message: 'Password is incorrect' });
        }



        res.cookie("jwt", createToken(email, user.id), {
            maxAge,
            secure: true,
            sameSite: "None",
        });
        return res.status(200).json({
            message: "User logged in successfully",
            user: {
                id: user.id,
                email: user.email,
                profileSetup: user.profileSetup,
                firstName: user.firstName,
                lastName: user.lastName,
                image: user.image,
                color: user.color
            }
        })

    } catch (error) {
        console.log({ error });
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

export const getUserInfo = async (req, res, next) => {
    try {
        const userData = await UserModel.findById(req.userId);
        if (!userData) {
            return res.status(404).json({ message: 'User with given ID not found' });
        }
        return res.status(200).json({
            id: userData.id,
            email: userData.email,
            profileSetup: userData.profileSetup,
            firstName: userData.firstName,
            lastName: userData.lastName,
            image: userData.image,
            color: userData.color

        })

    } catch (error) {
        console.log({ error });
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

export const updateProfile = async (req, res, next) => {
    try {
        const { userId } = req;
        const { firstName, lastName, color } = req.body;
        if (!firstName || !lastName) {
            return res.status(400).json({ message: 'First Name, Last Name are required' });
        }

        const userData = await UserModel.findByIdAndUpdate(userId, { firstName, lastName, color, profileSetup: true }, { new: true, runValidators: true });

        return res.status(200).json({
            id: userData.id,
            email: userData.email,
            profileSetup: userData.profileSetup,
            firstName: userData.firstName,
            lastName: userData.lastName,
            image: userData.image,
            color: userData.color

        })

    } catch (error) {
        console.log({ error });
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

export const addPofileImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image uploaded' });
        }

        const date = Date.now();
        let fileName = "uploads/profiles/" + date + req.file.originalname;
        renameSync(req.file.path, fileName);

        const updatedUser = await UserModel.findByIdAndUpdate(req.userId, { image: fileName }, { new: true, runValidators: true });
        return res.status(200).json({
            message: "Image uploaded successfully",
            image: updatedUser?.image
        })

    } catch (error) {
        console.log({ error });
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

export const removePofileImage = async (req, res, next) => {
    try {
        const { userId } = req;
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user?.image) {
            unlinkSync(user?.image);
        }
        user.image = null;
        await user.save();


        return res.status(200).json({ message: "Profile image removed successfully" })
    } catch (error) {
        console.log({ error });
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

export const logOut = async (req, res, next) => {
    try {
        res.cookie("jwt", "", { maxAge: 1, secure: true, sameSite: "none" });

        return res.status(200).json({ message: "Logout successfully" })
    } catch (error) {
        console.log({ error });
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}