import React, { useState, useEffect } from 'react';
import { LearningContent, GameState } from '../types';
import { Button, Card, Icons } from './ui';

interface QuizViewProps {
  content: LearningContent;
  onExit: () => void;
}

const QuizView: React.FC<QuizViewProps> = ({ content, onExit }) => {
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    currentQuestionIndex: 0,
    isGameOver: false,
    answers: []
  });

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const currentQuestion = content.questions[gameState.currentQuestionIndex];

  const handleOptionSelect = (index: number) => {
    if (selectedOption !== null) return; // Prevent changing answer
    setSelectedOption(index);
    setShowExplanation(true);

    const isCorrect = index === currentQuestion.correctAnswerIndex;
    
    // Slight delay to allow reading explanation before next functionality
  };

  const handleNext = () => {
    const isCorrect = selectedOption === currentQuestion.correctAnswerIndex;
    
    const nextState = {
      ...gameState,
      score: isCorrect ? gameState.score + 100 : gameState.score,
      answers: [...gameState.answers, isCorrect]
    };

    if (gameState.currentQuestionIndex >= content.questions.length - 1) {
      setGameState({ ...nextState, isGameOver: true });
    } else {
      setGameState({
        ...nextState,
        currentQuestionIndex: gameState.currentQuestionIndex + 1
      });
      setSelectedOption(null);
      setShowExplanation(false);
    }
  };

  if (gameState.isGameOver) {
    const percentage = (gameState.score / (content.questions.length * 100)) * 100;
    
    return (
      <div className="max-w-md mx-auto animate-fade-in">
        <Card className="text-center space-y-8">
          <div className="flex justify-center mb-4">
             {percentage >= 80 ? (
                <div className="p-4 bg-yellow-100 text-yellow-600 rounded-full animate-bounce-slow">
                    <Icons.Trophy className="w-16 h-16" />
                </div>
             ) : (
                <div className="p-4 bg-indigo-100 text-indigo-600 rounded-full">
                    <Icons.Brain className="w-16 h-16" />
                </div>
             )}
          </div>
          
          <div>
            <h2 className="text-3xl font-extrabold text-slate-800 mb-2">Selesai!</h2>
            <p className="text-slate-500">Anda telah menyelesaikan kuis tentang {content.topic}</p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
            <div className="text-sm text-slate-500 uppercase tracking-wider font-semibold mb-1">Skor Akhir</div>
            <div className="text-5xl font-black text-indigo-600">{gameState.score}</div>
            <div className="text-sm text-slate-400 mt-2">dari {content.questions.length * 100} poin</div>
          </div>

          <div className="flex gap-3">
             <Button variant="secondary" onClick={onExit} fullWidth>
                <Icons.Home className="w-5 h-5 mr-2" />
                Menu Utama
             </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 px-2">
        <button onClick={onExit} className="p-2 hover:bg-white/20 rounded-full text-white transition-colors">
          <Icons.X className="w-6 h-6" />
        </button>
        <div className="bg-white/20 backdrop-blur-md text-white px-4 py-1 rounded-full font-bold text-sm">
          Soal {gameState.currentQuestionIndex + 1} / {content.questions.length}
        </div>
        <div className="bg-white/20 backdrop-blur-md text-white px-4 py-1 rounded-full font-bold text-sm">
          Skor: {gameState.score}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-black/10 rounded-full mb-6 mx-2 overflow-hidden backdrop-blur-sm">
        <div 
            className="h-full bg-white transition-all duration-500 ease-out"
            style={{ width: `${((gameState.currentQuestionIndex) / content.questions.length) * 100}%` }}
        />
      </div>

      <Card className="min-h-[400px] flex flex-col justify-between relative overflow-hidden">
        <div>
           <h2 className="text-xl md:text-2xl font-bold text-slate-800 leading-tight mb-8">
             {currentQuestion.text}
           </h2>

           <div className="space-y-3">
             {currentQuestion.options.map((option, idx) => {
               let buttonVariant: 'secondary' | 'outline' | 'primary' | 'danger' = 'secondary';
               
               if (selectedOption !== null) {
                 if (idx === currentQuestion.correctAnswerIndex) {
                   buttonVariant = 'primary'; // Show correct answer (Green-ish usually, but handled by class below)
                 } else if (idx === selectedOption) {
                   buttonVariant = 'danger'; // Wrong selected
                 } else {
                    buttonVariant = 'secondary'; // Others dimmed
                 }
               }

               const isCorrect = idx === currentQuestion.correctAnswerIndex;
               const isSelected = idx === selectedOption;

               let customClass = "justify-between text-left h-auto py-4 ";
               if (selectedOption !== null) {
                    if (isCorrect) customClass += "!bg-green-500 !text-white !border-green-600 ";
                    else if (isSelected) customClass += "!bg-red-500 !text-white !border-red-600 ";
                    else customClass += "opacity-50 ";
               }

               return (
                 <Button
                   key={idx}
                   variant={buttonVariant}
                   fullWidth
                   onClick={() => handleOptionSelect(idx)}
                   disabled={selectedOption !== null}
                   className={customClass}
                 >
                   <span className="mr-2">{option}</span>
                   {selectedOption !== null && isCorrect && <Icons.Check className="w-5 h-5" />}
                   {selectedOption !== null && isSelected && !isCorrect && <Icons.X className="w-5 h-5" />}
                 </Button>
               );
             })}
           </div>
        </div>

        {/* Explanation & Next Button */}
        {showExplanation && (
            <div className="mt-6 animate-fade-in-up">
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 mb-4 text-sm text-indigo-800">
                    <span className="font-bold block mb-1">Penjelasan:</span>
                    {currentQuestion.explanation}
                </div>
                <Button onClick={handleNext} fullWidth size="lg">
                    Lanjut <Icons.ArrowRight className="w-5 h-5 ml-2" />
                </Button>
            </div>
        )}
      </Card>
    </div>
  );
};

export default QuizView;