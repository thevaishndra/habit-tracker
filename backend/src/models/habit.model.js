
// const HabitSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   name: { type: String, required: true },
//   target: { type: Number, required: true },
//   priority: {
//     type: String,
//     enum: ["Low", "Medium", "High"],
//     default: "Medium",
//   }, // New field
//   createdAt: { type: Date, default: Date.now },
// });
// async function getHabitsSortedByPriority(userId) {
//   const habits = await Habit.find({ userId }).sort({
//     priority: -1, // Higher priority first
//     createdAt: 1, // If priority is the same, sort by creation date
//   });
//   return habits;
// }