import mongoose from 'mongoose'

const Member = mongoose.model(
    "Member",
    new mongoose.Schema(
        {
            Name: String,
            Surname:String,
            Allergens: [String],
        },
        {
            timestamps: true
        }
    )
);

export { Member } 