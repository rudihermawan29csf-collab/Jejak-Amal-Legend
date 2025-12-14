import React, { useState } from 'react';
import { LearningContent } from '../types';
import { Button, Icons } from './ui';

interface FlashcardViewProps {
  content: LearningContent;
  onExit: () => void;
}

const FlashcardView: React.FC<FlashcardViewProps> = ({ content, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const currentCard = content.flashcards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % content.flashcards.length);
    }, 200);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
        setCurrentIndex((prev) => (prev - 1 + content.flashcards.length) % content.flashcards.length);
    }, 200);
  };

  return (
    <div className="max-w-md mx-auto h-[600px] flex flex-col">
       {/* Header */}
      <div className="flex items-center justify-between mb-8 px-2">
        <button onClick={onExit} className="p-2 hover:bg-white/20 rounded-full text-white transition-colors">
            <Icons.X className="w-6 h-6" />
        </button>
        <span className="font-bold text-white text-lg">Kartu {currentIndex + 1} / {content.flashcards.length}</span>
        <div className="w-10"></div> {/* Spacer for alignment */}
      </div>

      {/* Card Container */}
      <div className="flex-1 relative perspective-1000 group cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
        <div className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${isFlipped ? 'rotate-y-180' : ''}`}>
          
          {/* Front */}
          <div className="absolute w-full h-full backface-hidden bg-white rounded-3xl shadow-xl flex flex-col items-center justify-center p-8 text-center border-b-4 border-indigo-200">
            <div className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-4">Konsep</div>
            <h2 className="text-3xl font-bold text-slate-800 leading-snug">{currentCard.front}</h2>
            <div className="absolute bottom-6 text-slate-400 text-sm flex items-center animate-pulse">
                <Icons.Sparkle className="w-4 h-4 mr-2" /> Ketuk untuk membalik
            </div>
          </div>

          {/* Back */}
          <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-indigo-600 rounded-3xl shadow-xl flex flex-col items-center justify-center p-8 text-center text-white border-b-4 border-indigo-800">
             <div className="text-xs font-bold text-indigo-200 uppercase tracking-widest mb-4">Penjelasan</div>
             <p className="text-xl font-medium leading-relaxed">{currentCard.back}</p>
          </div>

        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center mt-8 px-4">
        <Button variant="secondary" onClick={(e) => { e.stopPropagation(); handlePrev(); }}>
            Prev
        </Button>
        <Button variant="primary" onClick={(e) => { e.stopPropagation(); handleNext(); }}>
            Next
        </Button>
      </div>
    </div>
  );
};

export default FlashcardView;