# Webapp-for-FuzzyAHP
A frontend-only webapp made to help with hiring decision using the MCDM method of Fuzzy AHP

## Motivation
- Hiring decisions are complex and involve multiple criteria (skills, experience, culture fit, etc.) that are often subjective and difficult to quantify.
- Fuzzy AHP allows decision-makers to express their preferences in a more flexible way, using linguistic terms (e.g., "slightly more important", "much less important") that can be converted into fuzzy numbers.
- A webapp can make the Fuzzy AHP process more accessible and user-friendly, allowing HR professionals and hiring managers to make more informed decisions without needing to understand the underlying mathematics. 

## MVP Checklist
- User can: 
    - create a new decision
    - add 2–6 criteria ( >= 2 is needed for pairwise comparisons)
    - add 2–5 candidates (>= 2 is needed for pairwise comparisons)
    - input fuzzy pairwise comparisons for criteria
    - input fuzzy pairwise comparisons for candidates

- App:
    - calculates criteria weights from fuzzy comparisons
    - calculates candidate scores from fuzzy comparisons
    - displays ranking with overall scores
    - displays criteria weights
    - displays candidate scores per criterion

- User can navigate back to edit comparisons
- User can start a new decision

## Project Structure
```
fuzzy-ahp-hiring/
├── index.html
├── css/
│   ├── styles.css
│   └── components.css
├── js/
│   ├── app.js (main entry point)
│   ├── state.js (state management)
|   ├── router.js (simple client-side routing)
│   ├── pages/
|   |   ├── layout.js (common layout and navigation)
|   |   ├── basePageClass.js (base class for pages)
│   │   ├── home.js (Step 1)
│   │   ├── criteria.js (Step 2)
│   │   ├── candidates.js (Step 3)
│   │   ├── comparisons.js (Step 4)
│   │   └── results.js (Step 5)
│   ├── components/
│   │   ├── fuzzyInput.js (reusable fuzzy number input)
│   │   ├── progressBar.js
│   │   └── charts.js
│   ├── utils/
│   │   ├── validation.js
│   │   └── constants.js
│   └── math/
│       ├── fuzzyAHP.js (core AHP logic)
│       ├── matrix.js (matrix operations)
│       └── defuzzification.js
└── README.md
```

## Notable Logic Details:
- User can make their own criteria and candidates; however, in the step of `Constructing Fuzzy Pairwise Comparison Matrices`, the app will only allow the user to select the linguistic terms (i.e "Equally important", "Absolutely important") and then the system converts these terms to the equivalent Fuzzy triangular scale. Table below shows the mapping of linguistic terms to fuzzy numbers:
```
| Saaty Scale   | Linguistic Term           | Fuzzy Triangular Scale (l, m, u) |
|---------------|---------------------------|----------------------------------|
|   1           | Equally important         | (1, 1, 1)                        |
|   3           | Weakly important          | (2, 3, 4)                        |
|   5           | Fairly important          | (4, 5, 6)                        |
|   7           | Strongly important        | (6, 7, 8)                        |
|   9           | Absolutely important      | (9, 9, 9)                        |
| Intermediate values (2, 4, 6, 8) can be represented as follows:              |
|   2           |                           | (1, 2, 3)                        |
|   4           |                           | (3, 4, 5)                        |
|   6           |                           | (5, 6, 7)                        |
|   8           |                           | (7, 8, 9)                        |
```

- For reciprocal comparisons (e.g., if A is 'Weakly important' over B, then B is 'Weakly important' under A), the system automatically calculates the inverse fuzzy number. For example, if A is 'Weakly important' over B (2, 3, 4), then B is 'Weakly important' under A (1/4, 1/3, 1/2).

## Intended User's flow:
1. User starts at the home page and clicks "Start New Decision".

2. User is taken to the criteria page where they can add 2–6 criteria (e.g., "Technical Skills", "Experience", "Culture Fit").

3. User clicks "Next" and is taken to the candidates page where they can add 2–5 candidates (e.g., "Alice", "Bob", "Charlie").

4. User clicks "Next" and is taken to the comparisons page where they input fuzzy pairwise comparisons for criteria. 
- There will be a list of questions such as:
```
Which is more important?
"Technical Skills" or "Experience"? And by how much (this would be a dropdown with the linguistic terms)? Or they are both equally important?
```

5. After completing criteria comparisons, user clicks "Next" and is taken to the candidate comparisons page where they input fuzzy pairwise comparisons for candidates with respect to each criterion. 
- For example, for the criterion "Technical Skills", the user would answer questions like:
```
For Technical skills, who is better ?
"Alice" or "Bob"? And by how much (dropdown with linguistic terms)? Or they are both equally skilled?
```

6. After completing all comparisons, user clicks "Calculate" and is taken to the results page where they see:
- A ranking of candidates based on their overall scores
- The calculated weights for each criterion (pie chart)
- The scores of each candidate for each criterion (Matrix, table or heatmap)

### Important Note:
- The calculations are done using the Fuzzy AHP method after step 5 is completed.
- There will be a "Back" button on each page to allow users to go back and edit their comparisons if they want to change their inputs before finalizing the results. The edits will be applied to the data stored in `state.js` and the results will be updated accordingly when the user clicks "Calculate" again.
- Validation will occur at each step when the user clicks "Next". Then, a validation check (in `validation.js`) will run to ensure that the user has entered the required number of criteria, candidates, and comparisons before allowing them to proceed to the next step. If validation fails, an error message will be displayed prompting the user to correct their input.
- `state.js` will be used to store all user inputs and calculated results, allowing for easy access and updates across different pages of the app.
