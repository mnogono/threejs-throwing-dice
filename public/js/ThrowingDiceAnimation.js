function ThrowingDiceAnimation(option) {
    if (!Detector.webgl) Detector.addGetWebGLMessage();

    //parent container
    this.parent = option.parent;

    this.objectDesiredSides = [
        {
            name: "Cube_000",
            side: 6
        },
        {
            name: "Cube_001",
            side: 6
        }
    ];

    this.modelName = '/scene/scene.dae';
    this.loopAnimation = false;
    this.animationTimeSeconds = 8;

    // CUBE SIDES ORIENTATION
    this.sidesRotation = {
        1: [Math.PI / 2, 0, 0],
        2: [0, Math.PI / 2, 0],
        3: [0, 0, 0],
        4: [0, -Math.PI / 2, 0],
        5: [-Math.PI / 2, 0, 0],
        6: [Math.PI, 0, 0]
    };

    this.lastTimestamp = 0;

    this.loadScene();
}

ThrowingDiceAnimation.prototype.play = function(side1, side2) {
    this.lastTimestamp = 0;
    this.progress = 0;

    this.objectDesiredSides[0].side = parseInt(side1);
    this.objectDesiredSides[1].side = parseInt(side2);

    //restore original matrix of cubes
    var cube1 = this.scene.getObjectByName("Cube_000_endSide5");
    cube1.children[0].matrix = new THREE.Matrix4();
    cube1.children[0].updateMatrix();
    cube1.matrix.copy(this.originalMatrix1);
    cube1.updateMatrix();

    var cube2 = this.model.getObjectByName("Cube_001_endSide4");
    cube2.children[0].matrix = new THREE.Matrix4();
    cube2.children[0].updateMatrix();
    cube2.matrix.copy(this.originalMatrix2);
    cube2.updateMatrix();

    //rotate cubes to display correct values
    this.objectDesiredSides.forEach(function (objectInfo) {
        this.scene.traverse(function (o) {
            if (o.colladaId && o.colladaId.indexOf(objectInfo.name) !== -1) {
                this.rotateCubeObject(o, objectInfo.side);
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

    //save original matrix of cubes

    var cube1 = this.model.getObjectByName("Cube_000_endSide5");
    this.originalMatrix1 = new THREE.Matrix4();
    this.originalMatrix1.copy(cube1.matrix);

    var cube2 = this.model.getObjectByName("Cube_001_endSide4");
    this.originalMatrix2 = new THREE.Matrix4();
    this.originalMatrix2.copy(cube2.matrix);

    /*
    this.objectDesiredSides.forEach(function (objectInfo) {
        this.model.traverse(function (o) {
            if (o.colladaId && o.colladaId.indexOf(objectInfo.name) !== -1) {
                this.rotateCubeObject(o, objectInfo.side);
            }
        }.bind(this));
    }, this);
    */

    this.scene.add(this.model);

    // Renderer

    this.renderer = new THREE.WebGLRenderer({antialias: true});
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

ThrowingDiceAnimation.prototype.rotateCubeObject = function(cubeObject, desiredSide) {
    var currentSide = this.getCurrentSide(cubeObject);

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