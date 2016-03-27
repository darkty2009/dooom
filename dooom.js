var size = {
    width:window.innerWidth,
    height:window.innerHeight
};
var config = {
    speed:4,
    rotate:2,
    bullet:10
};

var canvas = document.getElementById('dooom');

if(!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'dooom';
    document.body.appendChild(canvas);
}

canvas.width = size.width;
canvas.height = size.height;
canvas.globalCompositeOperation = 'lighter'; // lighter

var context = canvas.getContext('2d');
context.fillStyle = 'rgba(0, 0, 0, 0)';
context.fillRect(0, 0, canvas.width, canvas.height);

function clear() {
    context.globalAlpha=0.3;
    context.fillStyle="#fff";
    context.fillRect(0,0,size.width, size.height);
}

var Plane = function(shape) {
    this.x = 40;
    this.y = size.height/2;
    this.shape = shape;
    this.rotate = 0;
    this.update();
};
Plane.prototype.update = function() {
    this.shape.update(this);
};

var Bullet = function() {
    this.x = 0;
    this.y = 0;
    this.history = [];
    this.rotate = 0;
    this.radius = 2;
};
Bullet.prototype = {
    update:function() {
        //context.rotate(this.rotate * Math.PI / 180);
        this.y -= config.bullet * Math.cos(this.rotate * Math.PI / 180);
        this.x += config.bullet * Math.sin(this.rotate * Math.PI / 180);
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
        context.closePath();
        context.fill();
        //context.rotate(-1 * this.rotate * Math.PI / 180);
    },
    border:function() {
        this.boom();
        if(this.x < 0 || this.y < 0 || this.x > size.width || this.y > size.height) {
            return true;
        }
    },
    boom:function() {

    }
};

var bullets = {
    list:[],
    timer:0,
    init:function(plane) {
        this.plane = plane;
    },
    shoot:function() {
        this.create.throttle(120).call(this);
    },
    create:function() {
        var bullet = new Bullet();
        bullet.x = bullets.plane.x;
        bullet.y = bullets.plane.y;
        bullet.rotate = bullets.plane.rotate;
        bullets.list.push(bullet);
    },
    update:function() {
        for(var i=0;i<this.list.length;i++) {
            this.list[i].update();
            if(this.list[i].border()) {
                this.list[i] = null;
                this.list.splice(i, 1);
                i--;
            }
        }
    }
};

var shapes = {
    plane:function() {
        this.width = 32;
        this.height = 48;
        this.update = function(plane) {
            context.fillStyle = 'rgba(0, 0, 0, 0.5)';
            context.translate(plane.x, plane.y);
            context.rotate(plane.rotate * Math.PI / 180);
            context.beginPath();
            context.moveTo(0, - this.height/2);
            context.lineTo(- this.width/2, this.height/2);
            context.lineTo(this.width/2, this.height/2);
            context.lineTo(0, - this.height/2);
            context.closePath();
            context.fill();
            context.rotate(-1 * plane.rotate * Math.PI / 180);
            context.translate(-1 * plane.x, -1 * plane.y);
        };
    }
};

var KeyManager = {
    map:{},
    start:function() {
        document.addEventListener('keyup', this.keyUpHandler);
        document.addEventListener('keydown', this.keyDownHandler);
    },
    stop:function() {
        document.removeEventListener('keyup', this.keyUpHandler);
        document.removeEventListener('keydown', this.keyDownHandler);
    },
    keyUpHandler:function(e) {
        KeyManager.map[e.keyCode] = false;
    },
    keyDownHandler:function(e) {
        KeyManager.map[e.keyCode] = true;
    }
};

// main loop
var Shape = shapes.plane;
var plane = new Plane(new Shape());
bullets.init(plane);


KeyManager.start();

function render() {
    clear();

    // up38 Down40 Left37 Right39 Space32
    // W87 S83 A65 D68 J74
    if(KeyManager.map[65]) {
        plane.rotate -= config.rotate;
    }
    if(KeyManager.map[68]) {
        plane.rotate += config.rotate;
    }
    if(KeyManager.map[87]) {
        plane.y -= config.speed * Math.cos(plane.rotate * Math.PI / 180);
        plane.x += config.speed * Math.sin(plane.rotate * Math.PI / 180);
    }
    if(KeyManager.map[83]) {
        plane.y += config.speed * Math.cos(plane.rotate * Math.PI / 180);
        plane.x -= config.speed * Math.sin(plane.rotate * Math.PI / 180);
    }
    if(KeyManager.map[74]) {
        bullets.shoot();
    }

    plane.update();
    bullets.update();
    requestAnimationFrame(render);
}
requestAnimationFrame(render);