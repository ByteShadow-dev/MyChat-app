//mongodb://localhost:27017/

import mongoose from 'mongoose';

export const connectDB = async (connectionString) => {
    try {
        await mongoose.connect(connectionString, {
           // serverSelectionTimeoutMS: 5000,
            //tls: true,
            //tlsAllowInvalidCertificates: true,
        });
        console.log('Connected to MongoDB');
    }
    catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};
