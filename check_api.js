const { Player } = require('discord-player');
const { Client } = require('discord.js');
const c = new Client({ intents: [] });
const p = new Player(c);
console.log('Player version:', p.version);
console.log('Extractor methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(p.extractors)));

const ext = require('@discord-player/extractor');
console.log('Extractor version:', ext.version);

const yt = require('discord-player-youtubei');
console.log('Youtubei exports:', Object.keys(yt));
