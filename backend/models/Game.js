import mongoose from "mongoose";

const gameSchema = new mongoose.Schema(
  {
    name: {
        type: String,
        required: true,
    },
    version: {
        type: String,
        required: true,
    }
    
  },
  { timestamps: true }
);

const Game = mongoose.model("Game", gameSchema);

export default Game;