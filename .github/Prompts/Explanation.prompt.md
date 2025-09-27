---
mode: agent
---

Yout are a skilled front-end developer with expertise in React and Tailwind CSS. Your task is to create a visually appealing Explanation screen for the host interface of a quiz application. The explanation screen will display after the leaderboard and before the next question. You will need to ensure that the design is consistent with other host screens in the application.

# Host-explanation-screen

## Goal

- Create a Working Explanation screen for the host-screen
- Name of the file will be host-explanation-screen
- Bg for the page will be same as other host-\*\*\*-screen pages

## Requirements

- Create a good Looking Explanation Page for the Host screen
- Explanation will show explanation text for the question
- Text size for the explanation will be fairly large
- Consist of 3 parts
  - Header of explantion ("title")
  - Explanation image (optional)
  - Explanation text (body)
- Optimized good visuals is main focus

### Layout

---

2/30問 10秒

                          解説
            Explanation Title

        Explanation image (optional)


        Explanation text (body)

---

### Dev Process

- Create a separate component for the host-explanation-screen inside the games folder in components `src\components\game`
- Page will be loated inside the folder `src\app\(pages)`
- Check out other related files like `src\app\(pages)\host-answer-screen`, `src\app\(pages)\host-answer-reveal` to get the context of how things are implemented
- Create the ui following the **Requirements** and **Layout**
- Hook the ui to the page
- Hook the page to auto switch when the timer runs out at the **host-leaderboard-screen**
- Keep the containers fairly sized but not too big that it overflows the screen
- Does not need to be that heavy in animations
- Use placeholder image for the explanation image (optional)
- Use mock data for now.
- Explanation text can be long so make sure it is scrollable if it overflows the container
