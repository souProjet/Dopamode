-- CreateEnum
CREATE TYPE "QuestRating" AS ENUM ('upvote', 'downvote');

-- AlterTable
ALTER TABLE "quest_logs" ADD COLUMN     "rating" "QuestRating",
ADD COLUMN "feedback_reason" TEXT;
