
'use strict';

/**
 * @class Card
 * modulerar ett kort 
 */
class Card {
  constructor(id, cardset, text) {
    this.id = id;
    this.cardset = cardset;
    this.text = text;
  }
}

module.exports = Card;
