-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Goal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "heightCm" REAL NOT NULL,
    "weightKg" REAL NOT NULL,
    "age" INTEGER NOT NULL,
    "sex" TEXT NOT NULL,
    "activityLevel" TEXT NOT NULL,
    "goalType" TEXT NOT NULL,
    "bmr" INTEGER NOT NULL,
    "tdee" INTEGER NOT NULL,
    "targetCalories" INTEGER NOT NULL,
    "targetProteinG" INTEGER NOT NULL,
    "targetCarbG" INTEGER NOT NULL,
    "targetFatG" INTEGER NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Goal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DietLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mealName" TEXT NOT NULL,
    "calories" INTEGER NOT NULL,
    "proteinG" INTEGER NOT NULL,
    "carbG" INTEGER NOT NULL,
    "fatG" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DietLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WorkoutLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "exercise" TEXT NOT NULL,
    "sets" INTEGER NOT NULL,
    "reps" INTEGER NOT NULL,
    "weightKg" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WorkoutLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Goal_userId_key" ON "Goal"("userId");
