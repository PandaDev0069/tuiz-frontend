# Game Point Calculation

Cases:

1. Player answered correctly
2. Player answered incorrectly
3. Player answered correctly but not in time
4. Player answered incorrectly but in time
5. Player did not answer in time

Points:

- Point per question can be selected by the host during the creation of question.
- Each question can have different number of points.
- There is also bonus points system.

There are 3 settings that are togglable by the host during the creation of quiz set. These settings apply for the whole quiz set.

1. Normal points mode
2. Time bonus mode
3. Streak bonus mode
4. Streak bonus mode with time bonus

Normal points mode is the mode with time bonus and streak bonus disabled. In this mode, the points are calculated based on the points per question setting.

Time bonus mode is the mode with time bonus enabled. In this mode, the points are calculated based on the time taken to answer the question. suppose if the player takes 1.5 seconds to answer the question, and the points per question is 100, then the points will be 100 - (1.5 \* answering_time) = 85 points. answering time is the time that is set for answering the question and it is located in the metadata of the question.

Streak bonus mode is the mode with streak bonus enabled. In this mode, the points are calculated based on the streak of questions answered correctly. suppose if the player answers 3 questions correctly in a row, and the points per question is 100, then the points will be 100 + (100 \* 0.3) = 130 points.
and max will be 5 streaks that means a player can earn upto 1.5 times the base points.

The combined mode is as follows:

(Base*points - (time_taken * answering*time) ) * (streak/10)

and max streak is 5 that means a player can earn upto 1.5 times the base points.

in mathametical formula it is as follows:

$$ Points = (Base*points - (time_taken * answering*time)) * (streak/10) $$
