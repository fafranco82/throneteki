const AbilityMessage = require('../../server/game/AbilityMessage');

describe('AbilityMessage', function() {
    beforeEach(function() {
        this.outputterSpy = jasmine.createSpyObj('outputter', ['addMessage', 'addAlert']);
        this.context = {
            player: 'PLAYER_OBJ',
            source: 'SOURCE_OBJ',
            target: 'TARGET_OBJ'
        };
    });

    describe('.create()', function() {
        describe('when nothing is passed in', function() {
            it('creates a nullable message', function() {
                let message = AbilityMessage.create(null);
                message.output(this.outputterSpy, this.context);

                expect(this.outputterSpy.addMessage).not.toHaveBeenCalled();
            });
        });

        describe('when a function is passed', function() {
            it('creates an object that wraps the function', function() {
                let spy = jasmine.createSpy('outputFunc');
                let message = AbilityMessage.create(spy);
                message.output(this.outputterSpy, this.context);

                expect(spy).toHaveBeenCalledWith(this.context);
            });
        });

        describe('when just a format string is passed', function() {
            it('creates a message with the specified format and no extra args', function() {
                let message = AbilityMessage.create('{player} uses {source} to kill {target}');
                message.output(this.outputterSpy, this.context);

                expect(this.outputterSpy.addMessage).toHaveBeenCalledWith('{0} uses {1} to kill {2}', 'PLAYER_OBJ', 'SOURCE_OBJ', 'TARGET_OBJ');
            });
        });

        describe('when a property object is passed', function() {
            it('creates a message with the specified properties', function() {
                let message = AbilityMessage.create({
                    format: '{player} uses {source} to place {target} in {targetOwner}\'s discard pile',
                    args: {
                        targetOwner: () => 'TARGET_OWNER_OBJ'
                    }
                });
                message.output(this.outputterSpy, this.context);

                expect(this.outputterSpy.addMessage).toHaveBeenCalledWith('{0} uses {1} to place {2} in {3}\'s discard pile', 'PLAYER_OBJ', 'SOURCE_OBJ', 'TARGET_OBJ', 'TARGET_OWNER_OBJ');
            });
        });
    });

    describe('constructor', function() {
        describe('when the format includes arguments that are not passed', function() {
            it('throws an exception', function() {
                expect(function() {
                    new AbilityMessage({
                        format: '{player} does {foo}',
                        args: {
                        }
                    });
                }).toThrow();
            });
        });
    });

    describe('output()', function() {
        describe('when there are no additional args', function() {
            beforeEach(function() {
                this.message = new AbilityMessage({
                    format: '{player} uses {source} to kill {target}'
                });
                this.message.output(this.outputterSpy, this.context);
            });

            it('translates named arguments to their numeric values', function() {
                expect(this.outputterSpy.addMessage).toHaveBeenCalledWith('{0} uses {1} to kill {2}', jasmine.anything(), jasmine.anything(), jasmine.anything());
            });

            it('passes the arguments in the correct order', function() {
                expect(this.outputterSpy.addMessage).toHaveBeenCalledWith(jasmine.any(String), 'PLAYER_OBJ', 'SOURCE_OBJ', 'TARGET_OBJ');
            });
        });

        describe('when there are additional args', function() {
            beforeEach(function() {
                this.message = new AbilityMessage({
                    format: '{player} uses {source} to place {target} in {targetOwner}\'s {targetLocation}',
                    args: {
                        targetLocation: () => 'TARGET_LOCATION_OBJ',
                        targetOwner: () => 'TARGET_OWNER_OBJ'
                    }
                });
                this.message.output(this.outputterSpy, this.context);
            });

            it('translates named arguments to their numeric values', function() {
                expect(this.outputterSpy.addMessage).toHaveBeenCalledWith('{0} uses {1} to place {2} in {4}\'s {3}', jasmine.anything(), jasmine.anything(), jasmine.anything(), jasmine.anything(), jasmine.anything());
            });

            it('passes the arguments in the correct order', function() {
                expect(this.outputterSpy.addMessage).toHaveBeenCalledWith(jasmine.any(String), 'PLAYER_OBJ', 'SOURCE_OBJ', 'TARGET_OBJ', 'TARGET_LOCATION_OBJ', 'TARGET_OWNER_OBJ');
            });
        });

        describe('when the type property is sent', function() {
            beforeEach(function() {
                this.message = new AbilityMessage({
                    format: '{player} uses {source} to kill {target}',
                    type: 'danger'
                });
                this.message.output(this.outputterSpy, this.context);
            });

            it('uses the addAlert method', function() {
                expect(this.outputterSpy.addAlert).toHaveBeenCalledWith('danger', '{0} uses {1} to kill {2}', 'PLAYER_OBJ', 'SOURCE_OBJ', 'TARGET_OBJ');
            });
        });
    });
});
