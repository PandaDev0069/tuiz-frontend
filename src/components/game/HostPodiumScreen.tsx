// 'use client';

// import React, { useState, useEffect } from 'react';
// import { PageContainer, Main, QuizBackground } from '../ui';
// // import { Trophy, Medal, Award } from 'lucide-react';
// import { LeaderboardData } from '@/types/game';

// // // Get rank icon for top 3
// // const getRankIcon = (rank: number, size: number = 32) => {
// //   switch (rank) {
// //     case 1:
// //       return <Trophy size={size} className="text-yellow-400" />;
// //     case 2:
// //       return <Medal size={size} className="text-gray-300" />;
// //     case 3:
// //       return <Award size={size} className="text-amber-600" />;
// //     default:
// //       return null;
// //   }
// // };

// // // Get gradient colors for ranks
// // const getRankGradient = (rank: number) => {
// //   switch (rank) {
// //     case 1:
// //       return 'bg-gradient-to-r from-yellow-400 to-yellow-500 border-yellow-300';
// //     case 2:
// //       return 'bg-gradient-to-r from-gray-300 to-gray-400 border-gray-200';
// //     case 3:
// //       return 'bg-gradient-to-r from-amber-500 to-amber-600 border-amber-400';
// //     case 4:
// //       return 'bg-gradient-to-r from-blue-400 to-blue-500 border-blue-300';
// //     case 5:
// //       return 'bg-gradient-to-r from-purple-400 to-purple-500 border-purple-300';
// //     default:
// //       return 'bg-gradient-to-r from-gray-400 to-gray-500 border-gray-300';
// //   }
// // };

// interface HostPodiumScreenProps {
//   lederboardData: LeaderboardData;
// }

// export const HostPodiumScreen: React.FC<HostPodiumScreenProps> = ({ leaderboardData }) => {
//   const { entries } = leaderboardData;

//   // Animation state
//   const [isAnimationStarted, setIsAnimationStarted] = useState(false);

//   // Start animation after componet mounts
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setIsAnimationStarted(true);
//     }, 300);
//   });

//   return (
//     <PageContainer className="h-screen">
//       <Main className="h-full relative">
//         {/* Same background as other host screens */}
//         <div className="absolute inset-0">
//           <QuizBackground variant="question" animated={false} />
//         </div>

//         {/* Content */}
//         <div className="relative z-10 h-full flex flex-col pt-16">
//           {/* Header Section */}
//           <div className="px-6 py-3 text-center">
//             <div
//               className={`transition-all duration-1000 transform ${
//                 isAnimationStarted
//                   ? 'opacity-100 translate-y-0 scale-100'
//                   : 'opacity-0 translate-y-4 scale-95'
//               }`}
//             >
//               <div className="relative">
//                 <span className="text-6xl md:text-8xl font-mono font-black bg-gradient-to-r from-cyan-700 via-blue-600 to-cyan-700 bg-clip-text text-transparent tracking-wider drop-shadow-sm">
//                   結果発表
//                 </span>
//               </div>
//               <div className="w-24 h-1.5 bg-gradient-to-r from-[#BFF098] to-[#6FD6FF] mx-auto rounded-lg shadow-lg"></div>
//             </div>
//           </div>
//         </div>
//       </Main>
//     </PageContainer>
//   );
// };
