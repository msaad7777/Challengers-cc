// Email → Player display-name map. Some players have both their
// @challengerscc.ca workspace email and a personal Gmail mapped to the
// same display name so login from either address resolves correctly.
//
// This is the single source of truth for the email↔name lookup. Both
// the Dugout (availability page) and the Field Editor (access guard +
// audit-trail display) read from here.
export const EMAIL_TO_PLAYER: Record<string, string> = {
  'contact@challengerscc.ca': 'Mohammed Saad',
  'saad@challengerscc.ca': 'Mohammed Saad',
  'mbadru3434@gmail.com': 'Mohammed Saad',
  'tarek@challengerscc.ca': 'Tarek Islam',
  'monirulislambd64@gmail.com': 'Tarek Islam',
  'gokul@challengerscc.ca': 'Gokul Prakash',
  'gokulprakash663@gmail.com': 'Gokul Prakash',
  'madhu@challengerscc.ca': 'Madhu Reddy',
  'vantarimadhu@gmail.com': 'Madhu Reddy',
  'ankush@challengerscc.ca': 'Ankush Arora',
  '92ankusharora@gmail.com': 'Ankush Arora',
  'roman@challengerscc.ca': 'Roman Mahmud',
  'romans987@gmail.com': 'Roman Mahmud',
  'shariar@challengerscc.ca': 'Syed Shahriar',
  'syedshahriar77@gmail.com': 'Syed Shahriar',
  'denisondavis9@gmail.com': 'Denison Davis',
  'judinthomas96@gmail.com': 'Judin Thomas',
  'abhishekladva09@gmail.com': 'Abhishek Ladva',
  'ashvak.realtor07@gmail.com': 'Ashvak Sheik',
  'bhindadhesi18@gmail.com': 'Bhupinder Singh',
  'sallu.ahmed8@gmail.com': 'Salman Ahmed',
  'saiakhira@gmail.com': 'Saikrishna Goriparthi',
  'farooqchoudhary123@gmail.com': 'Farooq Choudhary',
  'vijayvyadav1998@gmail.com': 'Vijay Yadav',
  'rajputshivam9558@gmail.com': 'Shivam Rajput',
  'shabyansari0023@gmail.com': 'Shoeb Ahmad',
  'manoharanukuri9@gmail.com': 'Manohar Anukuri',
  'mohayminul13@gmail.com': 'Mohayminul',
  'fahadakbar@gmail.com': 'Fahad Aktar',
  'andrewjebarson18@gmail.com': 'Andrew Jebarson',
  'tgururaga@gmail.com': 'Guru Raga',
  '108.noman@gmail.com': 'Noman',
  'shafiul078.aust@gmail.com': 'Shafiul',
  'sujelahmed06@gmail.com': 'Sujel Ahmed',
  'atik1991rah@gmail.com': 'Atik Rahman',
  'majharulalam456@gmail.com': 'Majharul Alam',
  'georgefreddy963@gmail.com': 'Fahad Aktar',
  'siva4593@gmail.com': 'Siva Sriram',
  'rajath.s.shetty@gmail.com': 'Rajath Shetty',
  'maaleemq@gmail.com': 'Aleem Quadri',
  'thoufeeqmuhammed99@gmail.com': 'Thoufeeq Muhammed',
  'ameeyasingh1@gmail.com': 'Ameeya Singh',
};

// Resolve a Google-login email to the player's display name. Returns null
// if the email isn't in the roster (e.g., a brand-new player that hasn't
// been added yet, or a board email that isn't also a player).
export function resolvePlayerName(email: string | null | undefined): string | null {
  if (!email) return null;
  const lower = email.toLowerCase();
  return EMAIL_TO_PLAYER[lower] ?? null;
}
