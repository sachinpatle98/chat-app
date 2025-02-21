import mongoose from "mongoose";
import Channel from "../models/ChannelModal.js";
import UserModel from "../models/UserModel.js";

export const createChannel = async (req, res, next) => {
    try {
        const { name, members } = req.body;

        const userId = req.userId;

        const admin = await UserModel.findById(userId);

        if (!admin) {
            return res.status(400).json({ message: 'Admin not found' });
        }

        const validMembers = await UserModel.find({ _id: { $in: members } });

        if (validMembers.length !== members.length) {
            return res.status(401).json({ message: 'Some members are not valid users.' })
        }

        const newChannel = new Channel({
            name,
            members,
            admin: userId,
        });

        await newChannel.save();

        return res.status(201).json({
            channel: newChannel,
            message: "Channel created successfully"
        })
    } catch (error) {
        console.log({ error });
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}


export const getUserChannels = async (req, res, next) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.userId);
        const channels = await Channel.find({
            $or: [{ admin: userId }, { members: userId }],
        }).sort({ updatedAt: -1 });


        return res.status(200).json({ channels })
    } catch (error) {
        console.log({ error });
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

export const getChannelMessages = async (req, res, next) => {
    try {
        const { channelId } = req.params;
        const channel = await Channel.findById(channelId).populate({
            path: "messages",
            populate: {
                path: "sender",
                select: "firstName lastName email _id image color",
            }
        });
        if (!channel) {
            return res.status(404).json({ message: 'Channel not found' });
        };
        const messages = channel.messages;

        return res.status(200).json({ messages })
    } catch (error) {
        console.log({ error });
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}