'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardTitle, CardHeader } from '@/components/ui/core/card';
import { Button } from '@/components/ui/core/button';
import { Text } from '@/components/ui/core/typography';
import { Badge } from '@/components/ui/data-display/badge';
import { X, ChevronLeft, ChevronRight, Eye, Globe, Users, Timer, Award, Copy } from 'lucide-react';
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
  isCloning = false,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'questions' | 'settings'>('overview');

  if (!isOpen) return null;

  const currentQuestion = questions[currentQuestionIndex];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'hard':
        return 'bg-orange-500';
      case 'expert':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden  rounded-3xl">
        <CardHeader className="bg-gradient-to-br from-blue-700 via-blue-800 to-teal-800 text-white border-0 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 m-2 bg-white/20 rounded-lg">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-white">クイズプレビュー</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 m-3 bg-gradient-to-br from-red-200 to-pink-300 hover:from-red-300 hover:to-pink-400 text-red-700 hover:text-red-800 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mt-4">
            {(['overview', 'questions', 'settings'] as const).map((tab) => (
              <Button
                key={tab}
                variant={activeTab === tab ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'flex-1 transition-all duration-200 rounded-xl border-2',
                  activeTab === tab
                    ? 'bg-white text-blue-700 shadow-lg font-semibold border-white'
                    : 'text-white hover:bg-white/20 rounded-xl border-white/30 hover:border-white/50',
                )}
              >
                {tab === 'overview' && '概要'}
                {tab === 'questions' && '問題'}
                {tab === 'settings' && '設定'}
              </Button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="overflow-y-auto max-h-[60vh] p-6 bg-gradient-to-br from-purple-50 via-pink-25 to-orange-50">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <Text className="ml-3 text-gray-600">読み込み中...</Text>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                <Text className="text-red-700 font-medium">{error}</Text>
              </div>
              <Button variant="destructive" onClick={onClose}>
                閉じる
              </Button>
            </div>
          ) : !quiz ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="text-6xl mb-4">🔍</div>
                <Text className="text-gray-500">クイズが見つかりません</Text>
              </div>
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Quiz Header */}
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Thumbnail */}
                    <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden bg-gradient-to-br from-blue-200 to-teal-200 flex-shrink-0 shadow-lg">
                      {quiz.thumbnail_url ? (
                        <Image
                          src={quiz.thumbnail_url}
                          alt={quiz.title}
                          width={300}
                          height={200}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl text-gray-600">
                          📝
                        </div>
                      )}
                    </div>

                    {/* Quiz Info */}
                    <div className="flex-1 space-y-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">{quiz.title}</h2>
                        <Text className="text-gray-600 leading-relaxed">{quiz.description}</Text>
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-gray-700 text-white border-0 shadow-md">
                          {quiz.category}
                        </Badge>
                        <Badge
                          className={cn(
                            'text-white border-0 shadow-md',
                            getDifficultyColor(quiz.difficulty_level),
                          )}
                        >
                          {getDifficultyLabel(quiz.difficulty_level)}
                        </Badge>
                        {quiz.is_public && (
                          <Badge className="bg-gray-700 text-white border-0 shadow-md">
                            <Globe className="w-3 h-3 mr-1" />
                            公開
                          </Badge>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2 px-3 py-2 bg-blue-100 rounded-lg">
                          <Users className="w-4 h-4 text-blue-600" />
                          <span className="text-gray-800 font-medium">
                            {quiz.times_played} 回プレイ
                          </span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 bg-purple-100 rounded-lg">
                          <Award className="w-4 h-4 text-purple-600" />
                          <span className="text-gray-800 font-medium">
                            {quiz.total_questions} 問
                          </span>
                        </div>
                      </div>

                      {/* Tags */}
                      {quiz.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {quiz.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-gray-700 text-white text-xs rounded-full shadow-md font-medium"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Creation Info */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                        <span className="text-green-700 font-medium">作成日:</span>
                        <span className="text-green-800">
                          {new Date(quiz.created_at).toLocaleDateString('ja-JP')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg">
                        <span className="text-orange-700 font-medium">更新日:</span>
                        <span className="text-orange-800">
                          {new Date(quiz.updated_at).toLocaleDateString('ja-JP')}
                        </span>
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
                      <div className="text-6xl mb-4">❓</div>
                      <Text className="text-gray-500">問題がありません</Text>
                    </div>
                  ) : (
                    <>
                      {/* Question Navigation */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))
                            }
                            disabled={currentQuestionIndex === 0}
                            className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600 disabled:opacity-50"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                          <div className="px-4 py-2 bg-gray-700 rounded-lg">
                            <Text className="font-semibold text-white">
                              {currentQuestionIndex + 1} / {questions.length}
                            </Text>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setCurrentQuestionIndex(
                                Math.min(questions.length - 1, currentQuestionIndex + 1),
                              )
                            }
                            disabled={currentQuestionIndex === questions.length - 1}
                            className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600 disabled:opacity-50"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Current Question */}
                      {currentQuestion && (
                        <Card className="p-6 bg-white border border-gray-200 shadow-lg rounded-xl">
                          <div className="space-y-6">
                            {/* Question Image */}
                            {currentQuestion.image_url && (
                              <div className="w-full max-w-md mx-auto">
                                <Image
                                  src={currentQuestion.image_url}
                                  alt="Question image"
                                  width={400}
                                  height={300}
                                  className="w-full h-auto rounded-xl shadow-md"
                                />
                              </div>
                            )}

                            {/* Question Text */}
                            <div className="text-center">
                              <h3 className="text-xl font-bold text-gray-800 mb-4">
                                Q{currentQuestionIndex + 1}. {currentQuestion.question_text}
                              </h3>
                            </div>

                            {/* Answers */}
                            <div className="space-y-3">
                              {currentQuestion.answers.map((answer, index) => (
                                <div
                                  key={answer.id}
                                  className={cn(
                                    'p-4 rounded-xl border-2 transition-all duration-200 shadow-md',
                                    answer.is_correct
                                      ? 'border-green-300 bg-green-50'
                                      : 'border-gray-200 bg-white hover:shadow-md hover:border-gray-300',
                                  )}
                                >
                                  <div className="flex items-center gap-4">
                                    <span
                                      className={cn(
                                        'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md',
                                        answer.is_correct ? 'bg-green-600' : 'bg-gray-600',
                                      )}
                                    >
                                      {String.fromCharCode(65 + index)}
                                    </span>
                                    <span className="flex-1 text-gray-800 font-medium">
                                      {answer.answer_text}
                                    </span>
                                    {answer.is_correct && (
                                      <Badge className="bg-green-600 text-white border-0 shadow-md">
                                        正解
                                      </Badge>
                                    )}
                                  </div>
                                  {answer.image_url && (
                                    <div className="mt-3 ml-12">
                                      <Image
                                        src={answer.image_url}
                                        alt="Answer image"
                                        width={200}
                                        height={150}
                                        className="rounded-lg shadow-sm"
                                      />
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>

                            {/* Explanation */}
                            {currentQuestion.explanation_text && (
                              <div className="mt-6 p-5 bg-blue-50 border border-blue-200 rounded-xl">
                                <h4 className="font-bold text-blue-700 mb-3 flex items-center gap-2">
                                  <span className="text-2xl">💡</span>
                                  {currentQuestion.explanation_title || '解説'}
                                </h4>
                                <Text className="text-gray-700 leading-relaxed">
                                  {currentQuestion.explanation_text}
                                </Text>
                                {currentQuestion.explanation_image_url && (
                                  <div className="mt-4">
                                    <Image
                                      src={currentQuestion.explanation_image_url}
                                      alt="Explanation image"
                                      width={300}
                                      height={200}
                                      className="rounded-lg shadow-sm"
                                    />
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Question Info */}
                            <div className="flex items-center gap-6 text-sm pt-4 border-t border-gray-200">
                              <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg">
                                <Timer className="w-4 h-4 text-orange-600" />
                                <span className="text-orange-800 font-medium">
                                  解答時間: {currentQuestion.answering_time}秒
                                </span>
                              </div>
                              <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg">
                                <Award className="w-4 h-4 text-purple-600" />
                                <span className="text-purple-800 font-medium">
                                  ポイント: {currentQuestion.points}
                                </span>
                              </div>
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
                  <h3 className="text-xl font-bold text-gray-800 mb-6">ゲーム設定</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <Text className="font-medium text-blue-700">最大プレイヤー数</Text>
                        <Text className="font-bold text-gray-800">
                          {quiz.play_settings.max_players}
                        </Text>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                        <Text className="font-medium text-green-700">クイズコード</Text>
                        <Text className="font-mono font-bold text-gray-800">
                          {quiz.play_settings.code}
                        </Text>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <Text className="font-medium text-purple-700">問題のみ表示</Text>
                        <Badge
                          className={cn(
                            'text-white border-0 shadow-md',
                            quiz.play_settings.show_question_only ? 'bg-green-600' : 'bg-gray-600',
                          )}
                        >
                          {quiz.play_settings.show_question_only ? '有効' : '無効'}
                        </Badge>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <Text className="font-medium text-yellow-700">解説表示</Text>
                        <Badge
                          className={cn(
                            'text-white border-0 shadow-md',
                            quiz.play_settings.show_explanation ? 'bg-green-600' : 'bg-gray-600',
                          )}
                        >
                          {quiz.play_settings.show_explanation ? '有効' : '無効'}
                        </Badge>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-cyan-50 border border-cyan-200 rounded-lg">
                        <Text className="font-medium text-cyan-700">時間ボーナス</Text>
                        <Badge
                          className={cn(
                            'text-white border-0 shadow-md',
                            quiz.play_settings.time_bonus ? 'bg-green-600' : 'bg-gray-600',
                          )}
                        >
                          {quiz.play_settings.time_bonus ? '有効' : '無効'}
                        </Badge>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-pink-50 border border-pink-200 rounded-lg">
                        <Text className="font-medium text-pink-700">連続正解ボーナス</Text>
                        <Badge
                          className={cn(
                            'text-white border-0 shadow-md',
                            quiz.play_settings.streak_bonus ? 'bg-green-600' : 'bg-gray-600',
                          )}
                        >
                          {quiz.play_settings.streak_bonus ? '有効' : '無効'}
                        </Badge>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-teal-50 border border-teal-200 rounded-lg">
                        <Text className="font-medium text-teal-700">正解表示</Text>
                        <Badge
                          className={cn(
                            'text-white border-0 shadow-md',
                            quiz.play_settings.show_correct_answer ? 'bg-green-600' : 'bg-gray-600',
                          )}
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
          <div className="border-t border-gray-200 p-6 bg-gradient-to-br from-blue-700 via-blue-800 to-teal-800 rounded-b-3xl">
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <Button
                variant="outline"
                onClick={onClose}
                size="sm"
                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              >
                閉じる
              </Button>
              {onCloneQuiz && (
                <Button
                  variant="default"
                  onClick={() => onCloneQuiz(quiz.id)}
                  disabled={isCloning}
                  size="sm"
                  className="bg-gray-700 hover:bg-gray-600 text-white disabled:opacity-50"
                >
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
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
