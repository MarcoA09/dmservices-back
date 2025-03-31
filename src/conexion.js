import mongoose from 'mongoose';
import {MONGODB_URI} from './config.js';

export const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Conectado a Mongo');
        
        return mongoose.connection.db;
    } catch (error) {
        console.log(error);
    }
}