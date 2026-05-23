import { cardDatabase, CardTypes, newInstanceId, setCardInstantiator } from '../models/cards';
import { useCardStore } from '../store';

class CardRepository {
  constructor() {
    this.officialCards = cardDatabase;
  }

  getCard(cardId) {
    const officialCard = this.officialCards[cardId];
    if (officialCard) {
      return officialCard;
    }

    const customCards = useCardStore.getState().customCards;
    const customCard = customCards.find((card) => card.customId === cardId);

    if (customCard) {
      return customCard;
    }

    throw new Error(`Card not found: ${cardId}`);
  }

  getAllCards() {
    const officialCards = Object.values(this.officialCards);
    const customCards = useCardStore.getState().customCards;
    return [...officialCards, ...customCards];
  }

  hasCard(cardId) {
    return !!this.officialCards[cardId] ||
           !!useCardStore.getState().customCards.find((card) => card.customId === cardId);
  }

  getOfficialCard(cardId) {
    return this.officialCards[cardId];
  }

  getCustomCard(cardId) {
    const customCards = useCardStore.getState().customCards;
    return customCards.find((card) => card.customId === cardId);
  }

  instantiateCard(cardId) {
    const card = this.getCard(cardId);
    return {
      ...card,
      instanceId: newInstanceId(cardId),
      ...(card.type === CardTypes.POKEMON && { attachedEnergy: [], currentHp: card.maxHp })
    };
  }
}

export const cardRepository = new CardRepository();

// Initialize the card instantiator to use CardRepository
setCardInstantiator((cardId) => cardRepository.instantiateCard(cardId));
