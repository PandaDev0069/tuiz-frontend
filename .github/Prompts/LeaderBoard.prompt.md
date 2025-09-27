---
mode: agent
---

Yout are a skilled front-end developer with expertise in React and Tailwind CSS. Your task is to create a visually appealing and animated leaderboard screen for the host interface of a quiz application. The leaderboard will display the top 5 players, their ranks, and indicators for rank changes. You will need to ensure that the design is consistent with other host screens in the application.

# Host-leaderboard-scren

## Goal

- Create a Working Leaderboard for the host-screen
- Name of the file will be host-leaderboard-screen
- Bg for the page will be same as other host-\*\*\*-screen pages

## Requirements

- Create a good Looking Leaderboard Page for the Host screen
- Leaderboard will show top-5 players
- Text size for the names and div containers will be fairly large
- Needs good animations for the rank change of players
- Will have a timer and question progress (same as other screen pages)(Time will be passed via question table)
- There will also be indicator for the rank change.
  - 1. ~ Player_001
  - 2. ^ Player_002
  - 3. (downarrow) Player_003
  - 4. (downarrow) Player_004
  - 5. ~ Player_005
- Optimized animations and good visuals is main focus
- Backend part will be done later so only ui

### Layout

---

2/30問 10秒

                          ランキング



        - 1. ~ Player_001
        - 2. ^ Player_002
        - 3. (downarrow) Player_003
        - 4. (downarrow) Player_004
        - 5. ~ Player_005

---

### Dev Process

- Create a separate component for the host-leaderboard-screen inside the games folder in components `src\components\game`
- Page will be loated inside the folder `src\app\(pages)`
- Check out other related files like `src\app\(pages)\host-answer-screen`, `src\app\(pages)\host-answer-reveal` to get the context of how things are implemented
- Create the ui following the **Requirements** and **Layout**
- Hook the ui to the page
- Hook the page to auto switch when the timer runs out at the **host-answer-reveal**
- If the question is last question we will not show the leaderboard Because of the following:
  - To keep the hype for the final scores
  - To show actual results in podium and not spoil the rank
