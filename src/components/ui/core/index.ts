// ====================================================
// File Name   : index.ts
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-08-20
// Last Update : 2025-09-17
//
// Description:
// - Barrel export file for UI core components
// - Centralizes exports for all core UI components
// - Provides single import point for UI components
//
// Notes:
// - Server and client compatible (no 'use client' directive)
// - Re-exports all core UI components for convenience
// ====================================================

export { Button } from './button';
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './card';
export { Flex } from './flex';
export { Header, Main, Footer, Container } from './layout';
export { Heading, Text } from './typography';
export { AnimatedHeading } from './animated-heading';
export { PageContainer } from './page-container';
export { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';
