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

    quacks = function () {
        console.log('quack')
    };
    swims = function () {
        console.log('float: both;')
    };
}


// Основа для собаки.
class Dog extends Creature {
    constructor() {
        super('Dog', 3);
    }
}

class PseudoDuck extends Dog {
    constructor() {
        super();
    }
    quacks = function () {
        console.log('quack')
    };
    swims = function () {
        console.log('float: both;')
    };
}

class Trasher extends Dog {
    constructor() {
        super("Trasher", 5);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => {
            const reducedDamage = Math.max(0, value - 1);
            console.log(reducedDamage);
            super.modifyTakenDamage(reducedDamage, fromCard, gameContext, continuation);
        });
    }

    getDescriptions() {
        let result = [getCreatureDescription(this), 'Если Громилу атакуют, получает на 1 урон меньше', ...super.getDescriptions()];
        return result;
    }
}

class Brewer extends Duck {
    constructor() {
        super('Brewer', 2);
    }

    doBeforeAttack(gameContext, continuation) {
        const {currentPlayer, oppositePlayer, updateView} = gameContext;
        const allCards = currentPlayer.table.concat(oppositePlayer.table);

        allCards.forEach(card => {
            if (isDuck(card)) {
                card.maxPower += 1;
                card.currentPower += 2;
                card.view.signalHeal();
                card.updateView();
            }
        });

        updateView();
        continuation();
    }
}


class Gatling extends Creature {
    constructor() {
        super('Gatling', 6);
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();
        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;

        taskQueue.push(onDone => this.view.showAttack(onDone));

        const enemyCards = oppositePlayer.table;

        if (enemyCards.length > 0) {
            enemyCards.forEach(card => {
                taskQueue.push(onDone => {
                    this.dealDamageToCreature(2, card, gameContext, onDone);
                });
            });
        }

        taskQueue.continueWith(continuation);
    }
}

class Lad extends Dog {
    constructor() {
        super();
    }

    static count = 0;

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => {
            const reducedDamage = Math.max(0, value - (Lad.count * (Lad.count + 1) / 2));
            console.log(reducedDamage);
            super.modifyTakenDamage(reducedDamage, fromCard, gameContext, continuation);
        });
    }

    modifyDealedDamageToCreature(value, toCard, gameContext, continuation) {
        const extendedDamage = Math.max(0, value + (Lad.count * (Lad.count + 1) / 2));
        console.log(extendedDamage);
        //super.modifyTakenDamage(extendedDamage, fromCard, gameContext, continuation);
        continuation(value);
    }

    doBeforeRemoving(continuation) {
        Lad.count -= 1;
        super.doBeforeRemoving(continuation);
        console.log(Lad.count);
    }

    doAfterComingIntoPlay(gameContext, continuation) {
        Lad.count += 1;
        super.doAfterComingIntoPlay(gameContext, continuation)
        console.log(Lad.count)
    }
}


// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [
    new Duck(),
    new Duck(),
    new Brewer(),
];
// Колода Бандита, верхнего игрока.
const banditStartDeck = [
    new Dog(),
    new PseudoDuck(),
    new Dog(),
];


// Создание игры.
const game = new Game(seriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(1);

// Запуск игры.
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});
