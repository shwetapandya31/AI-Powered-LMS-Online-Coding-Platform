require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('./models/Course');

mongoose.connect('mongodb://localhost:27017/elearning').then(async () => {
  console.log("Connected to DB");
  
  const db = mongoose.connection.db;
  const coursesCollection = db.collection('courses');
  
  const courses = await coursesCollection.find({}).toArray();
  let modified = 0;
  
  for (let course of courses) {
    let changed = false;
    
    if (course.quizzes && course.quizzes.length > 0) {
      for (let i = 0; i < course.quizzes.length; i++) {
        const q = course.quizzes[i];
        if (!q.title && q.question) {
          course.quizzes[i].title = "Legacy Quiz";
          course.quizzes[i].questions = [{
            question: q.question,
            options: q.options || [],
            correctAnswerIndex: q.correctAnswerIndex !== undefined ? q.correctAnswerIndex : 0
          }];
          delete course.quizzes[i].question;
          delete course.quizzes[i].options;
          delete course.quizzes[i].correctAnswerIndex;
          changed = true;
        } else if (!q.title) {
          course.quizzes[i].title = "Legacy Quiz";
          changed = true;
        }
      }
    }
    
    if (changed) {
      await coursesCollection.updateOne({ _id: course._id }, { $set: { quizzes: course.quizzes } });
      modified++;
    }
  }
  
  console.log(`Migrated ${modified} courses.`);
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
