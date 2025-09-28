---
mode: agent
---

Yout are a skilled front-end developer with expertise in React and Tailwind CSS. Your task is to create a visually appealing Podium screen for the host interface of a quiz application. The podium screen will display after the final leaderboard and before the game ends. You will need to ensure that the design is consistent with other host screens in the application.

# Host-podium-screen

## Goal

- Create a Working Podium screen for the host-screen
- Name of the file will be host-podium-screen
- Bg for the page will be same as other host-\*\*\*-screen pages

## Requirements

- Create a good Looking Podium Page for the Host screen
- Podium will show the top 3 players with their ranks
- Text size for the ranks and player names will be fairly large
- Optimized good visuals and reveal animations is main focus

### Layout

---

                        結果発表

                    1st Place
                Player Name - Score

            2nd Place          3rd Place
        Player Name - Score   Player Name - Score


        4th place (Name - score)
        5th place (Name - score)

---

### Dev Process

- First analyze the reference screen files like `src\app\(pages)\host-leaderboard-screen`, `src\app\(pages)\host-answer-reveal` to get the context of how things are implemented
- Create a separate component for the host-podium-screen inside the games folder in components `src\components\game`
- Page will be loated inside the folder `src\app\(pages)`
- Check out other related files like `src\app\(pages)\host-leaderboard-screen`, `src\app\(pages)\host-answer-reveal` to get the context of how things are implemented
- Create the ui following the **Requirements** and **Layout**
- Hook the ui to the `host-explanation-screen` page so that it auto switches when the timer runs out at the **host-podium-screen**
- Keep the containers fairly sized but not too big that it overflows the screen
- Use placeholder images/icons for the podium and player avatars
- Use mock data for now.
- Podium reveal must be dramatic with animations
- Needs Good and optimized animations

## Reference

```
┌─────────────────────────────────────────────────────────────────┐
│                         QUIZ GAME FLOW                          │
└─────────────────────────────────────────────────────────────────┘

1. HOST STARTS QUIZ
   ├── Host Control Panel (analytics, controls, rankings) (Do at last after all the screens are done)
   └── Public Screen (question display for audience)

2. COUNTDOWN SCREEN [x]
   ├── "Get Ready!" message
   ├── 3... 2... 1... countdown
   ├── Breathing room before questions
   └── Auto-transition to Question Display

3. QUESTION DISPLAY [x]
   ├── Host Question Screen (question + timer)
   ├── Player Answering Screen (question + choices + timer)
   └── Time Up → Move to Answer Reveal

4. Answering Phase[x]
   ├── Players select answers
   ├── Submit answers before timer ends
   └── Real-time answer tracking

5. ANSWER REVEAL [x]
   ├── Show the question
   ├── Show statistics (how many chose each option) Like a bar chart
   ├── Show the correct answer
   └── Show individual player result (correct or incorrect) for player screen only

6. LEADERBOARD [x]
   ├── Current rankings
   ├── Animations Reveal
   ├── Show Change in Ranking (Top 5 only)
   ├── Score updates
   └── Next question button

7. EXPLANATION [x]
   ├── Question explanation
   ├── Additional context
   └── Continue button

8. REPEAT LOOP
   ├── Back to Countdown Screen
   └── Continue until final question

9. FINAL QUESTION
   ├── Countdown Screen
   ├── Question Display
   ├── Answer Reveal
   ├── Explanation (if available)
   └── NO Leaderboard → Go to Podium

10. PODIUM (ongoing)
   ├── Winner reveal animations
   ├── 1st, 2nd, 3rd place reveals
   └── Final celebrations

11. GAME END (Summary can be view at the analytics in dashboard )(will be implemented at last after host control panel is done)
    ├── Final results summary
    ├── Restart quiz option
    ├── New quiz option
    └── Return to waiting room
```
