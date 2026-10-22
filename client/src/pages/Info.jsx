import { Wrap } from '../components/ui.jsx';
const mail = import.meta.env.VITE_CONTACT_EMAIL;
const pages = {
  about: ['About QuizALP', ['QuizALP is a free practice platform for timed multiple-choice quizzes in general knowledge, science, computer science, current affairs, mathematics and programming.', 'Every answer comes with an explanation, and signed-in learners keep a history of their attempts so they can see progress over time.']],
  contact: ['Contact', [mail ? `Questions, corrections or feedback? Email ${mail}.` : 'Contact details will be published here before launch.']],
  privacy: ['Privacy Policy', ['Draft: have this reviewed before launch.', 'We store the name and email you register with, a hashed password, and your quiz attempts so we can show your history. Guests can play without an account.', 'If advertising is enabled in future, this policy must describe the cookies and data used by ad networks and how to opt out.']],
  terms: ['Terms of Use', ['Draft: have this reviewed before launch.', 'QuizALP is provided as-is for learning and practice. Do not attempt to disrupt the service or access other users\' data. We may remove accounts that abuse the platform.']],
};
export default function Info({ page }) {
  const [title, body] = pages[page];
  return <Wrap className="max-w-2xl py-12"><h1 className="text-3xl font-extrabold">{title}</h1>{body.map((p, i) => <p key={i} className="mt-4 text-lg">{p}</p>)}</Wrap>;
}
