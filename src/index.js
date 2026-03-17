import Card from './Card.js';
import Game from './Game.js';
import TaskQueue from './TaskQueue.js';
import SpeedRate from './SpeedRate.js';

// Отвечает является ли карта уткой.
function isDuck(card) {
    return card && card.quacks && card.swims;
}

// Отвечает является ли карта собакой.
function isDog(card) {
    return card instanceof Dog;
}

// Дает описание существа по схожести с утками и собаками
function getCreatureDescription(card) {
    if (isDuck(card) && isDog(card)) {
        return 'Утка-Собака';
    }
    if (isDuck(card)) {
        return 'Утка';
    }
    if (isDog(card)) {
        return 'Собака';
    }
    return 'Существо';
}


class Creature extends Card {
    //constructor(name, maxPower, image) {
    //    super(name, maxPower, image)
    //}

    getDescriptions() {
        let result = [getCreatureDescription(this), ...super.getDescriptions()];
        return result;
    }
}

// Основа для утки.
class Duck extends Creature {
    constructor() {
        super('Duck', 2)
    }

    quacks = function () { console.log('quack') };
    swims = function () { console.log('float: both;') };
}


// Основа для собаки.
class Dog extends Creature {
    constructor() {
        super('Dog', 3);
    }
}

class Trasher extends Dog {
    constructor() {
        super("Trasher", 5);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        if (value == 2) {
            this.view.signalAbility(() => {
                continuation(value - 1);
            })
        }
    }

    getDescriptions() {
        let result = [getCreatureDescription(this),'Если Громилу атакуют, получает на 1 урон меньше', ...super.getDescriptions()];
        return result;
    }
}


// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [
    new Duck(),
    new Duck(),
    new Duck(),
];

// Колода Бандита, верхнего игрока.
const banditStartDeck = [
    new Trasher(),
];


// Создание игры.
const game = new Game(seriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(1);

// Запуск игры.
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});
