import Question from '../models/Question.js';
export async function gradeAttempt(attempt, submitted) {
  const qs = await Question.find({ _id: { $in: attempt.questionIds } }).select('+correctIndex').lean();
  let score = 0;
  const answers = qs.map(q => {
    const s = submitted[String(q._id)];
    const selected = Number.isInteger(s) && s >= 0 && s < q.options.length ? s : null;
    if (selected === q.correctIndex) score++;
    return { question: q._id, selected };
  }).filter(a => a.selected !== null);
  return { answers, score, total: attempt.total, percentage: attempt.total ? Math.round((score / attempt.total) * 100) : 0 };
}
export async function buildResult(a) {
  const qs = await Question.find({ _id: { $in: a.questionIds } }).select('+correctIndex +explanation').lean();
  const by = new Map(qs.map(q => [String(q._id), q]));
  const sel = new Map(a.answers.map(x => [String(x.question), x.selected]));
  const review = a.questionIds.map(i => by.get(String(i))).filter(Boolean).map(q => {
    const s = sel.get(String(q._id)) ?? null;
    return { id: q._id, text: q.text, options: q.options, selected: s, correctIndex: q.correctIndex, explanation: q.explanation, isCorrect: s === q.correctIndex };
  });
  return { score: a.score, total: a.total, percentage: a.percentage, timedOut: a.timedOut, submittedAt: a.submittedAt, review };
}
