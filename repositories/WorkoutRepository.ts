import { Workout } from "../models/workout";

export class WorkoutRepository {
  async findByGoalAndLevel(goal: string, level: string) {
    return await Workout.find({ goal, level });
  }

  async findById(id: string) {
    return await Workout.findById(id);
  }

  async create(workoutData: any) {
    return await Workout.create(workoutData);
  }
}

export const workoutRepository = new WorkoutRepository();
