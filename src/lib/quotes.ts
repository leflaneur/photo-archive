// Curated quotes from classic public domain authors
// These are brief excerpts from works now in the public domain

export interface DailyQuote {
  text: string;
  author: string;
  work?: string;
}

const quotes: DailyQuote[] = [
  // Shakespeare (1564-1616)
  { text: "We are such stuff as dreams are made on.", author: "William Shakespeare", work: "The Tempest" },
  { text: "All the world's a stage, and all the men and women merely players.", author: "William Shakespeare", work: "As You Like It" },
  { text: "There is nothing either good or bad, but thinking makes it so.", author: "William Shakespeare", work: "Hamlet" },
  { text: "The fault, dear Brutus, is not in our stars, but in ourselves.", author: "William Shakespeare", work: "Julius Caesar" },
  { text: "To thine own self be true.", author: "William Shakespeare", work: "Hamlet" },
  { text: "What's past is prologue.", author: "William Shakespeare", work: "The Tempest" },
  
  // Charles Dickens (1812-1870)
  { text: "It was the best of times, it was the worst of times.", author: "Charles Dickens", work: "A Tale of Two Cities" },
  { text: "There is nothing in the world so irresistibly contagious as laughter and good humour.", author: "Charles Dickens", work: "A Christmas Carol" },
  { text: "Have a heart that never hardens, and a temper that never tires, and a touch that never hurts.", author: "Charles Dickens", work: "Our Mutual Friend" },
  { text: "Reflect upon your present blessings, of which every man has plenty.", author: "Charles Dickens" },
  
  // Edgar Allan Poe (1809-1849)
  { text: "All that we see or seem is but a dream within a dream.", author: "Edgar Allan Poe", work: "A Dream Within a Dream" },
  { text: "I became insane, with long intervals of horrible sanity.", author: "Edgar Allan Poe" },
  { text: "Deep into that darkness peering, long I stood there wondering, fearing.", author: "Edgar Allan Poe", work: "The Raven" },
  { text: "There is no exquisite beauty without some strangeness in the proportion.", author: "Edgar Allan Poe" },
  
  // Arthur Conan Doyle (1859-1930)
  { text: "When you have eliminated the impossible, whatever remains must be the truth.", author: "Arthur Conan Doyle", work: "The Sign of Four" },
  { text: "The world is full of obvious things which nobody by any chance ever observes.", author: "Arthur Conan Doyle", work: "The Hound of the Baskervilles" },
  { text: "There is nothing more deceptive than an obvious fact.", author: "Arthur Conan Doyle", work: "The Boscombe Valley Mystery" },
  { text: "It is a capital mistake to theorize before one has data.", author: "Arthur Conan Doyle", work: "A Scandal in Bohemia" },
  
  // Bram Stoker (1847-1912)
  { text: "We learn from failure, not from success.", author: "Bram Stoker", work: "Dracula" },
  { text: "There are darknesses in life and there are lights.", author: "Bram Stoker", work: "Dracula" },
  { text: "No man knows till he has suffered from the night how sweet and dear his heart and eye the morning can be.", author: "Bram Stoker", work: "Dracula" },
  
  // Alfred, Lord Tennyson (1809-1892)
  { text: "Tis better to have loved and lost than never to have loved at all.", author: "Alfred, Lord Tennyson", work: "In Memoriam A.H.H." },
  { text: "To strive, to seek, to find, and not to yield.", author: "Alfred, Lord Tennyson", work: "Ulysses" },
  { text: "Knowledge comes, but wisdom lingers.", author: "Alfred, Lord Tennyson", work: "Locksley Hall" },
  { text: "I am a part of all that I have met.", author: "Alfred, Lord Tennyson", work: "Ulysses" },
  
  // William Wordsworth (1770-1850)
  { text: "Fill your paper with the breathings of your heart.", author: "William Wordsworth" },
  { text: "The world is too much with us; late and soon, getting and spending, we lay waste our powers.", author: "William Wordsworth", work: "The World Is Too Much with Us" },
  { text: "Come forth into the light of things, let Nature be your teacher.", author: "William Wordsworth", work: "The Tables Turned" },
  { text: "With an eye made quiet by the power of harmony, and the deep power of joy, we see into the life of things.", author: "William Wordsworth", work: "Lines Composed a Few Miles above Tintern Abbey" },
  
  // T.S. Eliot (1888-1965) - Some early works are public domain
  { text: "Only those who will risk going too far can possibly find out how far one can go.", author: "T.S. Eliot" },
  { text: "For last year's words belong to last year's language. And next year's words await another voice.", author: "T.S. Eliot", work: "Four Quartets" },
];

/**
 * Gets a quote for the day based on the current date
 * The same quote will be shown throughout the day
 */
export const getDailyQuote = (): DailyQuote => {
  const today = new Date();
  // Use day of year as seed for consistent daily quote
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  const index = dayOfYear % quotes.length;
  return quotes[index];
};

/**
 * Gets a random quote (changes on each call)
 */
export const getRandomQuote = (): DailyQuote => {
  const index = Math.floor(Math.random() * quotes.length);
  return quotes[index];
};
