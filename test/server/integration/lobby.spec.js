const Lobby = require('../../../server/lobby.js');
const _ = require('underscore');

describe('lobby', function() {
    beforeEach(function() {
        this.socketSpy = jasmine.createSpyObj('socket', ['joinChannel', 'send']);
        this.ioSpy = jasmine.createSpyObj('io', ['set', 'use', 'on', 'emit']);
        this.routerSpy = jasmine.createSpyObj('router', ['on']);
        this.userSpy = jasmine.createSpyObj('User', ['getDetails']);
        this.userSpy.username = 'test';
        this.userSpy.getDetails.and.returnValue({ username: 'test' });

        this.socketSpy.user = this.userSpy;
        this.socketSpy.id = 'socket1';

        this.cardService = jasmine.createSpyObj('cardService', ['getTitleCards', 'getAllCards']);
        this.cardService.getTitleCards.and.returnValue(Promise.resolve([]));
        this.cardService.getAllCards.and.returnValue(Promise.resolve([]));

        this.lobby = new Lobby({}, { io: this.ioSpy, messageService: {}, cardService: this.cardService, deckService: {}, userService: {}, router: this.routerSpy, config: {} });
        this.lobby.socketsById[this.socketSpy.id] = this.socketSpy;
    });

    describe('onNewGame', function() {
        describe('when called once', function() {
            beforeEach(function() {
                this.lobby.onNewGame(this.socketSpy, {});
            });

            it('should create a new game with the player in it', function() {
                expect(_.size(this.lobby.gamesById)).toBe(1);
                var gamesArray = Object.values(this.lobby.gamesById);
                var player = gamesArray[0].playersByName['test'];

                expect(player.name).toBe('test');
            });
        });

        describe('when called twice', function() {
            beforeEach(function() {
                this.lobby.onNewGame(this.socketSpy, {});
                this.lobby.onNewGame(this.socketSpy, {});
            });

            it('should only create 1 game', function() {
                expect(_.size(this.lobby.gamesById)).toBe(1);
            });
        });
    });
});
