/*
* Copyright 2018 PoC-Consortium
*/
import Dictionary from "./dictionary";

let seedrandom = require('seedrandom');
export class PassPhraseGenerator {

    private seed: any[];

    constructor(private dictionary: Dictionary) {
        // TODO: do we really need to call this here?
        seedrandom();
        this.seed = [];
    }

	public generatePassPhrase(): string[] {
        // seed with given seed if seed was given, yep
        this.seed.map(element => seedrandom(element, { "entropy": true, "global":true }));

        // get random words
        const dictionaryWords = this.dictionary.getWords();
        let words: string[] = [];
		for (let i = 0; i < 12; i++) {
			let number = Math.floor((Math.random() * dictionaryWords.length) + 1);
			words.push(dictionaryWords[number]);
		}
        // return concatenated string
        return words;
	}

	public reSeed(seed) {
		this.seed = seed;
	}
}
