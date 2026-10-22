// Original sample content. Format: [question, options, correctIndex, explanation]
export default [
  { name: 'GK', icon: 'Globe', description: 'General knowledge across geography, history and the world around us.',
    quiz: { title: 'World Basics', description: 'Geography and general knowledge essentials.', difficulty: 'Easy', minutes: 5, featured: true, questions: [
      ['Which planet is known as the Red Planet?', ['Mars', 'Venus', 'Jupiter', 'Mercury'], 0, 'Iron oxide on the surface gives Mars its reddish colour.'],
      ['What is the capital of Australia?', ['Sydney', 'Melbourne', 'Canberra', 'Perth'], 2, 'Canberra was purpose-built as the capital in the early 20th century.'],
      ['Which river is the longest within India?', ['Yamuna', 'Godavari', 'Ganga', 'Narmada'], 2, 'The Ganga flows about 2,500 km, the longest river within India.'],
      ['How many continents are there by the common convention?', ['5', '6', '7', '8'], 2, 'The usual count is Africa, Antarctica, Asia, Australia/Oceania, Europe, North America and South America.'],
      ['Which is the largest ocean?', ['Atlantic', 'Indian', 'Arctic', 'Pacific'], 3, 'The Pacific covers about a third of Earth\'s surface.'] ] } },
  { name: 'Science', icon: 'FlaskConical', description: 'Physics, chemistry and biology fundamentals.',
    quiz: { title: 'Science Starter', description: 'Core ideas from school science.', difficulty: 'Easy', minutes: 6, featured: true, questions: [
      ['Which gas do plants absorb for photosynthesis?', ['Oxygen', 'Carbon dioxide', 'Nitrogen', 'Hydrogen'], 1, 'Plants take in carbon dioxide and release oxygen.'],
      ['What is the chemical symbol for sodium?', ['So', 'Na', 'Sd', 'N'], 1, 'Na comes from the Latin name natrium.'],
      ['Which unit measures electrical resistance?', ['Volt', 'Ampere', 'Ohm', 'Watt'], 2, 'Resistance is measured in ohms.'],
      ['Which part of a cell holds its genetic material?', ['Nucleus', 'Ribosome', 'Cell wall', 'Vacuole'], 0, 'DNA is stored mainly in the nucleus.'],
      ['What is the approximate speed of light in a vacuum?', ['3 × 10^8 m/s', '3 × 10^5 m/s', '3 × 10^6 m/s', '3 × 10^10 m/s'], 0, 'Light travels at about 300,000 km/s, or 3 × 10^8 m/s.'] ] } },
  { name: 'Computer Science', icon: 'Cpu', description: 'Hardware, data structures, networks and algorithms.',
    quiz: { title: 'CS Fundamentals', description: 'Core computer science concepts.', difficulty: 'Medium', minutes: 8, featured: true, questions: [
      ['What does CPU stand for?', ['Central Processing Unit', 'Computer Personal Unit', 'Central Program Utility', 'Core Processing Update'], 0, 'The CPU executes program instructions.'],
      ['Which data structure follows last-in, first-out order?', ['Queue', 'Stack', 'Array', 'Graph'], 1, 'A stack removes the most recently added item first.'],
      ['What is decimal 5 in binary?', ['101', '110', '011', '111'], 0, '5 = 4 + 1, which is 101 in binary.'],
      ['Which protocol secures web traffic with encryption?', ['HTTP', 'FTP', 'HTTPS', 'SMTP'], 2, 'HTTPS runs HTTP over TLS.'],
      ['What is the time complexity of binary search on a sorted array?', ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'], 1, 'Each step halves the search range.'] ] } },
  { name: 'Current Affairs', icon: 'Newspaper', description: 'Institutions and ideas that keep showing up in the news.',
    quiz: { title: 'World Institutions', description: 'Evergreen questions on organisations in the news. Admins can add timely quizzes.', difficulty: 'Medium', minutes: 6, questions: [
      ['Which organisation publishes the World Economic Outlook report?', ['World Bank', 'IMF', 'WTO', 'OECD'], 1, 'The International Monetary Fund publishes it twice a year.'],
      ['Which UN agency coordinates international public health, with headquarters in Geneva?', ['UNESCO', 'UNICEF', 'WHO', 'FAO'], 2, 'The World Health Organization is based in Geneva.'],
      ['Annual COP summits take place under which framework?', ['UNFCCC', 'WTO', 'NATO', 'BRICS'], 0, 'COP is the Conference of the Parties to the UN Framework Convention on Climate Change.'],
      ['Which institution is India\'s central bank?', ['SEBI', 'NITI Aayog', 'RBI', 'NABARD'], 2, 'The Reserve Bank of India sets monetary policy.'],
      ['What does GDP stand for?', ['Gross Domestic Product', 'General Development Plan', 'Global Demand Price', 'Gross Digital Profit'], 0, 'GDP is the total value of goods and services produced in an economy.'] ] } },
  { name: 'Mathematics and Aptitude', icon: 'Calculator', description: 'Arithmetic, algebra and reasoning practice.',
    quiz: { title: 'Quick Aptitude', description: 'Short numerical and reasoning problems.', difficulty: 'Medium', minutes: 8, questions: [
      ['What is 15% of 200?', ['20', '25', '30', '35'], 2, '0.15 × 200 = 30.'],
      ['What comes next: 2, 6, 12, 20, 30, ?', ['40', '42', '44', '36'], 1, 'The differences grow by 2 (4, 6, 8, 10, 12), so 30 + 12 = 42.'],
      ['A train travels at 60 km/h. How long does it take to cover 150 km?', ['2 h', '2.5 h', '3 h', '3.5 h'], 1, 'Time = distance ÷ speed = 150 ÷ 60 = 2.5 hours.'],
      ['Solve for x: 3x + 7 = 22', ['4', '5', '6', '7'], 1, '3x = 15, so x = 5.'],
      ['What is the average of 10, 20, 30 and 40?', ['20', '25', '30', '35'], 1, 'The sum is 100, and 100 ÷ 4 = 25.'] ] } },
  { name: 'Programming', icon: 'Code2', description: 'Languages, tools and everyday developer knowledge.',
    quiz: { title: 'Code Check', description: 'JavaScript, Python and Git basics.', difficulty: 'Hard', minutes: 8, questions: [
      ['Which JavaScript keyword declares a block-scoped variable?', ['var', 'let', 'def', 'dim'], 1, 'let (and const) are block-scoped; var is function-scoped.'],
      ['What does HTML stand for?', ['HyperText Markup Language', 'High Text Machine Language', 'HyperTool Multi Language', 'Home Text Markup Language'], 0, 'HTML structures content on the web.'],
      ['Which keyword defines a function in Python?', ['func', 'function', 'def', 'fn'], 2, 'Python uses def.'],
      ['Which Git command creates a branch and switches to it?', ['git branch -d x', 'git checkout -b x', 'git merge x', 'git init x'], 1, 'git checkout -b x (or git switch -c x) creates and switches.'],
      ['What does typeof null return in JavaScript?', ['"null"', '"undefined"', '"object"', '"number"'], 2, 'A long-standing quirk of the language.'] ] } },
];
