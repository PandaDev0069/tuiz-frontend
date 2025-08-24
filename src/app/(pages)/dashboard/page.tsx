'use client';

import React from 'react';
import { useAuthStore } from '@/state/useAuthStore';
import { Container, Button, PageContainer, QuizCard } from '@/components/ui';
import Link from 'next/link';
import { QuizSet, QuizStatus, DifficultyLevel } from '@/types/dashboard';

export default function DashboardPage() {
  const { logout, loading } = useAuthStore();

  // Mock data for prototype
  const mockQuizzes: QuizSet[] = [
    {
      id: '1',
      user_id: 'user-1',
      title: 'JavaScript Fundamentals Quiz',
      description:
        'Test your knowledge of JavaScript basics including variables, functions, and control flow. Perfect for beginners and intermediate developers.',
      thumbnail_url: undefined, // Will show default placeholder
      is_public: true,
      difficulty_level: DifficultyLevel.MEDIUM,
      category: 'Programming',
      total_questions: 20,
      times_played: 156,
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
      status: QuizStatus.PUBLISHED,
      tags: ['javascript', 'programming', 'basics'],
      completion_rate: 78,
      last_played_at: '2024-01-20T15:30:00Z',
      play_settings: {
        shuffle_questions: true,
        shuffle_answers: true,
        points_mode: 'standard',
        show_explanations: true,
        allow_retry: false,
        show_correct_answers: true,
        show_score_immediately: true,
        allow_skip: false,
        navigation_mode: 'linear',
      },
    },
    {
      id: '2',
      user_id: 'user-1',
      title: 'React Hooks Deep Dive',
      description:
        'Advanced quiz covering React hooks like useState, useEffect, useContext, and custom hooks. Challenge yourself with real-world scenarios.',
      thumbnail_url: undefined,
      is_public: false,
      difficulty_level: DifficultyLevel.HARD,
      category: 'Frontend Development',
      total_questions: 15,
      times_played: 0,
      created_at: '2024-01-20T14:30:00Z',
      updated_at: '2024-01-20T14:30:00Z',
      status: QuizStatus.DRAFT,
      tags: ['react', 'hooks', 'frontend'],
      completion_rate: 0,
      play_settings: {
        shuffle_questions: false,
        shuffle_answers: false,
        points_mode: 'standard',
        show_explanations: true,
        allow_retry: true,
        show_correct_answers: false,
        show_score_immediately: false,
        allow_skip: true,
        navigation_mode: 'free',
      },
    },
    {
      id: '3',
      user_id: 'user-1',
      title: 'CSS Grid & Flexbox Mastery',
      description:
        'Master modern CSS layout techniques with this comprehensive quiz on Grid and Flexbox. Includes practical examples and common use cases.',
      thumbnail_url: undefined,
      is_public: true,
      difficulty_level: DifficultyLevel.MEDIUM,
      category: 'CSS',
      total_questions: 25,
      times_played: 89,
      created_at: '2024-01-10T09:15:00Z',
      updated_at: '2024-01-10T09:15:00Z',
      status: QuizStatus.PUBLISHED,
      tags: ['css', 'layout', 'grid', 'flexbox'],
      completion_rate: 82,
      last_played_at: '2024-01-18T11:20:00Z',
      play_settings: {
        shuffle_questions: true,
        shuffle_answers: true,
        points_mode: 'difficulty_based',
        show_explanations: true,
        allow_retry: true,
        show_correct_answers: true,
        show_score_immediately: true,
        allow_skip: false,
        navigation_mode: 'linear',
      },
    },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      // Optionally redirect to home page after logout
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
      // Still redirect even if logout failed
      window.location.href = '/';
    }
  };

  const handleEditQuiz = (id: string) => {
    console.log('Edit quiz:', id);
    // TODO: Implement edit functionality
  };

  const handleStartQuiz = (id: string) => {
    console.log('Start quiz:', id);
    // TODO: Implement start quiz functionality
  };

  const handleDeleteQuiz = (id: string) => {
    console.log('Delete quiz:', id);
    // TODO: Implement delete functionality
  };

  return (
    <PageContainer className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <main role="main">
        <Container size="lg" className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Manage your quizzes and track your progress</p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="/">
              <Button variant="outline" size="lg">
                ホームに戻る
              </Button>
            </Link>
            <Button variant="destructive" size="lg" onClick={handleLogout} disabled={loading}>
              {loading ? 'ログアウト中...' : 'ログアウト'}
            </Button>
          </div>

          {/* Quiz Cards Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Your Quizzes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockQuizzes.map((quiz) => (
                <QuizCard
                  key={quiz.id}
                  quiz={quiz}
                  onEdit={handleEditQuiz}
                  onStart={handleStartQuiz}
                  onDelete={handleDeleteQuiz}
                />
              ))}
            </div>
          </div>
        </Container>
      </main>
    </PageContainer>
  );
}
