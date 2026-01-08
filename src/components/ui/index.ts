// ====================================================
// File Name   : index.ts
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-08-20
// Last Update : 2025-09-21
//
// Description:
// - Barrel export file for all UI components
// - Centralizes exports for core, forms, data-display, feedback, navigation, overlays, and other UI components
// - Provides single import point for all UI components
//
// Notes:
// - Server and client compatible (no 'use client' directive)
// - Re-exports components from multiple subdirectories
// - Includes components from providers and auth directories
// ====================================================

export { Button } from './core/button';
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './core/card';
export { Input } from './forms/input';
export { InputField } from './forms/input-field';
export { PasswordField } from './forms/password-field';
export { Checkbox } from './forms/checkbox';
export { SearchBar } from './forms/search-bar';
export { Label } from './forms/label';
export { Textarea } from './forms/textarea';
export { Switch } from './forms/switch';
export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './forms/select';
export { Heading, Text } from './core/typography';
export { AnimatedHeading } from './core/animated-heading';
export { PageContainer } from './core/page-container';
export { Badge } from './data-display/badge';
export { AuthCard } from './data-display/auth-card';
export { QuizCard } from './data-display/quiz-card';
export { Container } from './core/layout';
export { Flex } from './core/flex';
export { ScrollArea, ScrollIndicator } from './feedback/scroll-area';
export { FormError } from './feedback/form-error';
export { FormSuccess } from './feedback/form-success';
export { Loader, Spinner } from './feedback/loader';
export { ValidationMessage } from './feedback/validation-message';
export { RedirectLink } from './navigation/redirect-link';
export { Header } from './core/layout';
export { Main } from './core/layout';
export { Footer } from './core/layout';
export { DashboardHeader } from './core/dashboard-header';
export { QuizCreationHeader } from './core/quiz-creation-header';
export { StepIndicator } from './core/step-indicator';
export { DashboardMessage } from './core/dashboard-message';
export { SidebarFilter } from './overlays/sidebar-filter';
export { ProfileSettingsModal } from './overlays/profile-settings-modal';
export { WarningModal, useWarningModal } from './overlays/warning-modal';
export { AuthProvider } from '../providers/AuthProvider';
export { AuthGuard, withAuthGuard } from '../auth/AuthGuard';
export { SaveStatusIndicator } from './indicators/save-status-indicator';
export { QRCode } from './QRCode';
export { QuizBackground } from './QuizBackground';
