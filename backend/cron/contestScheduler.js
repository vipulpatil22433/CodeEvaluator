const cron = require('node-cron');
const Contest = require('../models/Contest');
const Question = require('../models/Question');

const sampleQuestions = async (difficulty, size) => {
  const questions = await Question.aggregate([
    { $match: { difficulty } },
    { $sample: { size } }
  ]);

  if (questions.length === size) return questions;

  const remaining = size - questions.length;
  const fallback = await Question.aggregate([
    { $match: { _id: { $nin: questions.map((q) => q._id) } } },
    { $sample: { size: remaining } }
  ]);

  return [...questions, ...fallback];
};

const createContestIfMissing = async ({ title, description, startTime, endTime, questionIds }) => {
  const existing = await Contest.findOne({
    title,
    startTime: { $gte: startTime, $lt: new Date(endTime.getTime() + 1000) }
  });

  if (existing) {
    console.log(`${title} already exists for this time window`);
    return false;
  }

  await Contest.create({
    title,
    description,
    questions: questionIds,
    startTime,
    endTime
  });

  console.log(`${title} created`);
  return true;
};

const buildDate = (date, hour, minute = 0) => {
  const result = new Date(date);
  result.setHours(hour, minute, 0, 0);
  return result;
};

const getNextOccurrence = (base, hour, minute = 0, weekday = null) => {
  const target = new Date(base);
  target.setHours(hour, minute, 0, 0);

  if (weekday !== null) {
    const diff = (weekday + 7 - target.getDay()) % 7;
    target.setDate(target.getDate() + diff);
    if (diff === 0 && target <= base) {
      target.setDate(target.getDate() + 7);
    }
  } else {
    if (target <= base) {
      target.setDate(target.getDate() + 1);
    }
  }

  return target;
};

const createContestForWindow = async ({ title, description, startTime, endTime, questionCounts }) => {
  const questions = [];
  for (const [difficulty, size] of Object.entries(questionCounts)) {
    const sampled = await sampleQuestions(difficulty, size);
    questions.push(...sampled);
  }

  const requiredCount = Object.values(questionCounts).reduce((sum, value) => sum + value, 0);
  if (questions.length < requiredCount) {
    console.error(`Not enough questions available for ${title}`);
    return false;
  }

  return await createContestIfMissing({
    title,
    description,
    startTime,
    endTime,
    questionIds: questions.map((q) => q._id)
  });
};

// Single source of truth for the three recurring contests. Both the startup
// catch-up pass and the daily cron jobs below read from this list, instead of
// each having their own copy of title/description/question counts.
const CONTEST_DEFINITIONS = [
  {
    title: 'Beginners Contest',
    description: 'Solve 5 easy problems between 8:00 PM and 10:00 PM.',
    cronExpr: '0 20 * * *',
    hour: 20,
    minute: 0,
    weekday: null,
    durationMinutes: 120,
    questionCounts: { Easy: 5 }
  },
  {
    title: 'Daily Contest',
    description: 'Solve 3 easy and 2 medium problems between 10:00 AM and 12:00 PM.',
    cronExpr: '0 10 * * *',
    hour: 10,
    minute: 0,
    weekday: null,
    durationMinutes: 120,
    questionCounts: { Easy: 3, Medium: 2 }
  },
  {
    title: 'Weekly Contest',
    description: 'Solve 2 easy, 2 medium, and 1 hard problem on Monday from 1:15 PM to 3:15 PM.',
    cronExpr: '15 13 * * 1',
    hour: 13,
    minute: 15,
    weekday: 1,
    durationMinutes: 120,
    questionCounts: { Easy: 2, Medium: 2, Hard: 1 }
  }
];

// On startup, create any of today's/tomorrow's contests that are missing
// (e.g. after a deploy or restart that caused a scheduled run to be skipped).
const tryCreateUpcomingContests = async () => {
  const now = new Date();
  const nextDay = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  for (const definition of CONTEST_DEFINITIONS) {
    const startTime = getNextOccurrence(now, definition.hour, definition.minute, definition.weekday);
    if (startTime > now && startTime <= nextDay) {
      const endTime = new Date(startTime.getTime() + definition.durationMinutes * 60 * 1000);
      await createContestForWindow({ ...definition, startTime, endTime });
    }
  }
};

tryCreateUpcomingContests().catch((err) => {
  console.error('Error creating contests on startup:', err);
});

// Register the actual recurring job for each contest definition.
for (const definition of CONTEST_DEFINITIONS) {
  cron.schedule(definition.cronExpr, async () => {
    console.log(`⏰ Creating ${definition.title}...`);
    try {
      const now = new Date();
      const startTime = buildDate(now, definition.hour, definition.minute);
      const endTime = new Date(startTime.getTime() + definition.durationMinutes * 60 * 1000);
      // createContestForWindow already logs why it returned false (either
      // not enough questions, or a contest for this window already exists)
      await createContestForWindow({ ...definition, startTime, endTime });
    } catch (err) {
      console.error(`Error creating ${definition.title}:`, err);
    }
  });
}

cron.schedule('* * * * *', async () => {
  const now = new Date();

  await Contest.updateMany(
    { startTime: { $lte: now }, endTime: { $gte: now } },
    { status: 'running' }
  );

  await Contest.updateMany(
    { endTime: { $lt: now } },
    { status: 'ended' }
  );
});