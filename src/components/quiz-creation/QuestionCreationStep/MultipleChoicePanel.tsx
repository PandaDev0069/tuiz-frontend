'use client';

import React from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '@/components/ui';
import { Plus, Trash2, Upload, X, CheckCircle, CheckSquare } from 'lucide-react';
import Image from 'next/image';
import { CreateAnswerForm } from '@/types/quiz';

interface AnswerOptionProps {
  answer: CreateAnswerForm;
  index: number;
  isMobile: boolean;
  isUploading: boolean;
  onAnswerChange: (index: number, field: keyof CreateAnswerForm, value: string | boolean) => void;
  onImageUpload: (index: number, e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
}

// Sub-components for AnswerOption
interface OptionHeaderProps {
  optionLetter: string;
  index: number;
  isMobile: boolean;
  answer: CreateAnswerForm;
  canRemove: boolean;
  onAnswerChange: (index: number, field: keyof CreateAnswerForm, value: string | boolean) => void;
  onRemove: (index: number) => void;
}

const OptionHeader: React.FC<OptionHeaderProps> = ({
  optionLetter,
  index,
  isMobile,
  answer,
  canRemove,
  onAnswerChange,
  onRemove,
}) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <div className="flex items-center justify-center w-6 h-6 bg-blue-500 text-white rounded-full text-sm font-bold">
        {optionLetter}
      </div>
      <Label
        htmlFor={`answer_text_${index}`}
        variant="primary"
        size={isMobile ? 'lg' : 'md'}
        className="font-semibold"
      >
        選択肢 {index + 1}
      </Label>
    </div>
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onAnswerChange(index, 'is_correct', !answer.is_correct)}
        className={`${
          answer.is_correct
            ? 'bg-green-100 border-green-500 text-green-700'
            : 'bg-gray-100 border-gray-300 text-gray-600'
        } ${isMobile ? 'px-2 py-1' : 'px-1 py-1'}`}
      >
        <CheckCircle className={`${isMobile ? 'w-3 h-3' : 'w-3 h-3'} mr-1`} />
        <span className={isMobile ? 'text-xs' : 'text-xs'}>
          {answer.is_correct ? '正解' : '選択'}
        </span>
      </Button>
      {canRemove && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onRemove(index)}
          className="text-red-600 border-red-300 p-1"
        >
          <Trash2 className={`${isMobile ? 'w-3 h-3' : 'w-3 h-3'}`} />
        </Button>
      )}
    </div>
  </div>
);

interface AnswerTextInputProps {
  index: number;
  answer: CreateAnswerForm;
  isMobile: boolean;
  onAnswerChange: (index: number, field: keyof CreateAnswerForm, value: string | boolean) => void;
}

const AnswerTextInput: React.FC<AnswerTextInputProps> = ({
  index,
  answer,
  isMobile,
  onAnswerChange,
}) => (
  <div className="">
    <Input
      id={`answer_text_${index}`}
      type="text"
      placeholder={`選択肢 ${index + 1} のテキストを入力...`}
      value={answer.answer_text}
      onChange={(e) => onAnswerChange(index, 'answer_text', e.target.value)}
      variant="default"
      inputSize={isMobile ? 'lg' : 'md'}
      className="border-2 border-blue-500 focus:border-blue-600"
    />
  </div>
);

interface ImageUploadSectionProps {
  index: number;
  answer: CreateAnswerForm;
  isMobile: boolean;
  isUploading: boolean;
  onImageUpload: (index: number, e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
}

const ImageUploadSection: React.FC<ImageUploadSectionProps> = ({
  index,
  answer,
  isMobile,
  isUploading,
  onImageUpload,
  onRemoveImage,
}) => {
  const handleImageClick = () => {
    if (!isUploading) {
      document.getElementById(`answer_image_${index}`)?.click();
    }
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isUploading) {
      document.getElementById(`answer_image_${index}`)?.click();
    }
  };

  return (
    <div className={`${isMobile ? 'flex flex-col' : 'flex-1 flex flex-col'}`}>
      <Label htmlFor={`answer_image_${index}`} variant="primary" size={isMobile ? 'md' : 'sm'}>
        画像（任意）
      </Label>
      <div className={`${isMobile ? 'h-20' : 'flex-1 min-h-0'} w-full`}>
        {answer.image_url ? (
          <div className="relative h-full w-full">
            <div className="h-full w-full max-w-full overflow-hidden rounded-lg border-2 border-blue-200">
              <Image
                src={answer.image_url}
                alt={`Answer option ${index + 1} image`}
                fill
                className="object-cover"
              />
            </div>
            <button
              type="button"
              onClick={() => onRemoveImage(index)}
              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div
            className="border-2 border-dashed border-blue-400 rounded-lg p-2 text-center cursor-pointer h-full flex flex-col items-center justify-center"
            onClick={handleImageClick}
          >
            <Upload className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} text-blue-400 mb-1`} />
            <p className={`${isMobile ? 'text-xs' : 'text-xs'} text-blue-600 mb-1`}>
              画像をアップロード
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => onImageUpload(index, e)}
              className="hidden"
              id={`answer_image_${index}`}
              disabled={isUploading}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleButtonClick}
              disabled={isUploading}
              className="text-blue-600 border-blue-300 text-xs px-2 py-1"
            >
              {isUploading ? 'アップロード中...' : '選択'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const AnswerOption: React.FC<AnswerOptionProps> = ({
  answer,
  index,
  isMobile,
  isUploading,
  onAnswerChange,
  onImageUpload,
  onRemoveImage,
  onRemove,
  canRemove,
}) => {
  const optionLetter = String.fromCharCode(65 + index); // A, B, C, D

  return (
    <div className={`${isMobile ? 'space-y-2' : 'h-full flex flex-col space-y-2'}`}>
      <OptionHeader
        optionLetter={optionLetter}
        index={index}
        isMobile={isMobile}
        answer={answer}
        canRemove={canRemove}
        onAnswerChange={onAnswerChange}
        onRemove={onRemove}
      />
      <AnswerTextInput
        index={index}
        answer={answer}
        isMobile={isMobile}
        onAnswerChange={onAnswerChange}
      />
      <ImageUploadSection
        index={index}
        answer={answer}
        isMobile={isMobile}
        isUploading={isUploading}
        onImageUpload={onImageUpload}
        onRemoveImage={onRemoveImage}
      />
    </div>
  );
};

interface MultipleChoicePanelProps {
  answers: CreateAnswerForm[];
  isMobile: boolean;
  isUploading: boolean;
  onAnswersChange: (answers: CreateAnswerForm[]) => void;
  onImageUpload: (index: number, e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const MultipleChoicePanel: React.FC<MultipleChoicePanelProps> = ({
  answers,
  isMobile,
  isUploading,
  onAnswersChange,
  onImageUpload,
}) => {
  const handleAnswerChange = (
    index: number,
    field: keyof CreateAnswerForm,
    value: string | boolean,
  ) => {
    const updatedAnswers = [...answers];
    updatedAnswers[index] = {
      ...updatedAnswers[index],
      [field]: value,
    };
    onAnswersChange(updatedAnswers);
  };

  const handleAddOption = () => {
    if (answers.length >= 4) return;

    const newAnswer: CreateAnswerForm = {
      answer_text: '',
      image_url: undefined,
      is_correct: false,
      order_index: answers.length + 1,
    };

    const updatedAnswers = [...answers, newAnswer];
    onAnswersChange(updatedAnswers);
  };

  const handleRemoveOption = (index: number) => {
    if (answers.length <= 2) return; // Keep at least 2 options

    const updatedAnswers = answers.filter((_, i) => i !== index);

    // Update order_index for remaining answers
    updatedAnswers.forEach((answer, i) => {
      answer.order_index = i + 1;
    });

    onAnswersChange(updatedAnswers);
  };

  const handleRemoveImage = (index: number) => {
    const updatedAnswers = [...answers];
    updatedAnswers[index] = {
      ...updatedAnswers[index],
      image_url: undefined,
    };
    onAnswersChange(updatedAnswers);
  };

  return (
    <Card className="bg-gradient-to-br from-lime-200 to-green-300 border-lime-400 shadow-sm">
      <CardHeader className={`${isMobile ? 'pb-4 px-4' : 'pb-6 px-6'}`}>
        <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-base' : 'text-lg'}`}>
          <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
            <CheckSquare className="w-4 h-4" />
          </div>
          複数選択問題の選択肢
        </CardTitle>
        <p className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-600`}>
          2〜4個の選択肢を作成し、正解を選択してください
        </p>
      </CardHeader>

      <CardContent className={`${isMobile ? 'px-4' : 'px-6'}`}>
        <div className="space-y-4">
          {/* Answer Options - 2x2 Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {answers.map((answer, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border-2 aspect-[4/3] flex flex-col justify-between ${
                  answer.is_correct
                    ? 'border-green-500 bg-green-200 shadow-md'
                    : 'border-lime-600 bg-lime-300'
                }`}
              >
                <AnswerOption
                  answer={answer}
                  index={index}
                  isMobile={isMobile}
                  isUploading={isUploading}
                  onAnswerChange={handleAnswerChange}
                  onImageUpload={onImageUpload}
                  onRemoveImage={handleRemoveImage}
                  onRemove={handleRemoveOption}
                  canRemove={answers.length > 2}
                />
              </div>
            ))}
          </div>

          {/* Add Option Button */}
          {answers.length < 4 && (
            <div className="flex justify-center pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleAddOption}
                className={`border-2 border-dashed border-lime-600 text-lime-800 ${
                  isMobile ? 'w-full py-3' : 'px-4 py-2'
                }`}
              >
                <Plus className={`${isMobile ? 'w-4 h-4' : 'w-3 h-3'} mr-2`} />
                <span className={isMobile ? 'text-sm' : 'text-xs'}>
                  選択肢を追加 ({answers.length}/4)
                </span>
              </Button>
            </div>
          )}

          {/* Instructions */}
          <div
            className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-700 bg-lime-200 p-4 rounded-lg border border-lime-500`}
          >
            <div className="font-semibold mb-2">💡 ヒント:</div>
            <ul className="space-y-1">
              <li>• 各選択肢にテキストを入力してください</li>
              <li>• 画像を追加して選択肢をより分かりやすくできます</li>
              <li>• 正解の選択肢をクリックして選択してください</li>
              <li>• 最低2個、最大4個の選択肢を作成できます</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
