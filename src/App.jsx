import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Download, FileText, Moon, Sun, Star, Compass, BookOpen, Heart, Shield, User, Users, Flag, Upload, X, Zap, Award, Book, Info, Save, Loader2 } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

// --- FIREBASE INITIALIZATION ---
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
// SANITIZE appId to ensure slashes from the environment don't break Firestore path segment counting
const rawAppId = typeof __app_id !== 'undefined' ? __app_id : 'dhulfiqar-ramadan-flyer';
const appId = String(rawAppId).replace(/\//g, '_');

/* ════════════════════════════════════════════════════════════
   30-DAY SCOUTING MAHDAWĪ CONTENT
   Sources: Al-Kafi, Bihar al-Anwar, Sahifa Sajjadiya, 
   Nahj al-Balagha, Mizan al-Hikmah.
════════════════════════════════════════════════════════════ */
const DAYS_DATA = [
  { day: 1, theme: "Niyyah", themeAr: "نِيَّة", title: "Pure Intentions", color: "#FF6B6B",
    verseAr: "وَمَا أُمِرُوا إِلَّا لِيَعْبُدُوا اللَّهَ مُخْلِصِينَ لَهُ الدِّينَ", verseEn: "\"And they were not commanded except to worship Allah, being sincere to Him in religion...\"", verseRef: "Surah Al-Bayyinah 98:5",
    salat: "Focus on the Niyyah of your Wudu today. Realize that spiritual purity starts with the intention to wash away the ego before standing before Allah.", salatSource: "Al-Kafi, Vol. 3",
    sawmHadis: "Imam al-Sadiq (a): 'If the intention is pure, the action is accepted, even if it is small.' Fasting begins in the heart.", sawmSource: "Bihar al-Anwar, Vol. 67",
    sadaqahHadis: "The Prophet (s): 'The best Sadaqah is that which is given with a sincere heart, seeking only the pleasure of Allah.'", sadaqahSource: "Mizan al-Hikmah",
    scoutRelate: "A Scout is Reverent. Sincerity (Ikhlas) is the foundation of the Scout Oath. By purifying your Niyyah, you prepare your soul to be a sincere soldier of Imam al-Mahdi (aj).",
    dailyDuaAr: "اَللّهُمَّ اجْعَلْ نِيَّتي خَيْرَ النِّيّاتِ", dailyDuaEn: "O Allah, make my intention the best of intentions.", dailyDuaSource: "Sahifa Sajjadiya, Dua 20" },
  { day: 2, theme: "Taqwa", themeAr: "تَقْوى", title: "God-Consciousness", color: "#4D96FF",
    verseAr: "يَا أَيُّهَا الَّذِينَ آمَنُوا كُتِبَ عَلَيْكُمُ الصِّيَامُ لَعَلَّكُمْ تَتَّقُونَ", verseEn: "\"O you who have believed, decreed upon you is fasting... that you may become righteousness (Taqwa).\"", verseRef: "Surah Al-Baqarah 2:183",
    salat: "Practice 'Hudhur al-Qalb' (presence of heart) in your Sajdah. Imagine you are whispering your secrets directly to your Creator.", salatSource: "Misbah al-Shariah",
    sawmHadis: "Imam Ali (a): 'Fasting is a shield against the fire.' Taqwa is the internal guard that keeps your soul safe from mistakes.", sawmSource: "Wasail al-Shia, Vol. 7",
    sadaqahHadis: "Imam al-Baqir (a): 'Sadaqah on the day of Jumu'ah is multiplied.' Let your Taqwa drive you to give even when it is difficult.", sadaqahSource: "Thawab al-A'mal",
    scoutRelate: "A Scout is Trustworthy. Taqwa means being honest when no one is looking. A Mahdawī Scout disciplines himself through Sawm to be ready for the Imam's (aj) call.",
    dailyDuaAr: "اَللّهُمَّ ارْزُقْني تَقْواكَ في كُلِّ حالٍ", dailyDuaEn: "O Allah, grant me Taqwa of You in every state.", dailyDuaSource: "Mafatih al-Jinan" },
  { day: 3, theme: "Shukr", themeAr: "شُكْر", title: "Gratitude", color: "#6BCB77",
    verseAr: "لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ", verseEn: "\"If you are grateful, I will surely increase you [in favor]...\"", verseRef: "Surah Ibrahim 14:7",
    salat: "After your prayers, recite 'Shukran lillah' 3 times in Sajdah. Reflect on the blessing of being able to worship during this month.", salatSource: "Mafatih al-Jinan",
    sawmHadis: "Imam al-Hassan (a): 'The person who is grateful for a blessing is more blessed than the one who received the blessing itself.'", sawmSource: "Tuhaf al-Uqul",
    sadaqahHadis: "The Prophet (s): 'Give Sadaqah as a way to thank Allah for your health and safety.'", sadaqahSource: "Kanz al-Ummal",
    scoutRelate: "A Scout is Cheerful. Gratitude (Shukr) brings joy to the Troop. We thank Allah for the Wilayah of the Ahlulbayt (a), which is the greatest map and compass for a Scout.",
    dailyDuaAr: "اَللّهُمَّ اجْعَلْني لَكَ مِنَ الشّاكِرينَ", dailyDuaEn: "O Allah, make me among those who are grateful to You.", dailyDuaSource: "Sahifa Sajjadiya, Dua 37" },
  { day: 4, theme: "Sabr", themeAr: "صَبْر", title: "Patience", color: "#FFD93D",
    verseAr: "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ", verseEn: "\"Indeed, Allah is with the patient.\"", verseRef: "Surah Al-Baqarah 2:153",
    salat: "Take your time in Ruku. Do not rush the glorification of Allah. Patience in prayer leads to peace in life.", salatSource: "Al-Kafi, Vol. 3",
    sawmHadis: "Imam al-Sadiq (a): 'Fasting is the patience mentioned in the Qur'an.' It trains the body to endure hardship for a higher goal.", sawmSource: "Tafsir al-Ayyashi",
    sadaqahHadis: "Imam Ali (a): 'Giving Sadaqah with patience and a smile is a higher form of worship than the charity itself.'", sadaqahSource: "Ghurar al-Hikam",
    scoutRelate: "A Scout is Brave. It takes Sabr to learn difficult outdoor skills. We practice Sabr in our fast to prepare for the Sabr required for the Intidhar (waiting) of our Imam (aj).",
    dailyDuaAr: "اَللّهُمَّ صَبِّرْني عَلى طاعَتِكَ", dailyDuaEn: "O Allah, grant me patience in Your obedience.", dailyDuaSource: "Dua Abu Hamza al-Thumali" },
  { day: 5, theme: "Sidq", themeAr: "صِدْق", title: "Truthfulness", color: "#9575CD",
    verseAr: "يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللَّهَ وَكُونُوا مَعَ الصَّادِقِينَ", verseEn: "\"O you who have believed, fear Allah and be with those who are true.\"", verseRef: "Surah At-Tawbah 9:119",
    salat: "Be truthful in your Duʿā during Qunut. Ask Allah for what you truly need and be sincere in your repentance.", salatSource: "Uddat al-Da'i",
    sawmHadis: "Imam al-Sadiq (a): 'The truthfulness of a person is known by their adherence to their fast and their word.'", sawmSource: "Bihar al-Anwar, Vol. 68",
    sadaqahHadis: "Imam Ali (a): 'Truthfulness is the most effective Sadaqah you can give to your community.'", sadaqahSource: "Nahj al-Balagha",
    scoutRelate: "A Scout is Trustworthy. Sidq is the core of a Scout's honor. To be a true companion of Imam al-Mahdi (aj), our words must always match our actions.",
    dailyDuaAr: "اَللّهُمَّ اجْعَل لِساني صادِقاً", dailyDuaEn: "O Allah, make my tongue truthful.", dailyDuaSource: "Sahifa Sajjadiya, Dua 20" },
  { day: 6, theme: "Tawba", themeAr: "تَوْبَة", title: "Repentance", color: "#4DB6AC",
    verseAr: "إِنَّ اللَّهَ يُحِبُّ التَّوَّابِينَ وَيُحِبُّ الْمُتَطَهِّرِينَ", verseEn: "\"Indeed, Allah loves those who are constantly repentant and loves those who purify themselves.\"", verseRef: "Surah Al-Baqarah 2:222",
    salat: "Prolong your final Sajdah and ask for forgiveness. The closest a servant is to Allah is in prostration.", salatSource: "Al-Kafi, Vol. 3",
    sawmHadis: "The Prophet (s): 'The month of Ramadan is the month of repentance. Whoever is not forgiven in it, when will they be forgiven?'", sawmSource: "Amali al-Saduq",
    sadaqahHadis: "Imam al-Baqir (a): 'Sadaqah extinguishes the wrath of the Lord and washes away sins.'", sadaqahSource: "Al-Kafi, Vol. 4",
    scoutRelate: "A Scout is Clean. Tawba is the ultimate cleanliness of the soul. We must constantly refine ourselves to be worthy of the Imam's (aj) army.",
    dailyDuaAr: "اَللّهُمَّ اغْفِرْ لي ذُنوبي كُلَّها", dailyDuaEn: "O Allah, forgive all of my sins.", dailyDuaSource: "Dua Kumayl" },
  { day: 7, theme: "Rahma", themeAr: "رَحْمَة", title: "Mercy", color: "#F06292",
    verseAr: "وَمَا أَرْسَلْنَاكَ إِلَّا رَحْمَةً لِّلْعَالَمِينَ", verseEn: "\"And We have not sent you, [O Muhammad], except as a mercy to the worlds.\"", verseRef: "Surah Al-Anbiya 21:107",
    salat: "When reciting 'Ar-Rahman Ar-Rahim', reflect on how Allah's mercy encompasses all things, including your shortcomings.", salatSource: "Tafsir al-Mizan",
    sawmHadis: "Imam Ali (a): 'Fasting evokes mercy in the hearts of the rich for the poor.'", sawmSource: "Ghurar al-Hikam",
    sadaqahHadis: "Imam al-Sadiq (a): 'Show mercy to those on earth, and the One in the heavens will show mercy to you.'", sadaqahSource: "Man La Yahduruhu al-Faqih",
    scoutRelate: "A Scout is Kind. Mercy (Rahma) should dictate how we treat our Patrol members. The Imam of our time is the manifestation of Allah's mercy on earth.",
    dailyDuaAr: "اَللّهُمَّ ارْزُقْني رَحْمَتَكَ الواسِعَةِ", dailyDuaEn: "O Allah, have mercy on me with Your vast mercy.", dailyDuaSource: "Dua Kumayl" },
  { day: 8, theme: "Adl", themeAr: "عَدْل", title: "Justice", color: "#BA68C8",
    verseAr: "إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ", verseEn: "\"Indeed, Allah orders justice and good conduct...\"", verseRef: "Surah An-Nahl 16:90",
    salat: "Ensure your physical posture is perfectly balanced in Qiyam. Physical justice in prayer reflects internal equilibrium.", salatSource: "Sirr al-Salat",
    sawmHadis: "Imam al-Sadiq (a): 'Fasting levels the playing field between the rich and the poor, bringing justice to the community.'", sawmSource: "Man La Yahduruhu al-Faqih",
    sadaqahHadis: "Imam Ali (a): 'Justice is placing things in their rightful place; Sadaqah restores balance to society.'", sadaqahSource: "Nahj al-Balagha",
    scoutRelate: "A Scout is Obedient to principles of fairness. We strive for Adl in our games and duties, preparing for the Mahdi (aj) who will fill the earth with justice.",
    dailyDuaAr: "اَللّهُمَّ اجْعَلْني مِن أَهْلِ العَدْلِ", dailyDuaEn: "O Allah, make me among the people of justice.", dailyDuaSource: "Sahifa Sajjadiya" },
  { day: 9, theme: "Ihsan", themeAr: "إِحْسَان", title: "Excellence", color: "#4FC3F7",
    verseAr: "هَلْ جَزَاءُ الْإِحْسَانِ إِلَّا الْإِحْسَانُ", verseEn: "\"Is the reward for good [anything] but good?\"", verseRef: "Surah Ar-Rahman 55:60",
    salat: "Perform your Wudu with Ihsan—take care with every drop of water. Excellence in preparation leads to excellence in prayer.", salatSource: "Falah al-Sail",
    sawmHadis: "The Prophet (s): 'Ihsan is to worship Allah as if you see Him. Fasting is a secret worship seen only by Him.'", sawmSource: "Nahj al-Fasahah",
    sadaqahHadis: "Imam al-Sadiq (a): 'When you give Sadaqah, do it secretly and respectfully. That is the essence of Ihsan.'", sadaqahSource: "Al-Kafi, Vol. 4",
    scoutRelate: "A Scout is Helpful. Going above and beyond in our Good Turns is Ihsan. We must offer our best efforts to the service of Imam al-Mahdi (aj).",
    dailyDuaAr: "اَللّهُمَّ وَفِّقْني لِلْإِحْسانِ", dailyDuaEn: "O Allah, grant me success in doing good.", dailyDuaSource: "Sahifa Sajjadiya, Dua 20" },
  { day: 10, theme: "Tafakkur", themeAr: "تَفَكُّر", title: "Reflection", color: "#F59E0B",
    verseAr: "وَيَتَفَكَّرُونَ فِي خَلْقِ السَّمَاوَاتِ وَالْأَرْضِ", verseEn: "\"...and give thought to the creation of the heavens and the earth...\"", verseRef: "Surah Ali 'Imran 3:191",
    salat: "Ponder on the meaning of 'Subhana Rabbiyal A'la' in prostration. Tafakkur is the lifeblood of true worship.", salatSource: "Al-Kafi, Vol. 2",
    sawmHadis: "Imam al-Rida (a): 'An hour of reflection is better than a year of empty worship. Hunger aids reflection.'", sawmSource: "Fiqh al-Rida",
    sadaqahHadis: "Imam Ali (a): 'Reflect on what you give; giving what is truly needed is the best charity.'", sadaqahSource: "Ghurar al-Hikam",
    scoutRelate: "A Scout is Thrifty. We reflect on our resources to avoid waste. True scouts read the signs of Allah in nature to know Him better.",
    dailyDuaAr: "اَللّهُمَّ ارْزُقْني التَّفَكُّرَ في خَلْقِكَ", dailyDuaEn: "O Allah, grant me reflection upon Your creation.", dailyDuaSource: "Dua Makarim al-Akhlaq" },
  { day: 11, theme: "Dua", themeAr: "دُعَاء", title: "Supplication", color: "#06B6D4",
    verseAr: "وَقَالَ رَبُّكُمُ ادْعُونِي أَسْتَجِبْ لَكُمْ", verseEn: "\"And your Lord says, 'Call upon Me; I will respond to you.'\"", verseRef: "Surah Ghafir 40:60",
    salat: "Raise your hands high in Qunut. Duʿā is the weapon of the believer and the core of the Salat.", salatSource: "Uddat al-Da'i",
    sawmHadis: "Imam al-Kazim (a): 'The Duʿā of a fasting person at the time of Iftar is never rejected.'", sawmSource: "Bihar al-Anwar",
    sadaqahHadis: "Imam al-Sadiq (a): 'Give Sadaqah and then make Duʿā, for charity opens the gates of heaven.'", sadaqahSource: "Al-Kafi",
    scoutRelate: "A Scout is Reverent. We rely on Duʿā for guidance in our troop activities. Praying for the reappearance (Faraj) of the Imam is our greatest duty.",
    dailyDuaAr: "اَللّهُمَّ عَجِّلْ لِوَلِيِّكَ الفَرَجَ", dailyDuaEn: "O Allah, hasten the reappearance of Your Wali.", dailyDuaSource: "Dua al-Faraj" },
  { day: 12, theme: "Silat al-Rahim", themeAr: "صِلَة الرَّحِم", title: "Kinship", color: "#E11D48",
    verseAr: "وَاتَّقُوا اللَّهَ الَّذِي تَسَاءَلُونَ بِهِ وَالْأَرْحَامَ", verseEn: "\"...And fear Allah, through whom you ask one another, and the wombs [family ties].\"", verseRef: "Surah An-Nisa 4:1",
    salat: "Include your parents and relatives in your Qunut. Praying for others before yourself guarantees your prayer is answered.", salatSource: "Al-Kafi",
    sawmHadis: "Imam al-Baqir (a): 'Fasting is not complete if one is cutting off family ties.'", sawmSource: "Thawab al-A'mal",
    sadaqahHadis: "The Prophet (s): 'Sadaqah to a relative is two charities: one is charity, and the other is maintaining kinship.'", sadaqahSource: "Nahj al-Fasahah",
    scoutRelate: "A Scout is Loyal. Loyalty starts at home with our families. A strong family structure is the building block of the Imam's (aj) society.",
    dailyDuaAr: "اَللّهُمَّ اغْفِرْ لي وَلِوالِدَيَّ", dailyDuaEn: "O Allah, forgive me and my parents.", dailyDuaSource: "Quran 71:28" },
  { day: 13, theme: "Haya", themeAr: "حَيَاء", title: "Modesty", color: "#8B5CF6",
    verseAr: "وَاللَّه يَعْلَمُ مَا تُسِرُّونَ وَمَا تُعْلِنُونَ", verseEn: "\"And Allah knows what you conceal and what you declare.\"", verseRef: "Surah An-Nahl 16:90",
    salat: "Lower your gaze during Salat. Haya before Allah means realizing His constant gaze upon your heart.", salatSource: "Sirr al-Salat",
    sawmHadis: "Imam Ali (a): 'The fast of the heart from bad thoughts is better than the fast of the stomach.' This is internal Haya.", sawmSource: "Ghurar al-Hikam",
    sadaqahHadis: "Imam Zain al-Abidin (a): 'When giving, lower your eyes so you do not see the humility in the receiver's face.'", sadaqahSource: "Sahifa Sajjadiya",
    scoutRelate: "A Scout is Clean. This includes cleanliness of speech and thought (Haya). We protect our dignity to be presentable soldiers for the Mahdi (aj).",
    dailyDuaAr: "اَللّهُمَّ ارْزُقْني الحَياءَ مِنْكَ", dailyDuaEn: "O Allah, grant me modesty before You.", dailyDuaSource: "Dua Makarim al-Akhlaq" },
  { day: 14, theme: "Hilm", themeAr: "حِلْم", title: "Forbearance", color: "#10B981",
    verseAr: "وَالْكَاظِمِينَ الْغَيْظَ وَالْعَافِينَ عَنِ النَّاسِ", verseEn: "\"...who restrain anger and who pardon the people...\"", verseRef: "Surah Ali 'Imran 3:134",
    salat: "If distracted during prayer, gently return your focus without frustration. Hilm begins with patience toward oneself.", salatSource: "Adab as-Salat",
    sawmHadis: "The Prophet (s): 'If someone insults you while fasting, say: I am fasting.' Hilm protects the fast.", sawmSource: "Bihar al-Anwar",
    sadaqahHadis: "Imam al-Sadiq (a): 'Overlooking a brother's fault is a charity of the soul.'", sadaqahSource: "Al-Kafi",
    scoutRelate: "A Scout is Friendly. In the outdoors, things go wrong. Hilm allows us to lead our Patrol with a cool head, mirroring the patience of the Ahlulbayt (a).",
    dailyDuaAr: "اَللّهُمَّ زَيِّنّي بِالحِلْمِ", dailyDuaEn: "O Allah, adorn me with forbearance.", dailyDuaSource: "Sahifa Sajjadiya" },
  { day: 15, theme: "Shaja'a", themeAr: "شَجَاعَة", title: "Bravery", color: "#F59E0B",
    verseAr: "الَّذِينَ يُبَلِّغُونَ رِسَالَاتِ اللَّهِ وَيَخْشَوْنَهُ وَلَا يَخْشَوْنَ أَحَدًا إِلَّا اللَّهَ", verseEn: "\"[Allah praises] those who convey the messages of Allah and fear Him and do not fear anyone but Allah.\"", verseRef: "Surah Al-Ahzab 33:39",
    salat: "Stand firm in Qiyam. It takes spiritual bravery to stand against your own ego and desires five times a day.", salatSource: "Misbah al-Shariah",
    sawmHadis: "Imam Hassan (a): 'The bravest of people is the one who defeats his own desires.' Sawm is this battlefield.", sawmSource: "Tuhaf al-Uqul",
    sadaqahHadis: "Imam Ali (a): 'It takes bravery to give away wealth when you fear poverty.'", sadaqahSource: "Nahj al-Balagha",
    scoutRelate: "A Scout is Brave. True courage is standing up for truth, like Imam Hassan (a). The Ansar of Al-Mahdi (aj) are described as having hearts like iron.",
    dailyDuaAr: "اَللّهُمَّ قَوِّ عَزيمَتي", dailyDuaEn: "O Allah, strengthen my resolve.", dailyDuaSource: "Dua Kumayl" },
  { day: 16, theme: "Tawakkul", themeAr: "تَوَكُّل", title: "Reliance on Allah", color: "#06B6D4",
    verseAr: "وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ", verseEn: "\"And whoever relies upon Allah - then He is sufficient for him.\"", verseRef: "Surah At-Talaq 65:3",
    salat: "When bowing in Ruku, realize you are letting go of control and relying entirely on the Lord of the Worlds.", salatSource: "Al-Kafi, Vol. 3",
    sawmHadis: "Imam al-Jawad (a): 'Whoever relies on Allah, Allah provides for them from where they do not expect. Fasting builds this reliance.'", sawmSource: "Bihar al-Anwar",
    sadaqahHadis: "Imam al-Sadiq (a): 'Sadaqah does not decrease wealth; have Tawakkul when giving.'", sadaqahSource: "Al-Kafi",
    scoutRelate: "A Scout is Thrifty, but ultimately trusts Allah. When hiking in the woods, we prepare, but our Tawakkul is in the Creator. We await the Imam with this trust.",
    dailyDuaAr: "اَللّهُمَّ اجْعَلْني مِنَ المُتَوَكِّلينَ عَلَيْكَ", dailyDuaEn: "O Allah, make me among those who rely upon You.", dailyDuaSource: "Munajat of the Complainers" },
  { day: 17, theme: "Rida", themeAr: "رِضَا", title: "Contentment", color: "#8B5CF6",
    verseAr: "رَّضِيَ اللَّه عَنْهُمْ وَرَضُوا عَنْهُ", verseEn: "\"Allah is pleased with them, and they are pleased with Him.\"", verseRef: "Surah Al-Bayyinah 98:8",
    salat: "Say 'Alhamdulillah' after prayer with true Rida, accepting whatever Allah has decreed for you that day.", salatSource: "Uddat al-Da'i",
    sawmHadis: "Imam al-Sadiq (a): 'Fasting teaches the wealthy the pain of hunger so they become content with what they have.'", sawmSource: "Man La Yahduruhu al-Faqih",
    sadaqahHadis: "Imam Ali (a): 'The highest degree of faith is Rida. Give Sadaqah and be content with the reward hidden with Allah.'", sadaqahSource: "Ghurar al-Hikam",
    scoutRelate: "A Scout is Cheerful. Contentment (Rida) brings constant cheer. We are content with the decree of the Ghaybah, but work actively for the Faraj.",
    dailyDuaAr: "اَللّهُمَّ رَضِّني بِقَضائِكَ", dailyDuaEn: "O Allah, make me content with Your decree.", dailyDuaSource: "Dua Abu Hamza al-Thumali" },
  { day: 18, theme: "Yaqin", themeAr: "يَقِين", title: "Certainty", color: "#E11D48",
    verseAr: "وَاعْبُدْ رَبَّكَ حَتَّىٰ يَأْتِيَكَ الْيَقِينُ", verseEn: "\"And worship your Lord until there comes to you the certainty (death).\"", verseRef: "Surah Al-Hijr 15:99",
    salat: "Declare 'Allahu Akbar' with Yaqin. Believe truly that Allah is greater than whatever problem you face.", salatSource: "Sirr al-Salat",
    sawmHadis: "Imam al-Rida (a): 'Faith is one degree above Islam, and Yaqin is one degree above Faith.' Fasting tests this certainty.", sawmSource: "Al-Kafi",
    sadaqahHadis: "The Prophet (s): 'Sadaqah with Yaqin brings a hundredfold return in this world and the next.'", sadaqahSource: "Nahj al-Fasahah",
    scoutRelate: "A Scout is Trustworthy. Yaqin is the anchor of trust in Allah. We have absolute certainty in the promise of Allah regarding Imam al-Mahdi (aj).",
    dailyDuaAr: "اَللّهُمَّ ارْزُقْني يَقينَاً صادِقاً", dailyDuaEn: "O Allah, grant me true certainty.", dailyDuaSource: "Dua Abu Hamza al-Thumali" },
  { day: 19, theme: "Wafa", themeAr: "وَفَاء", title: "Loyalty", color: "#F43F5E",
    verseAr: "وَأَوْفُوا بِعَهْدِ اللَّهِ إِذَا عَاهَدتُّّمْ", verseEn: "\"And fulfill the covenant of Allah when you have taken it...\"", verseRef: "Surah An-Nahl 16:91",
    salat: "The Tashahhud is a renewal of our covenant and loyalty (Wafa) to Allah and His Messenger (s).", salatSource: "Falah al-Sail",
    sawmHadis: "Imam Ali (a) [Struck on this night]: 'Fasting is fulfilling your pledge to Allah to guard your limbs from sin.'", sawmSource: "Nahj al-Balagha",
    sadaqahHadis: "Imam al-Baqir (a): 'Fulfilling a promise to a brother is a Sadaqah accepted by Allah.'", sadaqahSource: "Al-Kafi",
    scoutRelate: "A Scout is Loyal. As we remember the strike upon Imam Ali (a), we renew our pledge (Bay'ah) to be loyal soldiers to the Imam of our time.",
    dailyDuaAr: "اَللّهُمَّ اجْعَلْني مِنَ المُوفينَ بِعَهْدِكَ", dailyDuaEn: "O Allah, make me among those who fulfill Your covenant.", dailyDuaSource: "Sahifa Sajjadiya" },
  { day: 20, theme: "Amanah", themeAr: "أَمَانَة", title: "Trust", color: "#10B981",
    verseAr: "إِنَّ اللَّهَ يَأْمُرُكُمْ أَن تُؤَدُّوا الْأَمَانَاتِ إِلَىٰ أَهْلِهَا", verseEn: "\"Indeed, Allah commands you to render trusts to whom they are due...\"", verseRef: "Surah An-Nisa 4:58",
    salat: "Prayer is an Amanah. Perform it in its prime time. Delaying it without reason is a breach of this trust.", salatSource: "Wasail al-Shia",
    sawmHadis: "Imam al-Sadiq (a): 'The body is a trust; fasting cleanses it. The soul is a trust; fasting elevates it.'", sawmSource: "Bihar al-Anwar",
    sadaqahHadis: "The Prophet (s): 'Wealth is an Amanah. Sadaqah is giving the Owner His rightful share.'", sadaqahSource: "Mizan al-Hikmah",
    scoutRelate: "A Scout is Trustworthy. The earth is an Amanah; Leave No Trace. The Wilayah is an Amanah; we must protect it for the Mahdi (aj).",
    dailyDuaAr: "اَللّهُمَّ أَعِنّي عَلى أَداءِ الأَمانَةِ", dailyDuaEn: "O Allah, help me to fulfill trusts.", dailyDuaSource: "Dua Makarim al-Akhlaq" },
  { day: 21, theme: "Qadr", themeAr: "قَدْر", title: "Destiny (Laylat al-Qadr)", color: "#F59E0B",
    verseAr: "لَيْلَةُ الْقَدْرِ خَيْرٌ مِّنْ أَلْفِ شَهْرٍ", verseEn: "\"The Night of Decree is better than a thousand months.\"", verseRef: "Surah Al-Qadr 97:3",
    salat: "Praying a two-Rak'ah prayer on this night, asking for forgiveness, can rewrite your spiritual destiny.", salatSource: "Mafatih al-Jinan",
    sawmHadis: "Imam al-Baqir (a): 'The angels descend tonight and greet those who are fasting and praying.'", sawmSource: "Al-Kafi",
    sadaqahHadis: "Imam al-Sadiq (a): 'Sadaqah on Laylat al-Qadr is multiplied a thousand times.'", sadaqahSource: "Thawab al-A'mal",
    scoutRelate: "A Scout is Reverent. Tonight is the peak of our spiritual journey. We beg Allah to write our names in the roster of Imam al-Mahdi's (aj) companions.",
    dailyDuaAr: "اَللّهُمَّ ارْزُقْني حَجَّ بَيْتِكَ الحَرامِ", dailyDuaEn: "O Allah, grant me the pilgrimage to Your Holy House.", dailyDuaSource: "Dua of Laylat al-Qadr" },
  { day: 22, theme: "Wilayah", themeAr: "وَلَايَة", title: "Divine Authority", color: "#06B6D4",
    verseAr: "إِنَّمَا وَلِيُّكُمُ اللَّه وَرَسُولُهُ وَالَّذِينَ آمَنُوا", verseEn: "\"Your ally is none but Allah and [therefore] His Messenger and those who have believed...\"", verseRef: "Surah Al-Ma'idah 5:55",
    salat: "We bear witness to the Wilayah of Imam Ali (a) in our Adhan, setting the compass of our prayer toward the right path.", salatSource: "Fiqh al-Rida",
    sawmHadis: "Imam al-Baqir (a): 'Islam is built on five pillars: Prayer, Zakat, Fasting, Hajj, and Wilayah; and none was stressed like Wilayah.'", sawmSource: "Al-Kafi, Vol. 2",
    sadaqahHadis: "Imam Ali (a) gave his ring in Ruku, proving that true charity is bound to divine authority.", sadaqahSource: "Tafsir al-Ayyashi",
    scoutRelate: "A Scout is Obedient. Wilayah means ultimate obedience to the Ahlulbayt. Our troop is a training ground for obedience to the Awaited Imam (aj).",
    dailyDuaAr: "اَللّهُمَّ ثَبِّتْني عَلى وِلايَةِ أَميرِ المُؤْمِنينَ", dailyDuaEn: "O Allah, keep me firm upon the Wilayah of the Commander of the Faithful.", dailyDuaSource: "Ziyarat Ashura" },
  { day: 23, theme: "Shahada", themeAr: "شَهَادَة", title: "Martyrdom", color: "#E11D48",
    verseAr: "وَلَا تَحْسَبَنَّ الَّذِينَ قُتِلُوا فِي سَبِيلِ اللَّهِ أَمْوَاتًا بَلْ أَحْيَاءٌ", verseEn: "\"And never think of those who have been killed in the cause of Allah as dead. Rather, they are alive...\"", verseRef: "Surah Ali 'Imran 3:169",
    salat: "The turbah of Imam Hussain (a) reminds us that our prayers are preserved through the blood of the martyrs.", salatSource: "Kamil al-Ziyarat",
    sawmHadis: "Imam Ali (a) met his martyrdom in Ramadan. 'By the Lord of the Kaaba, I have succeeded!' The ultimate fast is from this world.", sawmSource: "Nahj al-Balagha",
    sadaqahHadis: "Imam al-Sadiq (a): 'The highest Sadaqah is sacrificing one's life in the way of Allah.'", sadaqahSource: "Al-Amali",
    scoutRelate: "A Scout is Brave. We honor the Shahada of Imam Ali (a). A true Scout is ready to sacrifice everything for truth and justice alongside the Mahdi (aj).",
    dailyDuaAr: "اَللّهُمَّ ارْزُقْني الشَّهادَةَ في سَبيلِكَ", dailyDuaEn: "O Allah, grant me martyrdom in Your path.", dailyDuaSource: "Dua of the 12th Imam" },
  { day: 24, theme: "Mahabba", themeAr: "مَحَبَّة", title: "Divine Love", color: "#F06292",
    verseAr: "قُل إِن كُنتُمْ تُحِبُّونَ اللَّهَ فَاتَّبِعُونِي يُحْبِبْكُمُ اللَّه", verseEn: "\"Say, 'If you should love Allah, then follow me, [so] Allah will love you...\"", verseRef: "Surah Ali 'Imran 3:31",
    salat: "Pray not out of fear, but out of Mahabba (Love). Let your heart soar towards the Beloved during Sajdah.", salatSource: "Uddat al-Da'i",
    sawmHadis: "Imam al-Sadiq (a): 'Is religion anything but love?' We fast because we love the command of Allah.", sawmSource: "Al-Kafi",
    sadaqahHadis: "The Prophet (s): 'Give gifts to one another, for gifts wash away hatred and build love.'", sadaqahSource: "Nahj al-Fasahah",
    scoutRelate: "A Scout is Friendly. Brotherhood in the Tali3a is built on Mahabba. Our love for the Imam (aj) is the glue that unites us.",
    dailyDuaAr: "اَللّهُمَّ ارْزُقْني حُبَّكَ وَحُبَّ مَنْ يُحِبُّكَ", dailyDuaEn: "O Allah, grant me Your love and the love of those who love You.", dailyDuaSource: "Munajat of the Lovers" },
  { day: 25, theme: "Itisaam", themeAr: "اعْتِصَام", title: "Holding Fast", color: "#8B5CF6",
    verseAr: "وَاعْتَصِمُوا بِحَبْلِ اللَّهِ جَمِيعًا وَلَا تَفَرَّقُوا", verseEn: "\"And hold firmly to the rope of Allah all together and do not become divided.\"", verseRef: "Surah Ali 'Imran 3:103",
    salat: "Standing shoulder-to-shoulder in congregational prayer is the physical manifestation of Itisaam.", salatSource: "Wasail al-Shia",
    sawmHadis: "Imam al-Baqir (a): 'The rope of Allah is the Ahlulbayt.' Fasting unites the Ummah under one command.", sawmSource: "Tafsir al-Qummi",
    sadaqahHadis: "Imam Ali (a): 'Charity prevents division and holds the community together in times of crisis.'", sadaqahSource: "Ghurar al-Hikam",
    scoutRelate: "A Scout is Loyal. We hold fast to our Troop and to the teachings of the Ahlulbayt. Disunity delays the arrival of our Imam (aj).",
    dailyDuaAr: "اَللّهُمَّ عَرِّفْني حُجَّتَكَ", dailyDuaEn: "O Allah, make me know Your Proof (the Imam).", dailyDuaSource: "Dua of Knowledge" },
  { day: 26, theme: "Khushu", themeAr: "خُشُوع", title: "Humility", color: "#10B981",
    verseAr: "قَدْ أَفْلَحَ الْمُؤْمِنُونَ • الَّذِينَ هُمْ فِي صَلَاتِهِمْ خَاشِعُونَ", verseEn: "\"Certainly will the believers have succeeded: They who are during their prayer humbly submissive.\"", verseRef: "Surah Al-Mu'minun 23:1-2",
    salat: "Khushu is not just keeping your eyes down, it is keeping your heart still before the Majesty of Allah.", salatSource: "Sirr al-Salat",
    sawmHadis: "Imam al-Sadiq (a): 'Fasting breaks the ego and instills Khushu in the heart of the proud.'", sawmSource: "Bihar al-Anwar",
    sadaqahHadis: "Imam Zain al-Abidin (a): 'Give with a humble hand, recognizing that the poor are doing you a favor by accepting it.'", sadaqahSource: "Sahifa Sajjadiya",
    scoutRelate: "A Scout is Courteous. Humility in action is a Scout's uniform. We bow our heads in readiness for the orders of Imam al-Mahdi (aj).",
    dailyDuaAr: "اَللّهُمَّ ارْزُقْني قَلْبَاً خاشِعاً", dailyDuaEn: "O Allah, grant me a humble heart.", dailyDuaSource: "Dua Abu Hamza al-Thumali" },
  { day: 27, theme: "Dhikr", themeAr: "ذِكْر", title: "Remembrance", color: "#F59E0B",
    verseAr: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ", verseEn: "\"Unquestionably, by the remembrance of Allah hearts are assured.\"", verseRef: "Surah Ar-Ra'd 13:28",
    salat: "The Tasbih of Fatima Zahra (a) after prayer is a Dhikr that guarantees tranquility for the rest of your day.", salatSource: "Al-Kafi, Vol. 3",
    sawmHadis: "The Prophet (s): 'The breath of the fasting person is Tasbih (Dhikr).' Even silence is worship.", sawmSource: "Amali al-Saduq",
    sadaqahHadis: "Imam Ali (a): 'Remembering the poor is a Dhikr of the heart. Giving to them is a Dhikr of the hand.'", sadaqahSource: "Ghurar al-Hikam",
    scoutRelate: "A Scout is Reverent. We remember Allah in the woods, on the trail, and in the city. Constant Dhikr keeps us connected to the Imam of our time.",
    dailyDuaAr: "اَللّهُمَّ أَعِنّي عَلى ذِكْرِكَ وَشُكْرِكَ", dailyDuaEn: "O Allah, help me to remember You and thank You.", dailyDuaSource: "Mafatih al-Jinan" },
  { day: 28, theme: "Istighfar", themeAr: "اسْتِغْفَار", title: "Seeking Forgiveness", color: "#06B6D4",
    verseAr: "وَاسْتَغْفِرُوا اللَّهَ إِنَّ اللَّهَ غَفُورٌ رَّحِيمٌ", verseEn: "\"...And seek forgiveness of Allah. Indeed, Allah is Forgiving and Merciful.\"", verseRef: "Surah Al-Muzzammil 73:20",
    salat: "Say 'Astaghfirullah' between the two prostrations. It is a bridge between two moments of extreme closeness to God.", salatSource: "Misbah al-Shariah",
    sawmHadis: "Imam al-Sadiq (a): 'Fasting is a shield, but Istighfar polishes the rust off the shield.'", sawmSource: "Bihar al-Anwar",
    sadaqahHadis: "Imam al-Baqir (a): 'Give charity to wash away your sins, just as water puts out fire.'", sadaqahSource: "Thawab al-A'mal",
    scoutRelate: "A Scout is Clean. Just as we wash our gear after a camp, we must wash our souls through Istighfar to be pure for the Imam's (aj) service.",
    dailyDuaAr: "أَسْتَغْفِرُ اللَّهَ رَبّي وَأَتُوبُ إِلَيْهِ", dailyDuaEn: "I seek forgiveness from Allah, my Lord, and repent to Him.", dailyDuaSource: "Daily Ta'qibat" },
  { day: 29, theme: "Ridwan", themeAr: "رِضْوَان", title: "Divine Pleasure", color: "#E11D48",
    verseAr: "وَرِضْوَانٌ مِّنَ اللَّهِ أَكْبَرُ", verseEn: "\"...But approval from Allah is greater. It is that which is the great attainment.\"", verseRef: "Surah At-Tawbah 9:72",
    salat: "The ultimate goal of Salat is not just paradise, but the Ridwan (pleasure) of Allah. Seek His smile in your prayer.", salatSource: "Uddat al-Da'i",
    sawmHadis: "The Prophet (s): 'Ramadan brings the Ridwan of Allah to those who complete it with faith and accountability.'", sawmSource: "Amali al-Saduq",
    sadaqahHadis: "Imam Ali (a): 'A small charity given seeking His pleasure is heavier than a mountain of gold given for show.'", sadaqahSource: "Nahj al-Balagha",
    scoutRelate: "A Scout is Obedient. We do our duty not for badges, but to seek the pleasure of Allah and His Wali (aj).",
    dailyDuaAr: "اَللّهُمَّ إِنّي أَسْأَلُكَ رِضاكَ وَالجَنَّةَ", dailyDuaEn: "O Allah, I ask You for Your pleasure and Paradise.", dailyDuaSource: "Dua Abu Hamza" },
  { day: 30, theme: "Eid / Fitr", themeAr: "فِطْر", title: "The Celebration of Purity", color: "#BA68C8",
    verseAr: "قَدْ أَفْلَحَ مَن تَزَكَّىٰ • وَذَكَرَ اسْمَ رَبِّهِ فَصَلَّىٰ", verseEn: "\"He has certainly succeeded who purifies himself. And mentions the name of his Lord and prays.\"", verseRef: "Surah Al-A'la 87:14-15",
    salat: "The Eid prayer is a communal declaration of victory over the ego. We stand together, purified.", salatSource: "Mafatih al-Jinan",
    sawmHadis: "Imam Ali (a): 'Eid is only for him whose fasting is accepted and whose prayers are answered.'", sawmSource: "Nahj al-Balagha",
    sadaqahHadis: "Zakat al-Fitr is mandatory today. It completes the fast and purifies it from any idle talk or vanity.", sadaqahSource: "Wasail al-Shia",
    scoutRelate: "A Scout is Cheerful. We celebrate our spiritual growth! We stand ready, disciplined, and united, awaiting the final Eid: the reappearance of Imam al-Mahdi (aj).",
    dailyDuaAr: "اَللّهُمَّ أَهْلَ الكِبْرِياءِ وَالعَظَمَةِ", dailyDuaEn: "O Allah, Lord of Grandeur and Greatness...", dailyDuaSource: "Dua of Qunut in Eid Prayer" }
];

/* ════════════════════════════════════════════════════════════
   VISUAL COMPONENTS
════════════════════════════════════════════════════════════ */

const Lantern = ({ className }) => (
  <svg viewBox="0 0 60 90" fill="none" className={className}>
    <line x1="30" y1="0" x2="30" y2="15" stroke="#C9A227" strokeWidth="2.5"/>
    <circle cx="30" cy="8" r="3" fill="#C9A227"/>
    <path d="M15 18 Q30 12 45 18 L40 28 Q30 25 20 28 Z" fill="#C9A227"/>
    <path d="M20 28 Q12 45 15 65 Q22 72 30 72 Q38 72 45 65 Q48 45 40 28 Q30 25 20 28Z" fill="#E0B93A" opacity="0.3"/>
    <path d="M20 28 Q12 45 15 65 Q22 72 30 72 Q38 72 45 65 Q48 45 40 28 Q30 25 20 28Z" fill="none" stroke="#C9A227" strokeWidth="2.5"/>
    <ellipse cx="30" cy="50" rx="10" ry="15" fill="#FFD93D" opacity="0.7">
        <animate attributeName="opacity" values="0.4;0.9;0.4" dur="2.5s" repeatCount="indefinite" />
    </ellipse>
    <path d="M15 65 Q22 75 30 75 Q38 75 45 65 L40 62 Q30 68 20 62Z" fill="#C9A227"/>
  </svg>
);

const Badge = ({ icon, label, labelAr, baseColor }) => (
  <div className="flex flex-col items-center gap-1 group">
    <div 
        className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full border-2 sm:border-4 border-white/20 shadow-[0_5px_15px_rgba(0,0,0,0.5)] flex items-center justify-center text-xl sm:text-3xl md:text-4xl transition-all duration-300 hover:scale-110 relative overflow-hidden"
        style={{ 
            background: `linear-gradient(135deg, ${baseColor} 0%, #1a0f00 100%)`,
            boxShadow: `0 0 15px ${baseColor}33, inset 0 0 10px white/20`
        }}
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-40" />
      <span className="relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">{String(icon)}</span>
    </div>
    <div className="text-center">
      <div className="text-[7px] sm:text-[9px] md:text-[10px] font-black text-white uppercase tracking-[1px] leading-none">{String(label)}</div>
      <div className="text-[10px] sm:text-[13px] md:text-[15px] text-[#C9A227] font-serif font-black leading-none mt-1" style={{ letterSpacing: 'normal', fontFeatureSettings: '"liga" on' }}>{String(labelAr)}</div>
    </div>
  </div>
);

const SectionCard = ({ title, children, icon: SectionIcon, accentColor, arabicTitle, source }) => (
  <div className="relative bg-gradient-to-br from-[#fdf6e3] to-[#fefcf7] rounded-[30px] sm:rounded-[45px] border-[2px] sm:border-[3px] border-[#C9A227] p-4 sm:p-6 md:p-10 shadow-2xl overflow-hidden mb-4 sm:mb-6 group">
    <div className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none transition-transform group-hover:scale-110" style={{ color: accentColor }}>
        {SectionIcon && <SectionIcon size={120} />}
    </div>
    <div className="flex items-center justify-between mb-3 sm:mb-5 border-b-2 border-[#C9A227]/20 pb-2 sm:pb-4">
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="p-1.5 sm:p-2.5 rounded-xl text-white shadow-lg" style={{ backgroundColor: accentColor }}>
            {SectionIcon && <SectionIcon size={18} className="sm:w-6 sm:h-6" />}
        </div>
        <h3 className="text-[9px] sm:text-xs font-black uppercase tracking-[2px] text-[#063020]">{String(title)}</h3>
      </div>
      <span className="text-lg sm:text-2xl font-serif font-black text-[#C9A227]" style={{ letterSpacing: 'normal', fontFeatureSettings: '"liga" on' }}>{String(arabicTitle)}</span>
    </div>
    <div className="relative z-10">{children}</div>
    {source && (
        <div className="absolute bottom-2 right-6 sm:right-10 flex items-center gap-1 opacity-50 font-sans">
            <span className="text-[7px] sm:text-[9px] font-black uppercase tracking-tighter text-[#063020]">Source: {String(source)}</span>
        </div>
    )}
  </div>
);

/* ════════════════════════════════════════════════════════════
   MAIN APP
════════════════════════════════════════════════════════════ */

export default function App() {
  const [day, setDay] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState(null);
  
  const [mainLogoSrc, setMainLogoSrc] = useState(null);
  const [patrolLogoSrc, setPatrolLogoSrc] = useState(null);
  
  // LEADERSHIP VALUES
  const [tali3aName, setTali3aName] = useState("Patrol 3");
  const [leaderName, setLeaderName] = useState("Q. Hassan Issa");
  const [assistantName, setAssistantName] = useState("Q. Mohammad Jalol");
  
  const flyerRef = useRef(null);
  const fileInputRef = useRef(null);
  const d = DAYS_DATA[day - 1];

  // 1. FIREBASE AUTHENTICATION (Awaiting Auth Rule 3)
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth Failed:", err);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // 2. DATA LOAD (Ensuring Even Path Segments Rule 1)
  useEffect(() => {
    if (!user) return;
    // Path: /artifacts/{appId}/users/{userId}/{collectionName}/{documentId}
    const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'settings');
    getDoc(docRef).then((snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setTali3aName(String(data.tali3aName || "Patrol 3"));
        setLeaderName(String(data.leaderName || "Q. Hassan Issa"));
        setAssistantName(String(data.assistantName || "Q. Mohammad Jalol"));
        if (data.patrolLogoSrc) setPatrolLogoSrc(String(data.patrolLogoSrc));
      }
    }).catch(err => console.error("Firestore Load Error:", err));
  }, [user]);

  // 3. PERSISTENCE FUNCTION
  const saveProgress = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'settings');
      await setDoc(docRef, {
        tali3aName: String(tali3aName),
        leaderName: String(leaderName),
        assistantName: String(assistantName),
        patrolLogoSrc: patrolLogoSrc ? String(patrolLogoSrc) : null,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.error("Save Error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Load fixed main logo
  useEffect(() => {
    const imagePath = "logo.jpg";
    fetch(imagePath).then(r => r.ok ? r.blob() : Promise.reject()).then(b => {
      const reader = new FileReader();
      reader.onload = (e) => setMainLogoSrc(e.target.result);
      reader.readAsDataURL(b);
    }).catch(() => {
        fetch("Main Green.png").then(r => r.blob()).then(b => {
            const reader = new FileReader();
            reader.onload = (e) => setMainLogoSrc(e.target.result);
            reader.readAsDataURL(b);
        }).catch(() => setMainLogoSrc(null));
    });
  }, []);

  const handlePatrolLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setPatrolLogoSrc(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleExport = async (format) => {
    setIsExporting(true);
    try {
      const htmlToImage = await import('https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/+esm');
      await document.fonts.ready;
      
      setTimeout(async () => {
        try {
            const dataUrl = await htmlToImage.toPng(flyerRef.current, { 
                pixelRatio: 2.5, 
                backgroundColor: '#063020'
            });
            
            const fileName = `Daily Ramadan news letter - ${tali3aName} - Day ${day}`;
            if (format === 'png') {
                const link = document.createElement('a');
                link.download = `${fileName}.png`;
                link.href = dataUrl;
                link.click();
            } else {
                const { jsPDF } = await import('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
                const pdf = new window.jspdf.jsPDF('p', 'mm', 'a4');
                const img = new Image();
                img.src = dataUrl;
                img.onload = () => {
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = (img.height * pdfWidth) / img.width;
                    pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
                    pdf.save(`${fileName}.pdf`);
                };
            }
        } catch (err) {
            console.error("Export Error:", err);
        } finally {
            setIsExporting(false);
        }
      }, 500);
    } catch (err) {
        setIsExporting(false);
    }
  };

  const footerLogoSrc = patrolLogoSrc || mainLogoSrc;

  const arabicTextStyle = { 
    letterSpacing: '0px', 
    fontFeatureSettings: '"liga" 1, "rlig" 1',
    fontVariantLigatures: 'normal',
    fontFamily: '"Amiri", "Arial", sans-serif',
    textShadow: 'none'
  };

  return (
    <div className="min-h-screen bg-[#010805] flex flex-col items-center py-6 sm:py-10 px-4 font-serif text-[#1a0f00] overflow-x-hidden">
      
      {/* PERSONALIZATION PANEL */}
      <div className="w-full max-w-2xl mb-8 sm:mb-12 p-6 sm:p-8 bg-[#063020]/60 border-2 border-[#C9A227]/40 rounded-[30px] sm:rounded-[50px] backdrop-blur-2xl space-y-4 sm:space-y-6 no-print shadow-2xl">
        <div className="flex justify-between items-center mb-2">
            <h4 className="text-[#C9A227] text-xs sm:text-base font-black uppercase tracking-[4px] drop-shadow-md">Unit 1318 Profile</h4>
            <button 
                onClick={saveProgress}
                disabled={isSaving || !user}
                className="flex items-center gap-2 bg-[#C9A227] text-[#063020] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-50"
            >
                {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                {isSaving ? 'Saving...' : 'Save for this device'}
            </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            <div className="flex flex-col gap-1 text-white">
                <label className="text-[10px] text-[#C9A227] uppercase font-black ml-1">Patrol Name</label>
                <input value={tali3aName} onChange={(e) => setTali3aName(e.target.value)} placeholder="Tali3a Name" className="bg-black/40 border-2 border-[#C9A227]/30 rounded-xl px-4 py-2 text-white text-xs sm:text-sm outline-none focus:border-[#C9A227] transition-all" />
            </div>
            <div className="flex flex-col gap-1 text-white">
                <label className="text-[10px] text-[#C9A227] uppercase font-black ml-1">Leader</label>
                <input value={leaderName} onChange={(e) => setLeaderName(e.target.value)} placeholder="Leader" className="bg-black/40 border-2 border-[#C9A227]/30 rounded-xl px-4 py-2 text-white text-xs sm:text-sm outline-none focus:border-[#C9A227] transition-all" />
            </div>
            <div className="flex flex-col gap-1 text-white">
                <label className="text-[10px] text-[#C9A227] uppercase font-black ml-1">Assistant</label>
                <input value={assistantName} onChange={(e) => setAssistantName(e.target.value)} placeholder="Assistant" className="bg-black/40 border-2 border-[#C9A227]/30 rounded-xl px-4 py-2 text-white text-xs sm:text-sm outline-none focus:border-[#C9A227] transition-all" />
            </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
            <button onClick={() => fileInputRef.current.click()} className="flex-1 bg-[#C9A227] text-[#063020] text-[10px] sm:text-[11px] font-black py-3 rounded-xl uppercase hover:brightness-110 active:scale-95 transition-all">Upload Patrol Logo</button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePatrolLogoUpload} />
            <div className="flex items-center gap-4 bg-black/50 px-6 py-2 rounded-2xl border-2 border-[#C9A227]/20">
                <button onClick={() => setDay(p => Math.max(1, p-1))} className="text-[#C9A227] hover:scale-125 transition-all"><ChevronLeft size={24}/></button>
                <div className="text-center min-w-[30px]">
                    <p className="text-[8px] text-[#C9A227] font-black uppercase leading-none">Day</p>
                    <p className="text-white font-black text-xl leading-none mt-1">{day}</p>
                </div>
                <button onClick={() => setDay(p => Math.min(30, p+1))} className="text-[#C9A227] hover:scale-125 transition-all"><ChevronRight size={24}/></button>
            </div>
            <button disabled={isExporting} onClick={() => handleExport('png')} className="bg-white/10 border-2 border-white/20 text-white text-[10px] sm:text-[11px] font-black px-4 py-3 rounded-xl uppercase hover:bg-white/20 transition-all">
                {isExporting ? 'Exporting...' : 'Export PNG'}
            </button>
        </div>
      </div>

      {/* FLYER ARTBOARD */}
      <div className="w-full flex justify-center overflow-x-auto pb-10">
        <div 
            ref={flyerRef}
            className="w-full max-w-[620px] min-w-[340px] relative bg-gradient-to-b from-[#063020] via-[#0a3d28] to-[#041a10] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.9)] border-x-2 border-[#C9A227]/40"
        >
            <div className="pt-16 sm:pt-20 px-8 pb-6 text-center relative z-10">
                <h2 className="text-[#C9A227] text-2xl sm:text-4xl mb-8 font-black drop-shadow-lg" style={arabicTextStyle}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</h2>
                
                <div className="flex items-center justify-between mb-8">
                    <Lantern className="w-16 sm:w-24 h-auto drop-shadow-[0_0_20px_rgba(201,162,39,0.6)]" />
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-24 h-24 sm:w-40 aspect-square rounded-full border-[6px] border-[#C9A227] overflow-hidden bg-[#063020] shadow-[0_0_50px_rgba(201,162,39,0.7)] relative flex items-center justify-center">
                            {mainLogoSrc ? <img src={mainLogoSrc} className="w-full h-full object-cover" /> : <div className="text-[#C9A227] font-black text-xs uppercase">Dhulfiqar</div>}
                        </div>
                        <h1 className="text-[#C9A227] text-[8px] sm:text-xs font-black uppercase tracking-[4px] mt-2">Dhulfiqar Scout Team</h1>
                    </div>
                    <Lantern className="w-16 sm:w-24 h-auto scale-x-[-1] drop-shadow-[0_0_20px_rgba(201,162,39,0.6)]" />
                </div>

                <div className="bg-gradient-to-r from-transparent via-[#C9A227]/40 to-transparent border-y-2 border-[#C9A227]/60 py-3 mb-8">
                    <p className="text-white text-xl sm:text-4xl font-black tracking-[6px] drop-shadow-md">RAMADAN MUBARAK</p>
                </div>

                <div className="inline-flex items-center gap-8 bg-gradient-to-r from-[#a07c18] via-[#E0B93A] to-[#a07c18] rounded-[40px] px-8 py-4 shadow-2xl border-2 border-white/50 scale-[0.9] sm:scale-110">
                    <span className="text-[#063020] text-4xl sm:text-7xl font-black leading-none">{day}</span>
                    <div className="w-[2px] h-10 bg-[#063020]/20" />
                    <div className="text-left leading-tight">
                        <p className="text-[#063020] text-sm sm:text-2xl font-black uppercase tracking-tight">{String(d.title)}</p>
                        <div className="text-[#063020] text-[10px] sm:text-[15px] opacity-90 italic mt-1 font-black uppercase flex items-center gap-2">
                            <span>{String(d.theme)}</span> <span>•</span> <span className="text-lg sm:text-2xl font-bold" style={arabicTextStyle}>{String(d.themeAr)}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-black/70 border-y-4 border-[#C9A227]/60 py-6 flex justify-around backdrop-blur-xl relative z-10">
                <Badge icon="📖" label="Qur'an" labelAr="القُرْآن" baseColor="#10B981" />
                <Badge icon="🤲" label="Salat" labelAr="الصَّلاة" baseColor="#F59E0B" />
                <Badge icon="🌙" label="Sawm" labelAr="الصَّوْم" baseColor="#06B6D4" />
                <Badge icon="💛" label="Sadaqah" labelAr="الصَّدَقَة" baseColor="#F43F5E" />
                <Badge icon="⚜️" label="Scout" labelAr="الكَشَّاف" baseColor="#8B5CF6" />
            </div>

            <div className="p-6 sm:p-10 space-y-4 relative z-10">
                <SectionCard title="Holy Qur'an" arabicTitle="القُرْآن الكَرِيم" icon={BookOpen} accentColor="#10B981" source={d.verseRef}>
                    <p className="text-[#063020] text-3xl sm:text-5xl text-center mb-6 font-bold" dir="rtl" style={arabicTextStyle}>{String(d.verseAr)}</p>
                    <p className="text-[#1a0f00] text-sm sm:text-lg italic text-center border-t border-[#C9A227]/30 pt-6 font-black">{String(d.verseEn)}</p>
                </SectionCard>
                <SectionCard title="Salat Recommendation" arabicTitle="تَوْصِيَةُ الصَّلاة" icon={Zap} accentColor="#F59E0B" source={d.salatSource}>
                    <p className="text-[#1a0f00] font-black">{String(d.salat)}</p>
                </SectionCard>
                <SectionCard title="Sawm Wisdom" arabicTitle="حِكْمَةُ الصَّوْم" icon={Moon} accentColor="#06B6D4" source={d.sawmSource}>
                    <p className="text-[#1a0f00] italic border-l-4 border-[#06B6D4] pl-4 font-black">{String(d.sawmHadis)}</p>
                </SectionCard>
                <SectionCard title="Sadaqah Teaching" arabicTitle="دَرْسُ الصَّدَقَة" icon={Heart} accentColor="#F43F5E" source={d.sadaqahSource}>
                    <p className="text-[#1a0f00] italic border-l-4 border-[#F43F5E] pl-4 font-black">{String(d.sadaqahHadis)}</p>
                </SectionCard>
                <SectionCard title="Scout Mission & Mahdi (aj)" arabicTitle="مُهِمَّةُ الكَشَّاف" icon={Compass} accentColor="#8B5CF6">
                    <div className="flex items-start gap-4 mb-8">
                        <div className="p-2 bg-[#8B5CF6] text-white rounded-2xl shadow-lg"><Award className="w-6 h-6" /></div>
                        <p className="text-[#063020] font-black">{String(d.scoutRelate)}</p>
                    </div>
                    <div className="bg-[#064e3b] rounded-[30px] p-8 text-center border-2 border-[#C9A227]/40 relative overflow-hidden">
                        <div className="text-[10px] font-black uppercase text-[#C9A227] mb-6">الدُّعاءُ اليَوْمِي</div>
                        <p className="text-[#ecfdf5] text-3xl sm:text-6xl font-bold mb-6 leading-normal" dir="rtl" style={arabicTextStyle}>{String(d.dailyDuaAr)}</p>
                        <p className="text-[#6ee7b7] text-xs sm:text-lg font-black italic">"{String(d.dailyDuaEn)}"</p>
                    </div>
                </SectionCard>
            </div>

            <div className="bg-gradient-to-b from-[#C9A227] to-[#a07c18] py-10 px-4 border-t-4 border-[#063020]/30 relative">
                <div className="grid grid-cols-3 gap-2 items-center">
                    <div className="flex flex-col items-center gap-2">
                        <p className="text-sm sm:text-lg font-black text-[#063020] whitespace-nowrap">{String(tali3aName)}</p>
                        <div className="w-16 h-16 sm:w-20 aspect-square rounded-[20px] border-2 border-[#063020]/40 overflow-hidden bg-[#063020] flex items-center justify-center">
                            {footerLogoSrc ? <img src={footerLogoSrc} className="w-full h-full object-cover" /> : <span className="text-[#C9A227] font-black text-xs">LOGO</span>}
                        </div>
                    </div>
                    <div className="text-center text-[#063020]">
                        <p className="text-lg sm:text-2xl font-black mb-2" style={arabicTextStyle}>تَقَبَّلَ اللَّهُ أَعْمَالَكُمْ</p>
                        <p className="text-[7px] font-black uppercase tracking-widest">May Allah Accept Deeds</p>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                        <div className="bg-[#063020]/15 px-3 py-1 rounded-lg border border-[#063020]/20 w-fit">
                            <span className="block text-[6px] font-black uppercase opacity-70">Leader</span>
                            <p className="text-[10px] sm:text-xs font-black whitespace-nowrap text-[#063020]">{String(leaderName)}</p>
                        </div>
                        <div className="bg-[#063020]/10 px-3 py-1 rounded-lg border border-[#063020]/20 w-fit">
                            <span className="block text-[6px] font-black uppercase opacity-70">Assistant</span>
                            <p className="text-[10px] sm:text-xs font-black whitespace-nowrap text-[#063020]">{String(assistantName)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
