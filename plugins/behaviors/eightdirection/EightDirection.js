'use strict'

const GetValue = Phaser.Utils.Objects.GetValue;
const AngleBetween = Phaser.Math.Angle.Between;
const RadToDeg = Phaser.Math.RadToDeg;

class EightDirection {
    constructor(gameObject, config) {
        this.gameObject = gameObject;
        this.scene = gameObject.scene;

        this.resetFromJSON(config);
        this.boot(config);
    }

    resetFromJSON(o) {
        this.setEnable(GetValue(o, 'enable', true));
        this.setMode(GetValue(o, 'dir', '8dir'));
        this.setSpeed(GetValue(o, 'speed', 200));
        this.setRotateToDirection(GetValue(o, 'rotateToDirection', false));
        this.setCursorKeys(GetValue(o, 'cursorKeys', undefined));
        this.tickMe = GetValue(o, 'tickMe', true); // true to enable 'update' callback
        return this;
    }

    toJSON() {
        return {
            tickMe: this.tickMe
        };
    }

    boot(config) {
        if (this.gameObject.on) { // oops, bob object does not have event emitter
            this.gameObject.on('destroy', this.destroy, this);
        }

        if (this.tickMe) {
            this.scene.events.on('update', this.update, this);
        }
    }

    shutdown() {
        if (this.tickMe) {
            this.scene.events.off('update', this.update, this);
        }
        this.gameObject = undefined;
        this.scene = undefined;
    }

    destroy() {
        this.shutdown();
    }

    setEnable(e) {
        if (e == undefined) {
            e = true;
        } else {
            e = !!e;
        }
        if (e === this.enable) {
            return;
        }
        this.enable = e;
    }

    setMode(m) {
        if (typeof (m) === 'string') {
            m = DIRMODE[m];
        }
        this.dirMode = m;
        return this;
    }

    setSpeed(speed) {
        this.speed = speed;
        return this;
    }

    setRotateToDirection(rotateToDirection) {
        this.rotateToDirection = rotateToDirection;
        return this;
    }

    setCursorKeys(cursorKeys) {
        if (cursorKeys === undefined) {
            cursorKeys = this.scene.input.keyboard.createCursorKeys();
        }
        this.cursorKeys = cursorKeys;
        return this;
    }

    update(time, delta) {
        var body = this.gameObject.body;
        if (!this.enable) {
            body.setVelocity(0, 0);
            return this;
        }
        var cursorKeys = this.cursorKeys;
        var isUpDown = cursorKeys.up.isDown;
        var isDownDown = cursorKeys.down.isDown;
        var isLeftDown = cursorKeys.left.isDown;
        var isRightDown = cursorKeys.right.isDown;
        var dx = 0,
            dy = 0;
        if (isUpDown) {
            dy -= 1;
        }
        if (isDownDown) {
            dy += 1;
        }
        if (isLeftDown) {
            dx -= 1;
        }
        if (isRightDown) {
            dx += 1;
        }
        switch (this.dirMode) {
            case 0:
                dx = 0;
                break;
            case 1:
                dy = 0;
                break;
            case 2:
                if (dy !== 0) {
                    dx = 0
                }
                break;
        }

        if ((dx === 0) && (dy === 0)) {
            body.setVelocity(0, 0);
            return this;
        }
        var rotation = AngleBetween(0, 0, dx, dy);
        var vx = this.speed * Math.cos(rotation),
            vy = this.speed * Math.sin(rotation);
        body.setVelocity(vx, vy);
        if (this.rotateToDirection) {
            this.gameObject.rotation = rotation;
        }
        return this;
    }
}

/** @private */
const DIRMODE = {
    'up&down': 0,
    'left&right': 1,
    '4dir': 2,
    '8dir': 3
};

export default EightDirection;