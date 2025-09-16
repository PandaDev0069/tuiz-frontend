'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardTitle, CardHeader } from '@/components/ui/core/card';
import { Button } from '@/components/ui/core/button';
import { Text } from '@/components/ui/core/typography';
import { Badge } from '@/components/ui/data-display/badge';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  Globe,
  Users,
  Timer,
  Award,
  Copy,
  Play,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { QuizSet, QuestionWithAnswers } from '@/types/quiz';
import Image from 'next/image';

interface PreviewQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  quiz: QuizSet | null;
  questions: QuestionWithAnswers[];
  isLoading?: boolean;
  error?: string;
  onCloneQuiz?: (quizId: string) => void;
  onStartQuiz?: (quizId: string) => void;
  isCloning?: boolean;
}

export const PreviewQuizModal: React.FC<PreviewQuizModalProps> = ({
  isOpen,
  onClose,
  quiz,
  questions,
  isLoading = false,
  error,
  onCloneQuiz,
  onStartQuiz,
  isCloning = false,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'questions' | 'settings'>('overview');

  if (!isOpen) return null;

  const currentQuestion = questions[currentQuestionIndex];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-orange-100 text-orange-800';
      case 'expert':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '簡単';
      case 'medium':
        return '普通';
      case 'hard':
        return '難しい';
      case 'expert':
        return 'エキスパート';
      default:
        return difficulty;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Eye className="w-6 h-6 text-blue-600" />
              <CardTitle className="text-xl font-bold">クイズプレビュー</CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 mt-4">
            {(['overview', 'questions', 'settings'] as const).map((tab) => (
              <Button
                key={tab}
                variant={activeTab === tab ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab(tab)}
                className="flex-1"
              >
                {tab === 'overview' && '概要'}
                {tab === 'questions' && '問題'}
                {tab === 'settings' && '設定'}
              </Button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="overflow-y-auto max-h-[60vh] p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <Text className="ml-3">読み込み中...</Text>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Text className="text-red-600 mb-4">{error}</Text>
              <Button onClick={onClose} variant="outline">
                閉じる
              </Button>
            </div>
          ) : !quiz ? (
            <div className="flex items-center justify-center py-12">
              <Text>クイズが見つかりません</Text>
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Quiz Header */}
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Thumbnail */}
                    <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {quiz.thumbnail_url ? (
                        <Image
                          src={quiz.thumbnail_url}
                          alt={quiz.title}
                          width={300}
                          height={200}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">
                          📝
                        </div>
                      )}
                    </div>

                    {/* Quiz Info */}
                    <div className="flex-1 space-y-3">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">{quiz.title}</h2>
                        <Text className="text-gray-600">{quiz.description}</Text>
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">{quiz.category}</Badge>
                        <Badge className={getDifficultyColor(quiz.difficulty_level)}>
                          {getDifficultyLabel(quiz.difficulty_level)}
                        </Badge>
                        {quiz.is_public && (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            <Globe className="w-3 h-3 mr-1" />
                            公開
                          </Badge>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {quiz.times_played} 回プレイ
                        </div>
                        <div className="flex items-center gap-1">
                          <Award className="w-4 h-4" />
                          {quiz.total_questions} 問
                        </div>
                      </div>

                      {/* Tags */}
                      {quiz.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {quiz.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Creation Info */}
                  <div className="border-t pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <strong>作成日:</strong>{' '}
                        {new Date(quiz.created_at).toLocaleDateString('ja-JP')}
                      </div>
                      <div>
                        <strong>更新日:</strong>{' '}
                        {new Date(quiz.updated_at).toLocaleDateString('ja-JP')}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Questions Tab */}
              {activeTab === 'questions' && (
                <div className="space-y-4">
                  {questions.length === 0 ? (
                    <div className="text-center py-8">
                      <Text className="text-gray-500">問題がありません</Text>
                    </div>
                  ) : (
                    <>
                      {/* Question Navigation */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))
                            }
                            disabled={currentQuestionIndex === 0}
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                          <Text className="font-medium">
                            {currentQuestionIndex + 1} / {questions.length}
                          </Text>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setCurrentQuestionIndex(
                                Math.min(questions.length - 1, currentQuestionIndex + 1),
                              )
                            }
                            disabled={currentQuestionIndex === questions.length - 1}
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Current Question */}
                      {currentQuestion && (
                        <Card variant="accent" className="p-6">
                          <div className="space-y-4">
                            {/* Question Image */}
                            {currentQuestion.image_url && (
                              <div className="w-full max-w-md mx-auto">
                                <Image
                                  src={currentQuestion.image_url}
                                  alt="Question image"
                                  width={400}
                                  height={300}
                                  className="w-full h-auto rounded-lg"
                                />
                              </div>
                            )}

                            {/* Question Text */}
                            <div>
                              <h3 className="text-lg font-semibold mb-4">
                                Q{currentQuestionIndex + 1}. {currentQuestion.question_text}
                              </h3>
                            </div>

                            {/* Answers */}
                            <div className="space-y-2">
                              {currentQuestion.answers.map((answer, index) => (
                                <div
                                  key={answer.id}
                                  className={cn(
                                    'p-3 rounded-lg border-2 transition-colors',
                                    answer.is_correct
                                      ? 'border-green-500 bg-green-50'
                                      : 'border-gray-200 bg-white',
                                  )}
                                >
                                  <div className="flex items-center gap-3">
                                    <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium">
                                      {String.fromCharCode(65 + index)}
                                    </span>
                                    <span className="flex-1">{answer.answer_text}</span>
                                    {answer.is_correct && (
                                      <Badge
                                        variant="outline"
                                        className="text-green-600 border-green-600"
                                      >
                                        正解
                                      </Badge>
                                    )}
                                  </div>
                                  {answer.image_url && (
                                    <div className="mt-2 ml-9">
                                      <Image
                                        src={answer.image_url}
                                        alt="Answer image"
                                        width={200}
                                        height={150}
                                        className="rounded"
                                      />
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>

                            {/* Explanation */}
                            {currentQuestion.explanation_text && (
                              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                                <h4 className="font-medium text-blue-900 mb-2">
                                  {currentQuestion.explanation_title || '解説'}
                                </h4>
                                <Text className="text-blue-800">
                                  {currentQuestion.explanation_text}
                                </Text>
                                {currentQuestion.explanation_image_url && (
                                  <div className="mt-2">
                                    <Image
                                      src={currentQuestion.explanation_image_url}
                                      alt="Explanation image"
                                      width={300}
                                      height={200}
                                      className="rounded"
                                    />
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Question Info */}
                            <div className="flex items-center gap-4 text-sm text-gray-600 pt-2 border-t">
                              <div className="flex items-center gap-1">
                                <Timer className="w-4 h-4" />
                                解答時間: {currentQuestion.answering_time}秒
                              </div>
                              <div>ポイント: {currentQuestion.points}</div>
                            </div>
                          </div>
                        </Card>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && quiz && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold mb-4">ゲーム設定</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <Text className="font-medium">最大プレイヤー数</Text>
                        <Text>{quiz.play_settings.max_players}</Text>
                      </div>

                      <div className="flex justify-between">
                        <Text className="font-medium">クイズコード</Text>
                        <Text className="font-mono">{quiz.play_settings.code}</Text>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <Text className="font-medium">問題のみ表示</Text>
                        <Badge
                          variant={quiz.play_settings.show_question_only ? 'default' : 'outline'}
                        >
                          {quiz.play_settings.show_question_only ? '有効' : '無効'}
                        </Badge>
                      </div>

                      <div className="flex justify-between">
                        <Text className="font-medium">解説表示</Text>
                        <Badge
                          variant={quiz.play_settings.show_explanation ? 'default' : 'outline'}
                        >
                          {quiz.play_settings.show_explanation ? '有効' : '無効'}
                        </Badge>
                      </div>

                      <div className="flex justify-between">
                        <Text className="font-medium">時間ボーナス</Text>
                        <Badge variant={quiz.play_settings.time_bonus ? 'default' : 'outline'}>
                          {quiz.play_settings.time_bonus ? '有効' : '無効'}
                        </Badge>
                      </div>

                      <div className="flex justify-between">
                        <Text className="font-medium">連続正解ボーナス</Text>
                        <Badge variant={quiz.play_settings.streak_bonus ? 'default' : 'outline'}>
                          {quiz.play_settings.streak_bonus ? '有効' : '無効'}
                        </Badge>
                      </div>

                      <div className="flex justify-between">
                        <Text className="font-medium">正解表示</Text>
                        <Badge
                          variant={quiz.play_settings.show_correct_answer ? 'default' : 'outline'}
                        >
                          {quiz.play_settings.show_correct_answer ? '有効' : '無効'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>

        {/* Footer Actions */}
        {quiz && !isLoading && !error && (
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <Button variant="outline" onClick={onClose}>
                閉じる
              </Button>
              {onCloneQuiz && (
                <Button variant="outline" onClick={() => onCloneQuiz(quiz.id)} disabled={isCloning}>
                  {isCloning ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      クローン中...
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      クローン
                    </>
                  )}
                </Button>
              )}
              {onStartQuiz && (
                <Button variant="gradient" onClick={() => onStartQuiz(quiz.id)}>
                  <Play className="w-4 h-4 mr-2" />
                  プレイ開始
                </Button>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
