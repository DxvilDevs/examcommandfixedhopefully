import React, { useState } from "react";
import PremiumCard from "../components/PremiumCard";
import PremiumGate from "../components/PremiumGate";
import { examsApi } from "../api/exams";

export default function MockExam({ me }) {
  const [mock, setMock] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [finished, setFinished] = useState(false);
  const premium = me?.plan === "PREMIUM" || me?.role === "OWNER";

  const startMock = async () => {
    try {
      const data = await examsApi.generateMock(60);
      setMock(data);
      setCurrentQuestion(0);
      setAnswers({});
      setFinished(false);
    } catch (e) {
      alert("Failed to generate mock: " + e.message);
    }
  };

  const submitAnswer = async (answer) => {
    if (!mock) return;
    try {
      await examsApi.submitAnswer(mock.id, mock.questions[currentQuestion].id, answer);
      setAnswers(prev => ({ ...prev, [currentQuestion]: answer }));
      if (currentQuestion + 1 < mock.questions.length) {
        setCurrentQuestion(prev => prev + 1);
      } else {
        finish();
      }
    } catch {}
  };

  const finish = async () => {
    try {
      const result = await examsApi.finishMock(mock.id);
      setMock(prev => ({ ...prev, result }));
      setFinished(true);
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Mock Exam Simulator</h1>
        <p className="text-slate-400 mt-1">
          Practice under real exam conditions
        </p>
      </div>

      <PremiumGate me={me}>
        {!mock && !finished && (
          <PremiumCard title="Ready for a Mock Exam?" subtitle="60-minute timed practice">
            <button 
              onClick={startMock}
              className="btn-primary px-8 py-4 text-lg w-full max-w-xs mx-auto block"
            >
              Start Mock Exam
            </button>
            <p className="mt-4 text-sm text-slate-400 text-center">
              Pulls from your weak topics and flashcards
            </p>
          </PremiumCard>
        )}

        {mock && !finished && (
          <PremiumCard title={`Question ${currentQuestion + 1}/${mock.questions.length}`} subtitle={mock.questions[currentQuestion].topic}>
            <div className="space-y-4">
              <p className="text-lg text-white">{mock.questions[currentQuestion].text}</p>
              <div className="grid gap-3">
                {mock.questions[currentQuestion].options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => submitAnswer(opt)}
                    className={`p-4 rounded-xl border text-left smooth-transition ${
                      answers[currentQuestion] === opt 
                        ? "bg-indigo-500/30 border-indigo-400" 
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-6 flex justify-between text-sm text-slate-400">
              <span>Time left: --:--</span>
              <button onClick={finish} className="text-red-400 hover:text-red-300">
                Finish Early
              </button>
            </div>
          </PremiumCard>
        )}

        {finished && mock?.result && (
          <PremiumCard title="Mock Exam Complete!" subtitle={`Score: ${mock.result.score}%`}>
            <div className="text-center py-6">
              <div className="text-5xl font-bold text-white mb-2">{mock.result.score}%</div>
              <p className="text-slate-300">{mock.result.correct} correct • {mock.result.incorrect} incorrect</p>
              <button 
                onClick={() => setMock(null)}
                className="btn-primary mt-6 px-8 py-3"
              >
                Try Another Mock
              </button>
            </div>
          </PremiumCard>
        )}
      </PremiumGate>
    </div>
  );
}
