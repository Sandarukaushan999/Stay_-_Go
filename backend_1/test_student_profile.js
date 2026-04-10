
import mongoose from 'mongoose';
import { StudentProfile } from './src/roommate/models/StudentProfile.js';

async function test() {
    await mongoose.connect('mongodb+srv://sujayadev:sujaya123@cluster0.o5k47.mongodb.net/staygo?retryWrites=true&w=majority', { useNewUrlParser: true });

    try {
        const dummyUserId = new mongoose.Types.ObjectId();
        
        const testProfile = new StudentProfile({
            userId: dummyUserId,
            firstName: "Test",
            lastName: "User",
            email: "test_duplicate@example.com", // This might clash?
            whatsApp: "12345678",
            gender: "Male",
            age: 22,
            sleepSchedule: "NIGHT_OWL",
            cleanliness: 3,
            socialHabits: "MODERATE",
            studyHabits: "ANY"
        });

        await testProfile.validate();
        console.log("Validation passed");
    } catch(err) {
        console.error("Validation error:", err);
    }
    process.exit(0);
}
test();
