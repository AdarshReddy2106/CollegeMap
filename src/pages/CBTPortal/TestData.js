// Question Data Structure Format
// Each paper should follow this structure:

export const questionFormat = {
  paperId: "string (unique identifier)",
  paperTitle: "string",
  paperType: "JEE Main | JEE Advanced",
  duration: 10800, // in seconds (3 hours = 10800 seconds)
  totalQuestions: 75, // 25 per subject
  sections: [
    {
      sectionId: "physics",
      sectionName: "Physics",
      questions: [
        {
          questionId: "string (unique)",
          questionNumber: 1,
          questionText: "string (can include HTML/markdown)",
          questionImage: "string (optional - URL or path to image)",
          questionType: "single-correct | multiple-correct | integer",
          correctIntegerAnswer: "number OR { min: number, max: number } (for integer type only)",
          options: [
            {
              optionId: "A", // Display ID (A, B, C, D)
              optionKey: "unique-key-1", // Unique key for this option
              optionText: "string"
            }
          ],
          correctAnswer: ["A"], // For display/backward compatibility
          correctAnswerKeys: ["unique-key-1"], // Array of unique keys for correct answers
          marks: 4, // Positive marks
          negativeMarks: -1, // Negative marking
          subject: "Physics",
          topic: "string (optional)",
          difficulty: "Easy | Medium | Hard (optional)"
        }
      ]
    },
    {
      sectionId: "chemistry",
      sectionName: "Chemistry",
      questions: [] // Same structure as Physics
    },
    {
      sectionId: "mathematics",
      sectionName: "Mathematics",
      questions: [] // Same structure as Physics
    }
  ]
};

// Sample Test Paper Data
export const sampleTestPaper = {
  paperId: "jee-main-2024-mock-1",
  paperTitle: "JEE Main 2024 Mock Test - Paper 1",
  paperType: "JEE Main",
  duration: 10800, // 3 hours in seconds
  totalQuestions: 5, // Starting with 1-2 per section for testing
  sections: [
    {
      sectionId: "physics",
      sectionName: "Physics",
      questions: [
        {
          questionId: "phy-1",
          questionNumber: 1,
          questionText: "A particle moves in a straight line with constant acceleration. If it covers distances s₁ and s₂ in successive intervals of time t₁ and t₂, then the acceleration is:",
          questionImage: null, // Example: "https://example.com/image.png" or "/images/question1.png"
          questionType: "single-correct",
          options: [
            { optionId: "A", optionKey: "phy-1-opt-1", optionText: "2(s₁t₂ - s₂t₁) / (t₁t₂(t₁ + t₂))" },
            { optionId: "B", optionKey: "phy-1-opt-2", optionText: "2(s₂t₁ - s₁t₂) / (t₁t₂(t₁ + t₂))" },
            { optionId: "C", optionKey: "phy-1-opt-3", optionText: "2(s₁t₂ + s₂t₁) / (t₁t₂(t₁ + t₂))" },
            { optionId: "D", optionKey: "phy-1-opt-4", optionText: "2(s₁t₂ - s₂t₁) / (t₁t₂(t₁ - t₂))" }
          ],
          correctAnswer: ["A"], // For display/backward compatibility
          correctAnswerKeys: ["phy-1-opt-1"], // Unique keys for correct answer
          marks: 4,
          negativeMarks: -1,
          subject: "Physics",
          topic: "Kinematics",
          difficulty: "Medium"
        }
      ]
    },
    {
      sectionId: "chemistry",
      sectionName: "Chemistry",
      questions: [
        {
          questionId: "chem-1",
          questionNumber: 1,
          questionText: "Which of the following is the correct order of increasing bond angle?",
          questionImage: null, // Add image URL here for image-based questions
          questionType: "single-correct",
          options: [
            { optionId: "A", optionKey: "chem-1-opt-1", optionText: "NH₃ < H₂O < CH₄" },
            { optionId: "B", optionKey: "chem-1-opt-2", optionText: "H₂O < NH₃ < CH₄" },
            { optionId: "C", optionKey: "chem-1-opt-3", optionText: "CH₄ < NH₃ < H₂O" },
            { optionId: "D", optionKey: "chem-1-opt-4", optionText: "NH₃ < CH₄ < H₂O" }
          ],
          correctAnswer: ["B"],
          correctAnswerKeys: ["chem-1-opt-2"],
          marks: 4,
          negativeMarks: -1,
          subject: "Chemistry",
          topic: "Chemical Bonding",
          difficulty: "Medium"
        }
      ]
    },
    {
      sectionId: "mathematics",
      sectionName: "Mathematics",
      questions: [
        {
          questionId: "math-1",
          questionNumber: 1,
          questionText: "If the roots of the equation x² - bx + c = 0 are two consecutive integers, then b² - 4c equals:",
          questionImage: null, // Add image URL here for image-based questions
          questionType: "single-correct",
          options: [
            { optionId: "A", optionKey: "math-1-opt-1", optionText: "1" },
            { optionId: "B", optionKey: "math-1-opt-2", optionText: "2" },
            { optionId: "C", optionKey: "math-1-opt-3", optionText: "3" },
            { optionId: "D", optionKey: "math-1-opt-4", optionText: "4" }
          ],
          correctAnswer: ["A"],
          correctAnswerKeys: ["math-1-opt-1"],
          marks: 4,
          negativeMarks: -1,
          subject: "Mathematics",
          topic: "Quadratic Equations",
          difficulty: "Medium"
        },
        {
          questionId: "math-2",
          questionNumber: 2,
          questionText: "Study the graph below and determine the value of the function at x = 3:",
          questionImage: "https://via.placeholder.com/600x300/10c3bc/ffffff?text=Sample+Graph+Question",
          questionType: "single-correct",
          options: [
            { optionId: "A", optionKey: "math-2-opt-1", optionText: "5" },
            { optionId: "B", optionKey: "math-2-opt-2", optionText: "7" },
            { optionId: "C", optionKey: "math-2-opt-3", optionText: "9" },
            { optionId: "D", optionKey: "math-2-opt-4", optionText: "11" }
          ],
          correctAnswer: ["B"],
          correctAnswerKeys: ["math-2-opt-2"],
          marks: 4,
          negativeMarks: -1,
          subject: "Mathematics",
          topic: "Functions",
          difficulty: "Medium"
        },
        {
          questionId: "math-3",
          questionNumber: 3,
          questionText: "If the sum of the first n terms of an arithmetic progression is 3n² + 5n, then find the 10th term:",
          questionImage: null,
          questionType: "integer",
          options: [], // No options for integer type
          correctAnswer: null, // Not used for integer type
          correctAnswerKeys: null, // Not used for integer type
          correctIntegerAnswer: 65, // Single integer value OR { min: 64, max: 66 } for range
          marks: 4,
          negativeMarks: -1,
          subject: "Mathematics",
          topic: "Arithmetic Progression",
          difficulty: "Medium"
        }
      ]
    }
  ]
};

// Available Test Papers List
export const availableTests = [
  {
    id: "jee-main-2024-mock-1",
    title: "JEE Main 2024 Mock Test - Paper 1",
    type: "JEE Main",
    duration: "3 hours",
    totalQuestions: 5, // Will be 75 in actual implementation
    subjects: ["Physics", "Chemistry", "Mathematics"],
    description: "Comprehensive mock test covering all three subjects",
    paperData: sampleTestPaper
  }
];

