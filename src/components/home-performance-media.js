import kandyKandleWebm from '../../assets/KandyKandle.webm';
import ownerPennyKandyVideo from '../../assets/WitchPennyAndKandy2-silent.webm';
import pennyClubFinalVideo from '../../assets/PennyClubFinal.webm';
import pennyLapDanceVideo from '../../assets/ClubPennyLapDance1.webm';
import pennyKnowledgeVideo from '../../assets/PennyKnowledge.webm';
import witchHalloweenHookUp from '../../assets/WitchPennyKandyHookUp.webm';
import witchHalloween20 from '../../assets/WitchPennyKandy20.webm';
import witchHalloweenTarot from '../../assets/WitchPennyKandyTarot.webm';
import pennyKandyAvaVideo from '../../assets/PennyKandyAva.webm';
import witchHalloweenIntro from '../../assets/WitchPennyIntroKandy.webm';
import witchHalloweenReading from '../../assets/WitchPennyKandyTarotReading.webm';

const variants = new Map([
  [ownerPennyKandyVideo, {"softwareSrc":"/static/performance-v2/witchpennyandkandy2-silent.webm"}],
  [kandyKandleWebm, {"softwareSrc":"/static/performance-v2/kandykandle.webm"}],
  [pennyClubFinalVideo, {"lightweightSrc":"/static/performance-v2/pennyclubfinal.mp4","compatibilityPoster":"/static/performance-v2/pennyclubfinal.webp","softwareSrc":"/static/performance-v2/pennyclubfinal.webm"}],
  [pennyLapDanceVideo, {"lightweightSrc":"/static/performance-v2/clubpennylapdance1.mp4","compatibilityPoster":"/static/performance-v2/clubpennylapdance1.webp","softwareSrc":"/static/performance-v2/clubpennylapdance1.webm"}],
  [pennyKnowledgeVideo, {"lightweightSrc":"/static/performance-v2/pennyknowledge.mp4","compatibilityPoster":"/static/performance-v2/pennyknowledge.webp","softwareSrc":"/static/performance-v2/pennyknowledge.webm"}],
  [witchHalloweenHookUp, {"lightweightSrc":"/static/performance-v2/witchpennykandyhookup.mp4","compatibilityPoster":"/static/performance-v2/witchpennykandyhookup.webp","softwareSrc":"/static/performance-v2/witchpennykandyhookup.webm"}],
  [witchHalloween20, {"lightweightSrc":"/static/performance-v2/witchpennykandy20.mp4","compatibilityPoster":"/static/performance-v2/witchpennykandy20.webp","softwareSrc":"/static/performance-v2/witchpennykandy20.webm"}],
  [witchHalloweenTarot, {"lightweightSrc":"/static/performance-v2/witchpennykandytarot.mp4","compatibilityPoster":"/static/performance-v2/witchpennykandytarot.webp","softwareSrc":"/static/performance-v2/witchpennykandytarot.webm"}],
  [pennyKandyAvaVideo, {"lightweightSrc":"/static/performance-v2/pennykandyava.mp4","compatibilityPoster":"/static/performance-v2/pennykandyava.webp","softwareSrc":"/static/performance-v2/pennykandyava.webm"}],
  [witchHalloweenIntro, {"lightweightSrc":"/static/performance-v2/witchpennyintrokandy.mp4","compatibilityPoster":"/static/performance-v2/witchpennyintrokandy.webp","softwareSrc":"/static/performance-v2/witchpennyintrokandy.webm"}],
  [witchHalloweenReading, {"lightweightSrc":"/static/performance-v2/witchpennykandytarotreading.mp4","compatibilityPoster":"/static/performance-v2/witchpennykandytarotreading.webp","softwareSrc":"/static/performance-v2/witchpennykandytarotreading.webm"}],
  ["/static/AshleyIntroLoopmp4.webm", {"lightweightSrc":"/static/performance-v2/ashleyintroloopmp4.mp4","compatibilityPoster":"/static/performance-v2/ashleyintroloopmp4.webp","softwareSrc":"/static/performance-v2/ashleyintroloopmp4.webm"}],
  ["/static/AshleyHotLoop.webm", {"lightweightSrc":"/static/performance-v2/ashleyhotloop.mp4","compatibilityPoster":"/static/performance-v2/ashleyhotloop.webp","softwareSrc":"/static/performance-v2/ashleyhotloop.webm"}],
  ["/static/JennIntro.webm", {"lightweightSrc":"/static/performance-v2/jennintro.mp4","compatibilityPoster":"/static/performance-v2/jennintro.webp","softwareSrc":"/static/performance-v2/jennintro.webm"}],
]);
export const getHomeMedia = source => variants.get(source) || {};
