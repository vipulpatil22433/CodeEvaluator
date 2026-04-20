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
    console.log(` ${title} already exists for this time window`);
    return false;
  }

  await Contest.create({
    title,
    description,
    questions: questionIds,
    startTime,
    endTime
  });

  console.log(` ${title} created`);
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
    console.error(` Not enough questions available for ${title}`);
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

const tryCreateUpcomingContests = async () => {
  const now = new Date();
  const nextDay = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const schedules = [
    {
      title: 'Beginners Contest',
      description: 'Solve 5 easy problems between 8:00 PM and 10:00 PM.',
      startTime: getNextOccurrence(now, 20, 0),
      durationMinutes: 120,
      questionCounts: { Easy: 5 }
    },
    {
      title: 'Daily Contest',
      description: 'Solve 3 easy and 2 medium problems between 10:00 AM and 12:00 PM.',
      startTime: getNextOccurrence(now, 10, 0),
      durationMinutes: 120,
      questionCounts: { Easy: 3, Medium: 2 }
    },
    {
      title: 'Weekly Contest',
      description: 'Solve 2 easy, 2 medium, and 1 hard problem on Monday from 1:15 PM to 3:15 PM.',
      startTime: getNextOccurrence(now, 13, 15, 1),
      durationMinutes: 120,
      questionCounts: { Easy: 2, Medium: 2, Hard: 1 }
    }
  ];

  for (const schedule of schedules) {
    if (schedule.startTime > now && schedule.startTime <= nextDay) {
      schedule.endTime = new Date(schedule.startTime.getTime() + schedule.durationMinutes * 60 * 1000);
      await createContestForWindow(schedule);
    }
  }
};

tryCreateUpcomingContests().catch((err) => {
  console.error(' Error creating contests on startup:', err);
});

cron.schedule('0 20 * * *', async () => {
  console.log('⏰ Creating Beginners Contest (8:00 PM - 10:00 PM)...');

  try {
    const now = new Date();
    const startTime = buildDate(now, 20, 0);
    const endTime = buildDate(now, 22, 0);

    const questions = await sampleQuestions('Easy', 5);

    if (questions.length < 5) {
      console.error(' Not enough easy questions available for the Beginners Contest');
      return;
    }

    await createContestIfMissing({
      title: 'Beginners Contest',
      description: 'Solve 5 easy problems between 8:00 PM and 10:00 PM.',
      startTime,
      endTime,
      questionIds: questions.map((q) => q._id)
    });
  } catch (err) {
    console.error(' Error creating Beginners Contest:', err);
  }
});

cron.schedule('0 10 * * *', async () => {
  console.log('⏰ Creating Daily Contest (10:00 AM - 12:00 PM)...');

  try {
    const now = new Date();
    const startTime = buildDate(now, 10, 0);
    const endTime = buildDate(now, 12, 0);

    const easy = await sampleQuestions('Easy', 3);
    const medium = await sampleQuestions('Medium', 2);
    const questions = [...easy, ...medium];

    if (questions.length < 5) {
      console.error(' Not enough questions available for the Daily Contest');
      return;
    }

    await createContestIfMissing({
      title: 'Daily Contest',
      description: 'Solve 3 easy and 2 medium problems between 10:00 AM and 12:00 PM.',
      startTime,
      endTime,
      questionIds: questions.map((q) => q._id)
    });
  } catch (err) {
    console.error(' Error creating Daily Contest:', err);
  }
});

cron.schedule('15 13 * * 1', async () => {
  console.log('⏰ Creating Weekly Contest (Monday 1:15 PM - 3:15 PM)...');

  try {
    const now = new Date();
    const startTime = buildDate(now, 13, 15);
    const endTime = buildDate(now, 15, 15);

    const easy = await sampleQuestions('Easy', 2);
    const medium = await sampleQuestions('Medium', 2);
    const hard = await sampleQuestions('Hard', 1);
    const questions = [...easy, ...medium, ...hard];

    if (questions.length < 5) {
      console.error(' Not enough questions available for the Weekly Contest');
      return;
    }

    await createContestIfMissing({
      title: 'Weekly Contest',
      description: 'Solve 2 easy, 2 medium, and 1 hard problem on Monday from 1:15 PM to 3:15 PM.',
      startTime,
      endTime,
      questionIds: questions.map((q) => q._id)
    });
  } catch (err) {
    console.error(' Error creating Weekly Contest:', err);
  }
});

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