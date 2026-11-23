import type { GameId } from './types.ts';

export interface GameCatalogItem {
  id: GameId;
  title: string;
  description: string;
  accent: 'rose' | 'lavender' | 'peach';
  iconName:
    | 'flame'
    | 'grid'
    | 'compass'
    | 'heart-handshake'
    | 'sparkles'
    | 'layers'
    | 'message-circle-heart'
    | 'scale'
    | 'spell-check'
    | 'trophy';
}

export const GAME_CATALOG: GameCatalogItem[] = [
  {
    id: 'truth-or-dare',
    title: 'Truth or Dare',
    description: 'Sweet confessions, playful secrets, and harmless romantic dares.',
    accent: 'rose',
    iconName: 'flame',
  },
  {
    id: 'tic-tac-toe',
    title: 'Tic-Tac-Toe',
    description: 'Classic pastel X & O rounds for two hearts taking turns.',
    accent: 'lavender',
    iconName: 'grid',
  },
  {
    id: 'spin-the-wheel',
    title: 'Spin the Wheel',
    description: 'Give the dreamy wheel a whirl for sweet surprises and prompts.',
    accent: 'peach',
    iconName: 'compass',
  },
  {
    id: 'know-me',
    title: 'How Well Do You Know Me?',
    description: 'Answer from the heart and see how closely your partner guesses.',
    accent: 'rose',
    iconName: 'heart-handshake',
  },
  {
    id: 'love-quiz',
    title: 'Our Love Quiz',
    description: 'Vote on cute couple superlatives and reveal both answers together.',
    accent: 'lavender',
    iconName: 'sparkles',
  },
  {
    id: 'memory-match',
    title: 'Memory Match',
    description: 'Flip cozy pastel cards together and collect matching pairs.',
    accent: 'peach',
    iconName: 'layers',
  },
  {
    id: 'never-have-i-ever',
    title: 'Never Have I Ever',
    description: 'Playful stories, little confessions, and warm laughs.',
    accent: 'rose',
    iconName: 'message-circle-heart',
  },
  {
    id: 'would-you-rather',
    title: 'Would You Rather?',
    description: 'Pick between two cozy choices and discover if your hearts match.',
    accent: 'lavender',
    iconName: 'scale',
  },
  {
    id: 'guess-the-word',
    title: 'Guess the Word',
    description: 'Pick a secret cozy word and guide your partner with clues.',
    accent: 'peach',
    iconName: 'spell-check',
  },
  {
    id: 'couple-challenge',
    title: 'Couple Challenge',
    description: 'Spontaneous mini-moments to brighten your day together.',
    accent: 'rose',
    iconName: 'trophy',
  },
];

export const NICKNAME_SUGGESTIONS = ['My Love', 'Sunshine', 'Baby', 'Moon', 'Sweetheart'];

export const QUICK_REACTIONS = ['❤️', '🥰', '😘', '😂', '🫶', '🥺'];

export interface TruthOrDarePrompt {
  id: string;
  type: 'truth' | 'dare';
  category: string;
  text: string;
}

export const TRUTH_PROMPTS: TruthOrDarePrompt[] = [
  { id: 't1', type: 'truth', category: 'Romantic', text: 'What was the exact moment you realized you liked me?' },
  { id: 't2', type: 'truth', category: 'Cute', text: 'What tiny habit of mine always makes you smile?' },
  { id: 't3', type: 'truth', category: 'Deep', text: 'When do you feel most loved and safe around me?' },
  { id: 't4', type: 'truth', category: 'Funny', text: 'What is the silliest thought you have ever had while texting me?' },
  { id: 't5', type: 'truth', category: 'Romantic', text: 'If we could teleport anywhere together tonight, where would we go?' },
  { id: 't6', type: 'truth', category: 'Personal', text: 'What is a quiet dream you want us to chase together one day?' },
  { id: 't7', type: 'truth', category: 'Cute', text: 'Which memory of us plays in your head like a favorite movie scene?' },
  { id: 't8', type: 'truth', category: 'Funny', text: 'What was your honest first impression of me before we got close?' },
  { id: 't9', type: 'truth', category: 'Romantic', text: 'What song immediately makes you think of me?' },
  { id: 't10', type: 'truth', category: 'Deep', text: 'What is one thing I do that makes a rough day instantly softer?' },
  { id: 't11', type: 'truth', category: 'Cute', text: 'What nickname do you secretly love hearing from me?' },
  { id: 't12', type: 'truth', category: 'Personal', text: 'What is a cozy Sunday ritual you wish we could do every week?' },
  { id: 't13', type: 'truth', category: 'Funny', text: 'Have you ever reread our old messages just to smile?' },
  { id: 't14', type: 'truth', category: 'Romantic', text: 'What is your favorite detail about my face or voice?' },
  { id: 't15', type: 'truth', category: 'Deep', text: 'What is something you have learned about yourself through loving me?' },
  { id: 't16', type: 'truth', category: 'Cute', text: 'If you could freeze one ordinary afternoon with me, which one is it?' },
  { id: 't17', type: 'truth', category: 'Personal', text: 'What little surprise from me would make your whole week?' },
  { id: 't18', type: 'truth', category: 'Romantic', text: 'How do you picture us celebrating a cozy anniversary years from now?' },
  { id: 't19', type: 'truth', category: 'Funny', text: 'Who takes longer to get ready, and who waits patiently?' },
  { id: 't20', type: 'truth', category: 'Deep', text: 'What compliment from me has stayed in your heart the longest?' },
  { id: 't21', type: 'truth', category: 'Cute', text: 'What emoji feels most like us?' },
  { id: 't22', type: 'truth', category: 'Romantic', text: 'What is the sweetest goodnight message you could ever receive?' },
];

export const DARE_PROMPTS: TruthOrDarePrompt[] = [
  { id: 'd1', type: 'dare', category: 'Romantic', text: 'Send me a three-sentence love note right now—no overthinking!' },
  { id: 'd2', type: 'dare', category: 'Cute', text: 'Give me a brand-new sweet nickname and use it for the next two rounds.' },
  { id: 'd3', type: 'dare', category: 'Funny', text: 'Make up a 10-second dramatic movie trailer voice describing how we met.' },
  { id: 'd4', type: 'dare', category: 'Romantic', text: 'Tell me three specific things you adore about me without pausing.' },
  { id: 'd5', type: 'dare', category: 'Creative', text: 'Invent our dream cozy date night in three emojis and explain it.' },
  { id: 'd6', type: 'dare', category: 'Cute', text: 'Send a virtual hug and say the sweetest thing you can think of.' },
  { id: 'd7', type: 'dare', category: 'Funny', text: 'Confess a harmless silly habit you usually hide when we hang out.' },
  { id: 'd8', type: 'dare', category: 'Romantic', text: 'Describe my smile as if you were writing poetry.' },
  { id: 'd9', type: 'dare', category: 'Creative', text: 'Pick a song for our imaginary road trip and explain the vibe.' },
  { id: 'd10', type: 'dare', category: 'Cute', text: 'Blow a kiss or tap the Love button five times in a row!' },
  { id: 'd11', type: 'dare', category: 'Funny', text: 'Speak in your best radio host voice for the next 30 seconds.' },
  { id: 'd12', type: 'dare', category: 'Romantic', text: 'Promise one tiny sweet thing we will do the very next time we meet.' },
  { id: 'd13', type: 'dare', category: 'Creative', text: 'Come up with the title of a book written about the two of us.' },
  { id: 'd14', type: 'dare', category: 'Cute', text: 'Tell me what color reminds you of me and why.' },
  { id: 'd15', type: 'dare', category: 'Harmless', text: 'Close your eyes for five seconds and share the first happy memory of us that pops up.' },
  { id: 'd16', type: 'dare', category: 'Romantic', text: 'Tell me why today is better simply because we are talking.' },
  { id: 'd17', type: 'dare', category: 'Funny', text: 'Rate my sense of humor from 1 to 10—and defend your rating!' },
  { id: 'd18', type: 'dare', category: 'Cute', text: 'Describe what kind of cozy blanket fort we would build together.' },
];

export const WHEEL_SEGMENTS: { label: string; color: string; textColor: string; prompt: string }[] = [
  { label: 'Tell me something sweet', color: '#F9C6D7', textColor: '#4A2334', prompt: 'Share one sweet thought you have been holding onto today.' },
  { label: 'Give me a compliment', color: '#E4D7F5', textColor: '#372452', prompt: 'Tell your partner something you genuinely admire about them.' },
  { label: 'Choose our next game', color: '#FDE0CE', textColor: '#4D2B1F', prompt: 'You hold the crown! Pick whichever game we play next.' },
  { label: 'Truth', color: '#F4A9C2', textColor: '#4A1F2E', prompt: 'Answer an honest question from your partner!' },
  { label: 'Dare', color: '#D7C4F0', textColor: '#372452', prompt: 'Accept a cute, harmless romantic dare from your partner!' },
  { label: 'Tell me a funny memory', color: '#FAD5C0', textColor: '#4D2B1F', prompt: 'Recall a moment with us that still makes you burst out laughing.' },
  { label: 'Send a virtual hug', color: '#FBD4E2', textColor: '#4A2334', prompt: 'Tap the Virtual Hug button and wrap your partner in warmth!' },
  { label: 'Pick a surprise', color: '#EAE0FA', textColor: '#372452', prompt: 'Plan a tiny treat, playlist, or coffee surprise for next time.' },
  { label: 'Say something romantic', color: '#F7B9CE', textColor: '#4A1F2E', prompt: 'Say something straight from the heart—make your partner blush.' },
  { label: 'Your choice', color: '#FDE7D9', textColor: '#4D2B1F', prompt: 'Anything goes: ask a question, give a kiss, or start a new game!' },
];

export const KNOW_ME_QUESTIONS: string[] = [
  'What is my absolute favorite comfort food?',
  'What little thing instantly makes me happy?',
  'What is my dream travel destination with you?',
  'What is my favorite color?',
  'What movie or show could I rewatch forever?',
  'What do I usually do when I am feeling sad or tired?',
  'What does my ideal dream date look like?',
  'What is something small that I genuinely love?',
  'What is my go-to drink or coffee/tea order?',
  'What kind of weather puts me in the best mood?',
  'What is a hobby or pastime I never get bored of?',
  'What song or artist always lifts my mood?',
];

export const LOVE_QUIZ_QUESTIONS: string[] = [
  'Who said "I love you" (or showed feelings) first?',
  'Who is secretly more romantic?',
  'Who replies to messages faster?',
  'Who is more likely to fall asleep during a movie night?',
  'Who gets playfully jealous a little faster?',
  'Who would plan a surprise weekend date?',
  'Who is more likely to laugh at a terribly silly joke?',
  'Who steals the blankets (or would steal them) first?',
  'Who takes way more cute photos of the other?',
  'Who gets hangry faster when dinner is late?',
  'Who initiates hugs and cuddles more often?',
  'Who stays up later texting at night?',
];

export const MEMORY_SYMBOLS: { symbol: string; label: string }[] = [
  { symbol: '💖', label: 'Heart' },
  { symbol: '⭐', label: 'Star' },
  { symbol: '🌸', label: 'Flower' },
  { symbol: '🌙', label: 'Moon' },
  { symbol: '🧸', label: 'Teddy' },
  { symbol: '🧁', label: 'Cupcake' },
];

export const NEVER_HAVE_I_EVER_PROMPTS: string[] = [
  'Never have I ever smiled at my phone just seeing your name pop up.',
  'Never have I ever practiced what I wanted to say to you in advance.',
  'Never have I ever stayed up way too late just to keep talking to you.',
  'Never have I ever saved a silly photo or screenshot because it made me miss you.',
  'Never have I ever listened to a song on repeat because it reminded me of us.',
  'Never have I ever gotten butterflies before seeing you even after knowing you awhile.',
  'Never have I ever pretended to be totally chill when I was actually super excited.',
  'Never have I ever daydreamed about our future home or trips together.',
  'Never have I ever re-read a sweet message from you more than five times.',
  'Never have I ever worn something special just hoping you would notice.',
  'Never have I ever ordered food just because I knew it was your favorite.',
  'Never have I ever fallen asleep mid-call or mid-text with you.',
];

export const WOULD_YOU_RATHER_PROMPTS: { a: string; b: string }[] = [
  { a: 'Cozy beach sunset date', b: 'Blanket-fort movie night' },
  { a: 'Warm five-minute hug', b: 'Surprise forehead kiss' },
  { a: 'Watch the sunrise together', b: 'Stargaze at midnight' },
  { a: 'Stay home cooking together', b: 'Go on a spontaneous road trip' },
  { a: 'A secret surprise date', b: 'Planning our dream date together' },
  { a: 'Three-hour late-night call', b: 'Handwritten love letter' },
  { a: 'Slow dancing in the kitchen', b: 'Walking in warm evening rain' },
  { a: 'Matching cozy hoodies', b: 'Matching cute mugs' },
  { a: 'Breakfast in bed', b: 'Midnight ice cream run' },
  { a: 'A rainy cabin weekend', b: 'A sunny coastal getaway' },
];

export const WORD_CATEGORIES: { category: string; words: { word: string; defaultHint: string }[] }[] = [
  {
    category: 'Love & Romance',
    words: [
      { word: 'MOONLIGHT', defaultHint: 'Soft silver glow during a late-night walk' },
      { word: 'SWEETHEART', defaultHint: 'A classic affectionate pet name' },
      { word: 'CUDDLE', defaultHint: 'Getting warm and close under a blanket' },
      { word: 'STARGAZING', defaultHint: 'Looking up at the night sky together' },
      { word: 'BUTTERFLIES', defaultHint: 'That fluttery feeling in your stomach' },
      { word: 'FOREVER', defaultHint: 'How long two hearts want to stay close' },
    ],
  },
  {
    category: 'Cozy Night In',
    words: [
      { word: 'BLANKET', defaultHint: 'Soft and warm to share on the couch' },
      { word: 'POPCORN', defaultHint: 'Crunchy snack for movie night' },
      { word: 'CANDLELIGHT', defaultHint: 'Warm flickering glow in a cozy room' },
      { word: 'PILLOWS', defaultHint: 'Essential building blocks for a couch fort' },
      { word: 'HOTCOCOA', defaultHint: 'Sweet warm mug topped with marshmallows' },
      { word: 'PLAYLIST', defaultHint: 'A curated mix of your favorite songs' },
    ],
  },
  {
    category: 'Sweet Treats',
    words: [
      { word: 'CUPCAKE', defaultHint: 'A tiny frosted birthday-style dessert' },
      { word: 'STRAWBERRY', defaultHint: 'Sweet red berry often dipped in chocolate' },
      { word: 'PANCAKES', defaultHint: 'Fluffy weekend breakfast stack' },
      { word: 'CROISSANT', defaultHint: 'Flaky golden French pastry' },
      { word: 'MILKSHAKE', defaultHint: 'Cold creamy treat with two straws' },
      { word: 'CINNAMON', defaultHint: 'Warm cozy spice in autumn rolls' },
    ],
  },
];

export const COUPLE_CHALLENGES: string[] = [
  'Say three things you genuinely love about your partner right now.',
  'Describe your partner using exactly three warm words.',
  'Tell your favorite funny memory of the two of you together.',
  'Invent a cute, secret nickname for each other for tonight.',
  'Plan your dream weekend date together in 60 seconds.',
  'Choose one song that captures how your partner makes you feel.',
  'Share one little habit of your partner that you secretly adore.',
  'Make up a two-line poem dedicated to your partner.',
  'Pick three emojis that tell the story of your relationship.',
  'Tell your partner what you appreciate most about them this week.',
];
