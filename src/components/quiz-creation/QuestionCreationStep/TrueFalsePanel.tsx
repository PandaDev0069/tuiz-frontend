'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { XCircle } from 'lucide-react';
import { CreateAnswerForm } from '@/types/quiz';

interface TrueFalsePanelProps {
  answers: CreateAnswerForm[];
  isMobile: boolean;
  onAnswersChange: (answers: CreateAnswerForm[]) => void;
}

export const TrueFalsePanel: React.FC<TrueFalsePanelProps> = ({
  answers,
  isMobile,
  onAnswersChange,
}) => {
  const handleAnswerChange = (answerText: 'True' | 'False') => {
    const updatedAnswers: CreateAnswerForm[] = [
      {
        answer_text: 'True',
        image_url: undefined,
        is_correct: answerText === 'True',
        order_index: 1,
      },
      {
        answer_text: 'False',
        image_url: undefined,
        is_correct: answerText === 'False',
        order_index: 2,
      },
    ];
    onAnswersChange(updatedAnswers);
  };

  // Get the currently selected answer
  const selectedAnswer = answers.find((answer) => answer.is_correct)?.answer_text || '';

  return (
    <Card className="bg-gradient-to-br from-lime-200 to-green-300 border-lime-400 shadow-lg">
      <CardHeader className={`${isMobile ? 'pb-4 px-4' : 'pb-6 px-6'}`}>
        <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-lg' : 'text-xl'}`}>
          <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
            <XCircle className="w-4 h-4" />
          </div>
          正誤問題の選択肢
        </CardTitle>
        <p className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-600`}>
          True（正）またはFalse（誤）を選択してください
        </p>
      </CardHeader>

      <CardContent className={`${isMobile ? 'px-4' : 'px-6'}`}>
        <div className="space-y-6">
          {/* True/False Selection Buttons */}
          <div className={`${isMobile ? 'grid grid-cols-1 gap-4' : 'flex gap-8 justify-center'}`}>
            {/* True Button */}
            <div
              onClick={() => handleAnswerChange('True')}
              className={`${
                selectedAnswer === 'True'
                  ? 'bg-green-100 border-green-500 text-green-700 shadow-lg'
                  : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
              } ${
                isMobile ? 'w-full py-12 px-8 text-2xl font-bold' : 'w-64 h-40 text-4xl font-bold'
              } border-2 rounded-lg cursor-pointer transition-all duration-200 flex items-center justify-center`}
            >
              <div className="flex flex-col items-center gap-3">
                <div
                  className={`${isMobile ? 'w-20 h-20' : 'w-35 h-35'} rounded-full border-4 border-green-500 flex items-center justify-center bg-white`}
                >
                  <div
                    className={`${isMobile ? 'w-8 h-8' : 'w-15 h-15'} rounded-full border-8 border-green-500`}
                  ></div>
                </div>
              </div>
            </div>

            {/* False Button */}
            <div
              onClick={() => handleAnswerChange('False')}
              className={`${
                selectedAnswer === 'False'
                  ? 'bg-red-100 border-red-500 text-red-700 shadow-lg'
                  : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
              } ${
                isMobile ? 'w-full py-12 px-8 text-2xl font-bold' : 'w-64 h-40 text-4xl font-bold'
              } border-2 rounded-lg cursor-pointer transition-all duration-200 flex items-center justify-center`}
            >
              <div className="flex flex-col items-center gap-3">
                <div
                  className={`${isMobile ? 'w-20 h-20' : 'w-35 h-35'} rounded-full border-4 border-red-500 flex items-center justify-center bg-white`}
                >
                  <div className={`${isMobile ? 'w-8 h-8' : 'w-15 h-15'} relative`}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-2 bg-red-500 transform rotate-45 origin-center"></div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-2 bg-red-500 transform -rotate-45 origin-center"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div
            className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-600 bg-lime-50 p-4 rounded-lg border border-lime-300`}
          >
            <div className="font-semibold mb-2">💡 ヒント:</div>
            <ul className="space-y-1">
              <li>• 緑のOは正しいを表します</li>
              <li>• 赤のXは間違いを表します</li>
              <li>• 正解の選択肢をクリックして選択してください</li>
              <li>• 一つの問題につき一つの正解のみ選択できます</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
