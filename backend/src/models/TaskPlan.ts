import mongoose, { Document, Schema } from 'mongoose';

export interface ITaskPlan extends Document {
  goal: string;
  steps: string[];
  createdAt: Date;
}

const TaskPlanSchema: Schema = new Schema({
  goal: { type: String, required: true },
  steps: { type: [String], required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<ITaskPlan>('TaskPlan', TaskPlanSchema);
