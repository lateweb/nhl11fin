// game/questions.js

import { RosterDB, lineups } from '../data/roster.js';
import {
  getRandomOptions,
  getRandomSubset,
  getPlayerEvenLineName,
  playerPlaysPP,
  playerPlaysPK,
  shuffleArray,
  isReservePlayer,
  getOddOneOutGroup
} from './utils.js';
import { 
  updateHistory, 
  getPlayerAvoidingRecent, 
  getQuestionTypeAvoidingRecent,
  isQuestionRecentlyUsed 
} from './history.js';

// Helper strictly for the quiz to display long form names (e.g., H1 -> HyÃ¶kkÃ¤ys 1)
function getQuizDisplayName(internalName) {
  if (!internalName) return '';
  if (internalName.match(/^H(\d+)$/)) return `HyÃ¶kkÃ¤ys ${RegExp.$1}`;
  if (internalName.match(/^P(\d+)$/)) return `Puolustus ${RegExp.$1}`;
  
  const quizMappings = {
    'YV1': 'Ylivoima 1',
    '4YV1': 'Ylivoima 1',
    'YV2': 'Ylivoima 2',
    '4YV2': 'Ylivoima 2',
    'AV1': 'Alivoima 1',
    '3AV1': 'Alivoima 1',
    'AV2': 'Alivoima 2',
    '3AV2': 'Alivoima 2'
  };
  
  return quizMappings[internalName] || internalName;
}

// All possible option names for line questions (long forms exclusively)
const ALL_LINE_NAMES = Array.from(new Set([
  ...lineups.even
    .map(l => l.name)
    .filter(name => name !== 'VarahyÃ¶kkÃ¤Ã¤jÃ¤t' && name !== 'Varapuolustajat')
    .map(getQuizDisplayName),
  'Ylivoima 1',
  'Ylivoima 2',
  'Alivoima 1',
  'Alivoima 2'
]));

function generateNumberQuestion() {
  const player = getPlayerAvoidingRecent({ excludeReserves: true });
  if (!player) return null;

  const qId = `num_${player.name}`;
  if (isQuestionRecentlyUsed(qId)) return null;

  const correct = player.number.toString();
  const allNumbers = RosterDB.filter(p => !isReservePlayer(p.name)).map(p => p.number.toString());
  const options = getRandomOptions(correct, allNumbers, 4);
  
  updateHistory(player.name, 'number', qId);
  
  return {
    type: 'number',
    question: `MikÃ¤ on pelaajan <strong>${player.name}</strong> pelinumero?`,
    options,
    correct,
    playerName: player.name
  };
}

function generateNameQuestion() {
  const player = getPlayerAvoidingRecent({ excludeReserves: true });
  if (!player) return null;

  const qId = `name_${player.number}`;
  if (isQuestionRecentlyUsed(qId)) return null;

  const correct = player.name;
  const number = player.number;
  const allNames = RosterDB.filter(p => !isReservePlayer(p.name)).map(p => p.name);
  const options = getRandomOptions(correct, allNames, 4);
  
  updateHistory(player.name, 'name', qId);
  
  return {
    type: 'name',
    question: `Kuka pelaa numerolla <strong>${number}</strong>?`,
    options,
    correct,
    playerName: correct
  };
}

function generateLineQuestion() {
  // Find a player who has at least one line/unit assignment (even or special)
  let player = null;
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = getPlayerAvoidingRecent({ excludeGoalies: true, excludeReserves: true });
    if (!candidate) break;

    const hasEven = getPlayerEvenLineName(candidate.name) !== 'Ei ketjua';
    const hasSpecial = candidate.roles.some(role => /_(pp|pk|4pp|3pk)/.test(role));
    if (hasEven || hasSpecial) {
      player = candidate;
      break;
    }
  }
  if (!player) return null;

  // Collect all units this player belongs to (display names)
  const playerUnits = new Set();

  // Even-strength line
  const evenLine = getPlayerEvenLineName(player.name);
  if (evenLine !== 'Ei ketjua') {
    playerUnits.add(getQuizDisplayName(evenLine));
  }

  // Power play units
  for (const unit of lineups.pp) {
    const allRoles = [...(unit.f || []), ...(unit.d ||[])];
    if (player.roles.some(role => allRoles.includes(role))) {
      playerUnits.add(getQuizDisplayName(unit.name));
    }
  }

  // Penalty kill units
  for (const unit of lineups.pk) {
    const allRoles = [...(unit.f || []), ...(unit.d ||[])];
    if (player.roles.some(role => allRoles.includes(role))) {
      playerUnits.add(getQuizDisplayName(unit.name));
    }
  }

  if (playerUnits.size === 0) return null;

  // Convert to array and pick one random correct answer
  const answersArray = Array.from(playerUnits);
  const correct = answersArray[Math.floor(Math.random() * answersArray.length)];

  // Build options: correct + three others from the full pool,
  // but exclude any other units the player belongs to (to avoid multiple correct answers)
  const availableOptions = ALL_LINE_NAMES.filter(name => !playerUnits.has(name) || name === correct);
  const options = getRandomOptions(correct, availableOptions, 4);

  const qId = `line_${player.name}_${correct}`;
  if (isQuestionRecentlyUsed(qId)) return null;

  updateHistory(player.name, 'line', qId);
  
  return {
    type: 'line',
    question: `MissÃ¤ ketjussa <strong>${player.name}</strong> pelaa?`,
    options,
    correct,
    playerName: player.name
  };
}

function generateOddOneQuestion() {
  const properties = ['pp', 'pk', 'position'];
  const prop = properties[Math.floor(Math.random() * properties.length)];
  const askForHas = Math.random() < 0.5;
  
  let groupPlayers =[];
  let oddPlayer = null;
  let questionText = '';
  const allPlayers = RosterDB.filter(p => p.pos !== 'G' && !isReservePlayer(p.name));

  if (prop === 'pp' || prop === 'pk') {
    const isPP = prop === 'pp';
    const playsSpecial = isPP ? playerPlaysPP : playerPlaysPK;
    
    const specialPlayers = allPlayers.filter(p => playsSpecial(p.name));
    const nonSpecialPlayers = allPlayers.filter(p => !playsSpecial(p.name));

    const result = getOddOneOutGroup(specialPlayers, nonSpecialPlayers, askForHas);
    if (!result) return null;

    oddPlayer = result.oddPlayer;
    groupPlayers = result.groupPlayers;
    
    questionText = askForHas
      ? `Kuka seuraavista pelaa ${isPP ? 'ylivoimalla' : 'alivoimalla'}?`
      : `Kuka seuraavista <strong>EI</strong> pelaa ${isPP ? 'ylivoimalla' : 'alivoimalla'}?`;

  } else if (prop === 'position') {
    // Only two positive questions (no duplication)
    const posQuestions =[
      { text: 'Kuka seuraavista on hyÃ¶kkÃ¤Ã¤jÃ¤?', oddPos: 'F', askForHas: true },
      { text: 'Kuka seuraavista on puolustaja?', oddPos: 'D', askForHas: true }
    ];
    const selected = posQuestions[Math.floor(Math.random() * posQuestions.length)];
    
    const targetPosPlayers = allPlayers.filter(p => p.pos === selected.oddPos);
    const otherPosPlayers = allPlayers.filter(p => p.pos !== selected.oddPos);

    const result = getOddOneOutGroup(targetPosPlayers, otherPosPlayers, selected.askForHas);
    if (!result) return null;

    oddPlayer = result.oddPlayer;
    groupPlayers = result.groupPlayers;
    questionText = selected.text;
  }

  const selectedPlayers =[...groupPlayers, oddPlayer];
  if (new Set(selectedPlayers.map(p => p.name)).size !== 4) return null;

  const qId = `odd_${prop}_${oddPlayer.name}`;
  if (isQuestionRecentlyUsed(qId)) return null;

  updateHistory(oddPlayer.name, 'oddone', qId);
  
  return {
    type: 'oddone',
    question: questionText,
    options: shuffleArray(selectedPlayers.map(p => p.name)),
    correct: oddPlayer.name,
    playerName: oddPlayer.name
  };
}

function generateShootsQuestion() {
  const shootSide = Math.random() < 0.5 ? 'L' : 'R';
  const questionText = shootSide === 'L' 
    ? 'Kuka seuraavista laukoo vasemmalta?' 
    : 'Kuka seuraavista laukoo oikealta?';
  
  const allPlayers = RosterDB.filter(p => p.pos !== 'G' && !isReservePlayer(p.name));
  const targetPlayers = allPlayers.filter(p => p.shoots === shootSide);
  const otherPlayers = allPlayers.filter(p => p.shoots !== shootSide);
  
  const result = getOddOneOutGroup(targetPlayers, otherPlayers, true);
  if (!result) return null;
  
  const selected =[...result.groupPlayers, result.oddPlayer];
  if (new Set(selected.map(p => p.name)).size !== 4) return null;
  
  const qId = `shoots_${shootSide}_${result.oddPlayer.name}`;
  if (isQuestionRecentlyUsed(qId)) return null;
  
  updateHistory(result.oddPlayer.name, 'shoots', qId);
  
  return {
    type: 'shoots',
    question: questionText,
    options: shuffleArray(selected.map(p => p.name)),
    correct: result.oddPlayer.name,
    playerName: result.oddPlayer.name
  };
}

export function generateQuestion() {
  // Try generating a question up to 5 times to bypass any null returns safely
  for (let i = 0; i < 5; i++) {
    const type = getQuestionTypeAvoidingRecent();
    let q = null;
    switch (type) {
      case 'number': q = generateNumberQuestion(); break;
      case 'name': q = generateNameQuestion(); break;
      case 'line': q = generateLineQuestion(); break;
      case 'oddone': q = generateOddOneQuestion(); break;
      case 'shoots': q = generateShootsQuestion(); break;
      default: q = generateNumberQuestion(); break;
    }
    if (q) return q;
  }
  // Fallback if all logic somehow fails due to pool exhaustion
  return generateNumberQuestion() || generateNameQuestion(); 
}