import { QuestionItem, TargetLevel } from "@/types/student";

export const INITIAL_QUESTIONS: QuestionItem[] = [
  {
    id: "q-01",
    questionText: "Choose the correct greeting to say to a friend in the morning:",
    targetLevel: "ELEMENTARY",
    correctOptionId: "opt-01-a",
    options: [
      { id: "opt-01-a", optionText: "Good morning!" },
      { id: "opt-01-b", optionText: "Good night!" },
      { id: "opt-01-c", optionText: "Goodbye!" },
      { id: "opt-01-d", optionText: "See you later!" },
    ],
  },
  {
    id: "q-02",
    questionText: "Sarah is a doctor. She _______ in a central hospital in Jakarta.",
    targetLevel: "ELEMENTARY",
    correctOptionId: "opt-02-a",
    options: [
      { id: "opt-02-a", optionText: "works" },
      { id: "opt-02-b", optionText: "work" },
      { id: "opt-02-c", optionText: "working" },
      { id: "opt-02-d", optionText: "worked" },
      { id: "opt-02-e", optionText: "is work" },
    ],
  },
  {
    id: "q-03",
    questionText: "What is the opposite meaning of the word 'Difficult'?",
    targetLevel: "ELEMENTARY",
    correctOptionId: "opt-03-a",
    options: [
      { id: "opt-03-a", optionText: "Easy" },
      { id: "opt-03-b", optionText: "Hard" },
      { id: "opt-03-c", optionText: "Heavy" },
    ],
  },
  {
    id: "q-04",
    questionText: "They _______ football in the stadium yesterday afternoon.",
    targetLevel: "ELEMENTARY",
    correctOptionId: "opt-04-a",
    options: [
      { id: "opt-04-a", optionText: "played" },
      { id: "opt-04-b", optionText: "plays" },
      { id: "opt-04-c", optionText: "play" },
      { id: "opt-04-d", optionText: "are playing" },
    ],
  },
  {
    id: "q-05",
    questionText: "Excuse me, could you please tell me _______ the nearest bank is?",
    targetLevel: "ELEMENTARY",
    correctOptionId: "opt-05-a",
    options: [
      { id: "opt-05-a", optionText: "where" },
      { id: "opt-05-b", optionText: "when" },
      { id: "opt-05-c", optionText: "what" },
      { id: "opt-05-d", optionText: "which" },
    ],
  },
  {
    id: "q-06",
    questionText: "I usually have a cup of tea _______ the morning before leaving for school.",
    targetLevel: "ELEMENTARY",
    correctOptionId: "opt-06-a",
    options: [
      { id: "opt-06-a", optionText: "in" },
      { id: "opt-06-b", optionText: "on" },
      { id: "opt-06-c", optionText: "at" },
      { id: "opt-06-d", optionText: "by" },
    ],
  },
  {
    id: "q-07",
    questionText: "If it rains heavily tomorrow, we _______ our outdoor camping trip.",
    targetLevel: "HIGH_SCHOOL",
    correctOptionId: "opt-07-a",
    options: [
      { id: "opt-07-a", optionText: "will cancel" },
      { id: "opt-07-b", optionText: "cancelled" },
      { id: "opt-07-c", optionText: "would cancel" },
      { id: "opt-07-d", optionText: "had cancelled" },
    ],
  },
  {
    id: "q-08",
    questionText: "The new library building _______ by the governor last month.",
    targetLevel: "HIGH_SCHOOL",
    correctOptionId: "opt-08-a",
    options: [
      { id: "opt-08-a", optionText: "was inaugurated" },
      { id: "opt-08-b", optionText: "is inaugurating" },
      { id: "opt-08-c", optionText: "inaugurates" },
      { id: "opt-08-d", optionText: "has inaugurated" },
    ],
  },
  {
    id: "q-09",
    questionText: "Despite having little preparation, Michael gave _______ presentation during the conference.",
    targetLevel: "HIGH_SCHOOL",
    correctOptionId: "opt-09-a",
    options: [
      { id: "opt-09-a", optionText: "an impressive" },
      { id: "opt-09-b", optionText: "a impressed" },
      { id: "opt-09-c", optionText: "impressing" },
      { id: "opt-09-d", optionText: "impression" },
    ],
  },
  {
    id: "q-10",
    questionText: "She has been studying English at Up Speaking Centre _______ three months.",
    targetLevel: "ELEMENTARY",
    correctOptionId: "opt-10-a",
    options: [
      { id: "opt-10-a", optionText: "for" },
      { id: "opt-10-b", optionText: "since" },
      { id: "opt-10-c", optionText: "during" },
      { id: "opt-10-d", optionText: "while" },
    ],
  },
];

export const MOCK_QUESTIONS = INITIAL_QUESTIONS;

const QUESTIONS_STORAGE_KEY = "up_speaking_mock_questions";

export function getMockQuestions(): QuestionItem[] {
  if (typeof window === "undefined") return INITIAL_QUESTIONS;
  try {
    const raw = localStorage.getItem(QUESTIONS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(QUESTIONS_STORAGE_KEY, JSON.stringify(INITIAL_QUESTIONS));
      return INITIAL_QUESTIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_QUESTIONS;
  }
}

export function saveMockQuestions(questions: QuestionItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(QUESTIONS_STORAGE_KEY, JSON.stringify(questions));
  } catch {
    // ignore
  }
}

export function addMockQuestion(item: {
  questionText: string;
  targetLevel: TargetLevel;
  options: { id: string; optionText: string }[];
  correctOptionId: string;
}): QuestionItem {
  const current = getMockQuestions();
  const newItem: QuestionItem = {
    id: `q-${Date.now().toString().slice(-4)}`,
    questionText: item.questionText.trim(),
    targetLevel: item.targetLevel,
    options: item.options,
    correctOptionId: item.correctOptionId,
  };
  const updated = [newItem, ...current];
  saveMockQuestions(updated);
  return newItem;
}

export function deleteMockQuestion(id: string): void {
  const current = getMockQuestions();
  const updated = current.filter((q) => q.id !== id);
  saveMockQuestions(updated);
}
