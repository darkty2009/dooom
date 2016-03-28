var throttle = function(delay, action){
    var last = 0;
    return function(){
        var curr = Date.now();
        if (curr - last > delay){
            action.apply(this, arguments)
            last = curr;
        }
    }
}

var size = {
    width:window.innerWidth,
    height:window.innerHeight
};
var config = {
    speed:4,
    rotate:2,
    bullet:10,
    over:false
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

var score = {
    init:function() {
        this.number = 0;
        if(!this.node) {
            this.node = document.createElement('h1');
            this.node.id = 'dooom-score';
            this.node.innerText = this.number;
            document.body.appendChild(this.node);
        }
    },
    add:function(num) {
        this.number += num;
        this.node.innerText = this.number.toFixed(0);
    },
    over:function() {
        config.over = true;
        alert("你摧毁了" + window.title + "，最高分数：" + this.number);
    },
    destroy:function(element) {
        if(element.id != 'dooom' && element.id != 'dooom-score') {
            this.add(Math.sqrt(element.clientWidth * element.clientHeight));
            element.parentNode.removeChild(element);
            return true;
        }
        return false;
    },
    check:function(x, y) {
        var checked = false;
        var element = document.elementFromPoint(x, y);
        element && (element.style.overflow = 'visible');
        if(element && element.clientWidth && element.clientHeight) {
            if(element.children.length) {
                var isShow = Array.prototype.concat.apply([], element.children).some(function(child) {
                    return child.clientWidth > 16 && child.clientHeight > 16;
                });
                if(!isShow) {
                    checked = this.destroy(element);
                }
            }else {
                checked = this.destroy(element);
            }
        }

        var yet = Array.prototype.concat.apply([], document.body.children).some(function(child) {
            return child.tagName.toLowerCase() != 'script' &&
                    child.tagName.toLowerCase() != 'link' &&
                    child.tagName.toLowerCase() != 'style' &&
                    child.id != 'dooom' &&
                    child.id != 'dooom-score' &&
                    child.clientWidth > 0 &&
                    child.clientHeight > 0 &&
                    child.style.display != 'none';
        });

        if(!yet) {
            this.over();
        }

        return checked;
    }
};

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
        context.fillStyle = '#d90000';
        context.fill();
        //context.rotate(-1 * this.rotate * Math.PI / 180);
    },
    border:function() {
        if(this.x < 0 || this.y < 0 || this.x > size.width || this.y > size.height || this.boom()) {
            return true;
        }
    },
    boom:function() {
        return score.check(this.x, this.y)
    }
};

var bullets = {
    list:[],
    timer:0,
    init:function(plane) {
        this.plane = plane;
    },
    shoot:function() {
        if(!this.throttle_shoot) {
            this.throttle_shoot = throttle(120, this.create);
        }
        this.throttle_shoot();
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
score.init();


KeyManager.start();

function render() {
    if(config.over) {
        return;
    }

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

window.addEventListener('resize', function() {
    size = {
        width:window.innerWidth,
        height:window.innerHeight
    };

    canvas.width = size.width;
    canvas.height = size.height;
});