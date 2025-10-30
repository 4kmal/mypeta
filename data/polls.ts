export interface Poll {
  id: string;
  question: string;
  description: string;
  category: 'food' | 'politics' | 'culture' | 'economy' | 'social';
  options: {
    label: string;
    emoji: string;
  }[];
  createdAt: Date;
  endDate?: Date;
}

export const POLLS_DATA: Poll[] = [
  {
    id: 'nasi-lemak-best',
    question: 'Is Nasi Lemak the best breakfast in the world?',
    description: 'The eternal debate about Malaysia\'s national dish',
    category: 'food',
    createdAt: new Date('2024-01-15'),
    endDate: new Date('2025-12-31'),
    options: [
      { label: 'Yes, absolutely!', emoji: '🇲🇾' },
      { label: 'No, there are better options', emoji: '🌍' },
    ],
  },
  {
    id: 'toll-abolishment',
    question: 'Should all highway tolls in Malaysia be abolished?',
    description: 'A hot topic affecting daily commuters',
    category: 'economy',
    createdAt: new Date('2024-01-14'),
    endDate: new Date('2025-06-30'),
    options: [
      { label: 'Yes, abolish all tolls', emoji: '🚫' },
      { label: 'No, keep tolls for maintenance', emoji: '💰' },
    ],
  },
  {
    id: 'roti-canai-vs-prata',
    question: 'Roti Canai or Roti Prata - which name is correct?',
    description: 'The naming controversy that divides a nation',
    category: 'food',
    createdAt: new Date('2024-01-13'),
    options: [
      { label: 'Roti Canai', emoji: '🇲🇾' },
      { label: 'Roti Prata', emoji: '🇸🇬' },
    ],
  },
  {
    id: 'kl-traffic',
    question: 'Is KL traffic worse than Jakarta\'s?',
    description: 'Battle of Southeast Asian traffic nightmares',
    category: 'social',
    createdAt: new Date('2024-01-12'),
    options: [
      { label: 'Yes, KL is worse', emoji: '🚗' },
      { label: 'No, Jakarta wins', emoji: '🏙️' },
    ],
  },
  {
    id: 'bahasa-importance',
    question: 'Should Bahasa Malaysia be the primary language in all schools?',
    description: 'Education and language policy debate',
    category: 'politics',
    createdAt: new Date('2024-01-11'),
    endDate: new Date('2024-11-30'),
    options: [
      { label: 'Yes, prioritize BM', emoji: '📚' },
      { label: 'No, maintain multilingual education', emoji: '🌐' },
    ],
  },
  {
    id: 'durian-king',
    question: 'Is Musang King truly the best durian variety?',
    description: 'The thorny debate among durian lovers',
    category: 'food',
    createdAt: new Date('2024-01-10'),
    options: [
      { label: 'Yes, Musang King is supreme', emoji: '👑' },
      { label: 'No, other varieties are better', emoji: '🌟' },
    ],
  },
  {
    id: 'public-transport',
    question: 'Will Malaysia ever have world-class public transport?',
    description: 'Hopes and dreams for better connectivity',
    category: 'economy',
    createdAt: new Date('2024-01-09'),
    endDate: new Date('2025-12-31'),
    options: [
      { label: 'Yes, within 10 years', emoji: '🚄' },
      { label: 'No, unlikely to happen', emoji: '😔' },
    ],
  },
  {
    id: 'mamak-24-7',
    question: 'Should all mamak restaurants be 24/7?',
    description: 'Late night food culture preservation',
    category: 'culture',
    createdAt: new Date('2024-01-08'),
    options: [
      { label: 'Yes, keep them 24/7', emoji: '🌙' },
      { label: 'No, workers need rest', emoji: '😴' },
    ],
  },
  {
    id: 'sg-water-price',
    question: 'Should Malaysia increase water price to Singapore?',
    description: 'The long-standing water agreement controversy',
    category: 'politics',
    createdAt: new Date('2024-01-07'),
    endDate: new Date('2024-12-31'),
    options: [
      { label: 'Yes, increase the price', emoji: '💧' },
      { label: 'No, honor the agreement', emoji: '🤝' },
    ],
  },
  {
    id: 'chili-sauce-debate',
    question: 'Which is better: Sambal or Chili Sauce?',
    description: 'The condiment that defines your identity',
    category: 'food',
    createdAt: new Date('2024-01-06'),
    options: [
      { label: 'Sambal all the way', emoji: '🌶️' },
      { label: 'Chili sauce is superior', emoji: '🍅' },
    ],
  },
  {
    id: 'mrt-coverage',
    question: 'Should MRT lines reach all states by 2030?',
    description: 'Infrastructure expansion dreams',
    category: 'economy',
    createdAt: new Date('2024-01-05'),
    endDate: new Date('2025-06-30'),
    options: [
      { label: 'Yes, connect all states', emoji: '🚇' },
      { label: 'No, focus on major cities first', emoji: '🏙️' },
    ],
  },
  {
    id: 'teh-tarik-vs-kopi',
    question: 'Teh Tarik or Kopi O - which represents Malaysia better?',
    description: 'The beverage identity crisis',
    category: 'culture',
    createdAt: new Date('2024-01-04'),
    options: [
      { label: 'Teh Tarik', emoji: '🍵' },
      { label: 'Kopi O', emoji: '☕' },
    ],
  },
  {
    id: 'gst-return',
    question: 'Should GST (Goods and Services Tax) be reintroduced?',
    description: 'The taxation system debate',
    category: 'politics',
    createdAt: new Date('2024-01-03'),
    endDate: new Date('2024-12-31'),
    options: [
      { label: 'Yes, bring back GST', emoji: '💳' },
      { label: 'No, keep SST', emoji: '🚫' },
    ],
  },
  {
    id: 'weekend-friday',
    question: 'Should the weekend be Friday-Saturday nationwide?',
    description: 'Work-life balance and religious harmony',
    category: 'social',
    createdAt: new Date('2024-01-02'),
    options: [
      { label: 'Yes, align with Middle East', emoji: '🕌' },
      { label: 'No, keep Saturday-Sunday', emoji: '📅' },
    ],
  },
  {
    id: 'char-kuey-teow',
    question: 'Does Penang have the best Char Kuey Teow in Malaysia?',
    description: 'Regional food supremacy battle',
    category: 'food',
    createdAt: new Date('2024-01-01'),
    endDate: new Date('2024-08-31'),
    options: [
      { label: 'Yes, Penang is #1', emoji: '🏝️' },
      { label: 'No, other states are better', emoji: '🍜' },
    ],
  },
  {
    id: 'english-proficiency',
    question: 'Is declining English proficiency a national crisis?',
    description: 'Language skills and global competitiveness',
    category: 'social',
    createdAt: new Date('2023-12-31'),
    options: [
      { label: 'Yes, it\'s a crisis', emoji: '⚠️' },
      { label: 'No, it\'s exaggerated', emoji: '✅' },
    ],
  },
  {
    id: 'anwar-pm',
    question: 'Will Anwar Ibrahim serve a full term as PM?',
    description: 'Political stability predictions',
    category: 'politics',
    createdAt: new Date('2023-12-30'),
    endDate: new Date('2024-12-31'),
    options: [
      { label: 'Yes, full 5 years', emoji: '🗳️' },
      { label: 'No, coalition will collapse', emoji: '💥' },
    ],
  },
  {
    id: 'proton-future',
    question: 'Can Proton compete globally with EVs?',
    description: 'National automotive industry future',
    category: 'economy',
    createdAt: new Date('2023-12-29'),
    options: [
      { label: 'Yes, Proton can compete', emoji: '🚗' },
      { label: 'No, too far behind', emoji: '⚡' },
    ],
  },
  {
    id: 'malaysia-world-cup',
    question: 'Will Malaysia qualify for FIFA World Cup by 2050?',
    description: 'Football dreams and national pride',
    category: 'culture',
    createdAt: new Date('2023-12-28'),
    endDate: new Date('2024-12-31'),
    options: [
      { label: 'Yes, we can make it!', emoji: '⚽' },
      { label: 'No, unrealistic dream', emoji: '🎯' },
    ],
  },
  {
    id: 'cinema-seat-kicking',
    question: 'Is seat-kicking at cinemas Malaysia\'s #1 social problem?',
    description: 'The etiquette issue that unites all Malaysians',
    category: 'social',
    createdAt: new Date('2023-12-27'),
    options: [
      { label: 'Yes, it\'s a plague', emoji: '😤' },
      { label: 'No, there are bigger issues', emoji: '🤷' },
    ],
  },
];



