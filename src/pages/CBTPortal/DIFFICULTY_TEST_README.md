# Difficulty-Based Test Feature

## Overview
This feature allows students to practice JEE questions filtered by difficulty level (Easy, Medium, Hard). Each difficulty-based test contains approximately 75 questions (25 per subject) randomly selected from the question bank.

## How It Works

### 1. Test Discovery
When you open the CBT Portal, you'll now see THREE new test options at the top:
- 🟢 **Easy Level Practice Test** - Perfect for building fundamentals
- 🟡 **Medium Level Practice Test** - For intermediate practice
- 🔴 **Hard Level Practice Test** - For challenging yourself

These appear BEFORE the regular full-length tests.

### 2. Question Selection
The system:
1. Reads all available test papers with difficulty metadata
2. Filters questions by the selected difficulty level
3. Randomly selects 25 questions per subject (Physics, Chemistry, Mathematics)
4. Creates a custom 75-question test

### 3. Question Metadata Format
Each test needs a difficulty metadata file in this format:
```json
{
  "paperId": "test-id",
  "paperTitle": "Test Name",
  "sections": {
    "physics": {
      "1": { "difficulty": "easy", "lesson": "Topic Name", "type": "MCQ" },
      "2": { "difficulty": "medium", "lesson": "Topic Name", "type": "MCQ" },
      ...
    },
    "chemistry": { ... },
    "mathematics": { ... }
  }
}
```

**File Location:** `/public/tests/{test-folder}/{test-folder}-physics-1-15.json`

## Adding New Tests for Difficulty-Based Practice

### Step 1: Create Difficulty Metadata File
1. Navigate to your test folder: `/public/tests/your-test-name/`
2. Create a file: `your-test-name-physics-1-15.json`
3. Use the format shown above

### Step 2: Register the Test
Edit `/src/pages/CBTPortal/difficultyTestGenerator.js`:
```javascript
const knownTests = [
  'jee-main-2022-27th-jan-shift-1',
  'jee-main-2023-25th-jan-shift-2',
  'your-new-test-name' // Add your test here
];
```

### Step 3: Ensure answerKey.json Exists
Your test folder must also have `answerKey.json` with correct answers.

## Technical Details

### Files Modified/Created
1. **difficultyTestGenerator.js** (NEW)
   - Loads difficulty metadata
   - Filters questions by difficulty
   - Generates custom 75-question tests
   
2. **testDiscovery.js** (MODIFIED)
   - Now includes difficulty-based tests in discovery
   - Handles both regular and difficulty-based test IDs
   
3. **testLoader.js** (MODIFIED)
   - Detects if test is difficulty-based
   - Routes to appropriate loader function
   
4. **CBTPortal.scss** (MODIFIED)
   - Added styling for "Difficulty Practice" test type
   - Gradient background for difficulty tests

### Test ID Format
- Regular tests: `jee-main-2023-25th-jan-shift-2`
- Difficulty tests: `difficulty-easy`, `difficulty-medium`, `difficulty-hard`

### Question Distribution
Each difficulty test aims for:
- **25 Physics questions** (from available easy/medium/hard questions)
- **25 Chemistry questions**
- **25 Mathematics questions**
- **Total: 75 questions**

If fewer than 25 questions are available for a subject at a difficulty level, all available questions are used.

### Random Selection
Questions are randomly shuffled to provide variety each time a student takes a difficulty-based test.

## Benefits for Students

1. **Progressive Learning**: Start with easy, move to medium, master hard questions
2. **Targeted Practice**: Focus on areas where you need improvement
3. **Time Efficient**: 75 questions take ~2.5 hours vs 3 hours for full tests
4. **Confidence Building**: Easy tests help build confidence before tackling harder content
5. **Varied Practice**: Random selection means different questions each attempt

## Example Usage

A student preparing for JEE might:
1. Week 1: Take **Easy Level** test to understand format
2. Week 2-3: Practice **Medium Level** tests regularly
3. Week 4: Challenge with **Hard Level** tests
4. Week 5: Take full-length mock tests

## Future Enhancements

Possible additions:
- Subject-specific difficulty tests (e.g., "Hard Physics Only")
- Topic-wise difficulty tests (e.g., "Medium Organic Chemistry")
- Mixed difficulty tests (combine easy + medium + hard)
- Adaptive difficulty based on performance

## Troubleshooting

### "No questions available for [subject]"
- Check that difficulty metadata files exist
- Verify the test is registered in `knownTests` array
- Ensure metadata matches answerKey.json structure

### Questions not loading
- Check browser console for errors
- Verify image files exist in `/public/tests/{test-folder}/{subject}/{question-number}.png`
- Ensure difficulty metadata question numbers match answerKey.json

### Test shows 0 questions
- At least one test must have difficulty metadata
- Check that metadata file is valid JSON
- Verify difficulty values are lowercase: "easy", "medium", "hard"
