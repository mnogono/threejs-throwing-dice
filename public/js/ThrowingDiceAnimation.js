function ThrowingDiceAnimation(option) {
    if (!Detector.webgl) Detector.addGetWebGLMessage();

    //parent container
    this.parent = option.parent;

    this.objectDesiredSides = [
        {
            name: "Cube_000",
            currentSide: 0,
            desiredSide: 0
        },
        {
            name: "Cube_001",
            currentSide: 0,
            desiredSide: 0
        }
    ];

    this.modelName = '/scene/red-cubes-transparent.dae';
    this.loopAnimation = false;
    this.animationTimeSeconds = 8;

    // CUBE SIDES ORIENTATION
    this.sidesRotation = {
        1: [0, Math.PI / 2, 0],
        2: [-Math.PI / 2, 0, 0],
        3: [0, 0, 0],
        4: [Math.PI, 0, 0],
        5: [Math.PI / 2, 0, 0],
        6: [0, -Math.PI / 2, 0]
    };

    this.lastTimestamp = 0;

    this.loadScene();
}

ThrowingDiceAnimation.prototype.play = function(side1, side2) {
    if(!this.scene) return;

    this.lastTimestamp = 0;
    this.progress = 0;

    this.objectDesiredSides[0].desiredSide = parseInt(side1);
    this.objectDesiredSides[1].desiredSide = parseInt(side2);

    //rotate cubes to display correct values
    this.objectDesiredSides.forEach(function (objectInfo) {
        this.scene.traverse(function (o) {
            if (o.colladaId && o.colladaId.indexOf(objectInfo.name) !== -1) {
                this.rotateCubeObject(o, objectInfo);
            }
        }.bind(this));
    }, this);

    this.start();
    this.animate(this.lastTimestamp);
};

ThrowingDiceAnimation.prototype.start = function() {
    for (var i = 0; i < this.kfAnimationsLength; ++i) {

        var animation = this.kfAnimations[i];

        for (var h = 0, hl = animation.hierarchy.length; h < hl; h++) {

            var keys = animation.data.hierarchy[h].keys;
            var sids = animation.data.hierarchy[h].sids;
            var obj = animation.hierarchy[h];

            if (keys.length && sids) {

                for (var s = 0; s < sids.length; s++) {

                    var sid = sids[s];
                    var next = animation.getNextKeyWith(sid, h, 0);

                    if (next) next.apply(sid);

                }

                obj.matrixAutoUpdate = false;
                animation.data.hierarchy[h].node.updateMatrix();
                obj.matrixWorldNeedsUpdate = true;

            }

        }

        animation.loop = this.loopAnimation;
        animation.play();
    }
};

ThrowingDiceAnimation.prototype.animate = function(timestamp) {

    var frameTime = ( timestamp - this.lastTimestamp ) * 0.001;

    if (this.progress >= 0 && this.progress < this.animationTimeSeconds) {

        for (var i = 0; i < this.kfAnimationsLength; ++i) {

            this.kfAnimations[i].update(frameTime);

        }

    } else if (this.progress >= this.animationTimeSeconds) {

        for (var i = 0; i < this.kfAnimationsLength; ++i) {

            this.kfAnimations[i].stop();

        }

        this.progress = 0;
        this.start();
    }

    this.progress += frameTime;
    this.lastTimestamp = timestamp;
    this.renderer.render(this.scene, this.camera);
    //stats.update();
    requestAnimationFrame(this.animate.bind(this));
};

ThrowingDiceAnimation.prototype.loadScene = function() {
    this.stats;
    this.scene;
    this.camera;
    this.renderer;
    this.model;
    this.animations;
    this.kfAnimations = [];
    this.kfAnimationsLength = 0;
    this.lastTimestamp = 0;
    this.progress = 0;

    loader = new THREE.ColladaLoader();
    loader.options.upAxis = "Z";

    loader.load(this.modelName, function (collada) {
        this.model = collada.scene;
        this.animations = collada.animations;
        this.kfAnimationsLength = this.animations.length;
        this.model.scale.x = this.model.scale.y = this.model.scale.z = 1;

        this.initScene();
    }.bind(this));
};

ThrowingDiceAnimation.prototype.initScene = function() {
    // Scene

    this.scene = new THREE.Scene();

    // Camera

    //remove camera from and invisible pane from model, and create new camera with the same position
    var _camera = this.model.getObjectByName("Camera");

    this.camera = new THREE.PerspectiveCamera(_camera.children[0].fov, this.parent.offsetWidth / this.parent.offsetHeight, 0.01, 1000);
    this.camera.matrix = _camera.matrix;
    this.camera.matrix.decompose(this.camera.position, this.camera.quaternion, this.camera.scale);

    this.model.children = this.model.children.filter(function (o) {
        return o.colladaId != "Camera" && o.colladaId != "Plane_001";
    });

    // KeyFrame Animations

    for (var i = 0; i < this.kfAnimationsLength; ++i) {

        var animation = this.animations[i];

        var kfAnimation = new THREE.KeyFrameAnimation(animation);
        kfAnimation.timeScale = 1;
        this.kfAnimations.push(kfAnimation);
    }

    this.scene.add(this.model);

    // Renderer

    this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    //this.renderer.setClearColor(new THREE.Color(1, 1, 1), 0.5);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.parent.offsetWidth, this.parent.offsetHeight);
    this.parent.appendChild(this.renderer.domElement);
    //container.appendChild(renderer.domElement);

    // Stats

    //stats = new Stats();
    //container.appendChild(stats.dom);

    var onWindowResize = function() {
        this.camera.aspect = this.parent.offsetWidth / this.parent.offsetHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.parent.offsetWidth, this.parent.offsetHeight);
    }.bind(this);

    window.addEventListener('resize', onWindowResize, false);
};

ThrowingDiceAnimation.prototype.rotateCubeObject = function(cubeObject, objectInfo) {
    var currentSide = objectInfo.currentSide;
    var desiredSide = objectInfo.desiredSide;

    if (!currentSide) {
        currentSide = this.getCurrentSide(cubeObject);
    }

    if(!desiredSide) return;

    var currentSideRotation = this.getSideRotation(currentSide);
    var desiredSideRotation = this.getSideRotation(desiredSide);
    // rotate from current side to source side
    cubeObject.children[0].rotateX(-currentSideRotation[0]);
    cubeObject.children[0].rotateY(-currentSideRotation[1]);
    cubeObject.children[0].rotateZ(-currentSideRotation[2]);
    // rotate from source side to desired side
    cubeObject.children[0].rotateX(desiredSideRotation[0]);
    cubeObject.children[0].rotateY(desiredSideRotation[1]);
    cubeObject.children[0].rotateZ(desiredSideRotation[2]);

    objectInfo.currentSide = desiredSide;
};

ThrowingDiceAnimation.prototype.getCurrentSide = function(cubeObject) {
    var currentSide = 0;

    var id = cubeObject.colladaId;
    var sideFlagString = "endSide";
    if (id.indexOf(sideFlagString) === -1) {
        return currentSide;
    }

    currentSide = id.substr(id.indexOf(sideFlagString) + (sideFlagString.length), 1);

    return currentSide;
};

ThrowingDiceAnimation.prototype.getSideRotation = function(side) {
    return this.sidesRotation[side];
};