"use client";
import { useEffect, useState, use } from "react";
import useAuthStore from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { Loader2, Clock, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import axios from "axios";

export default function TimedQuizPage({ params }) {
  const unwrappedParams = use(params);
  const { id, quizId } = unwrappedParams;
  const { user } = useAuthStore();
  const router = useRouter();

  const [course, setCourse] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    const fetchCourse = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/courses/${id}`);
        setCourse(res.data);
        const foundQuiz = res.data.quizzes?.find(q => q._id === quizId);
        if (foundQuiz) {
          setQuiz(foundQuiz);
          if (foundQuiz.timeLimit > 0) {
            setTimeLeft(foundQuiz.timeLimit * 60); // Convert mins to seconds
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id, quizId, user, router]);

  // Timer Countdown Effect
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || isSubmitting || results) return;

    const timerId = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerId);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, isSubmitting, results]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSelectAnswer = (optIndex) => {
    if (results) return; // Cannot change answers after submission
    setAnswers({ ...answers, [currentQuestionIdx]: optIndex });
  };

  const handleSubmitQuiz = async () => {
    setIsSubmitting(true);
    
    // Prepare answers array in same order as questions
    const qList = quiz.questions || [{ question: quiz.question, options: quiz.options || [], correctAnswerIndex: quiz.correctAnswerIndex }];
    const finalAnswers = qList.map((_, i) => answers[i] !== undefined ? answers[i] : null);

    try {
      const res = await axios.post(`http://localhost:5000/api/courses/${id}/quizzes/${quizId}/submit`, { answers: finalAnswers }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      setResults(res.data);
      
      // Update local storage user progress
      const updatedUser = { ...user };
      const progIdx = updatedUser.progress.findIndex(p => p.courseId === id || p.courseId?._id === id);
      if (progIdx > -1) {
        if (!updatedUser.progress[progIdx].quizScores) updatedUser.progress[progIdx].quizScores = [];
        updatedUser.progress[progIdx].quizScores.push({ quizId, score: res.data.score });
      }
      useAuthStore.setState({ user: updatedUser });
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
    } catch (err) {
      console.error(err);
      alert("Error submitting quiz");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-900 flex justify-center items-center"><Loader2 className="w-12 h-12 text-indigo-500 animate-spin" /></div>;
  if (!quiz) return <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center">Quiz not found</div>;

  const qList = quiz.questions || [{ question: quiz.question, options: quiz.options || [], correctAnswerIndex: quiz.correctAnswerIndex }];
  const currentQ = qList[currentQuestionIdx];

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-6 sm:py-12 px-4">
      <div className="max-w-3xl w-full">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6 sm:mb-8 bg-gray-800 p-4 sm:p-6 rounded-2xl border border-gray-700">
          <div>
            <button onClick={() => router.push(`/courses/${id}/learn`)} className="text-sm text-gray-400 hover:text-white mb-1 flex items-center gap-1">&larr; Back to Course</button>
            <h1 className="text-xl sm:text-2xl font-bold text-indigo-400">{quiz.title}</h1>
          </div>
          
          {quiz.timeLimit > 0 && !results && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono font-bold text-lg self-start sm:self-auto ${timeLeft < 60 ? 'bg-red-900/50 text-red-400' : 'bg-gray-900 text-indigo-400'}`}>
              <Clock className="w-5 h-5" />
              {formatTime(timeLeft)}
            </div>
          )}
        </div>

        {results ? (
          // Results View
          <div className="bg-gray-800 p-8 sm:p-12 rounded-2xl border border-gray-700 text-center">
            <CheckCircle className="w-16 sm:w-24 h-16 sm:h-24 text-green-500 mx-auto mb-6" />
            <h2 className="text-3xl sm:text-4xl font-bold mb-2">Quiz Completed!</h2>
            <p className="text-gray-400 mb-8">You scored {results.score}%</p>
            
            <button 
              onClick={() => router.push(`/courses/${id}/learn`)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition-colors"
            >
              Return to Course
            </button>
          </div>
        ) : (
          // Quiz Taking View
          <div className="bg-gray-800 p-5 sm:p-8 rounded-2xl border border-gray-700 shadow-2xl">
            <div className="flex justify-between text-sm font-bold text-gray-400 mb-6 border-b border-gray-700 pb-4">
              <span>Question {currentQuestionIdx + 1} of {qList.length}</span>
              <span>{Math.round(((currentQuestionIdx + 1) / qList.length) * 100)}% Done</span>
            </div>

            <h2 className="text-lg sm:text-2xl font-medium mb-6 sm:mb-8 leading-relaxed">{currentQ.question}</h2>

            <div className="space-y-3 sm:space-y-4 mb-8 sm:mb-12">
              {currentQ.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectAnswer(idx)}
                  className={`w-full text-left p-4 sm:p-5 rounded-xl border-2 transition-all text-sm sm:text-base ${
                    answers[currentQuestionIdx] === idx 
                      ? 'border-indigo-500 bg-indigo-900/30 shadow-[0_0_15px_rgba(79,70,229,0.2)] text-white' 
                      : 'border-gray-700 bg-gray-900 text-gray-300 hover:border-gray-500 hover:bg-gray-800'
                  }`}
                >
                  <span className="inline-block w-7 sm:w-8 font-bold text-gray-500">{String.fromCharCode(65 + idx)}.</span> 
                  {opt}
                </button>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4 sm:pt-6 border-t border-gray-700">
              <button 
                onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
                disabled={currentQuestionIdx === 0}
                className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-bold flex items-center gap-2 bg-gray-900 text-gray-400 hover:text-white disabled:opacity-50 transition-colors text-sm sm:text-base"
              >
                <ChevronLeft className="w-5 h-5" /> Prev
              </button>

              {currentQuestionIdx === qList.length - 1 ? (
                <button 
                  onClick={handleSubmitQuiz}
                  disabled={isSubmitting}
                  className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-bold flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 transition-colors text-sm sm:text-base"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                  Submit
                </button>
              ) : (
                <button 
                  onClick={() => setCurrentQuestionIdx(prev => Math.min(qList.length - 1, prev + 1))}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-bold flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white transition-colors text-sm sm:text-base"
                >
                  Next <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
