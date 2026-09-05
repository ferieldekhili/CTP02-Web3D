AFRAME.registerComponent("player-movement", {
  dependencies: ["geometry"],

  schema: {
    camera: { type: "selector" },
    ground: { type: "selector" },
    acceleration: { default: 14 },
    deceleration: { default: 18 },
    maxSpeed: { default: 6 },
    jumpSpeed: { default: 7 },
  },

  init() {
    this.keys = {};
    this.direction = new THREE.Vector3();
    this.cameraForward = new THREE.Vector3();
    this.cameraRight = new THREE.Vector3();
    this.cameraQuaternion = new THREE.Quaternion();
    this.jumpRequested = false;
    this.canJump = false;

    // La face inférieure du cube est placée exactement sur le sol.
    const cubeHeight = this.el.components.geometry.data.height;
    this.groundY = cubeHeight / 2;
    this.el.object3D.position.y = this.groundY;

    this.onBodyLoaded = () => {
      const body = this.el.body;

      // Empêche les collisions de faire basculer le joueur.
      body.fixedRotation = true;
      body.angularDamping = 1;
      body.angularVelocity.set(0, 0, 0);
      body.allowSleep = false;
      body.updateMassProperties();
    };

    this.onKeyDown = (event) => {
      this.keys[event.code] = true;

      if (event.code === "Space") {
        event.preventDefault();

        if (!event.repeat) {
          this.jumpRequested = true;
        }
      }
    };

    this.onKeyUp = (event) => {
      this.keys[event.code] = false;
    };

    this.onWindowBlur = () => {
      this.keys = {};
      this.jumpRequested = false;
    };

    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("blur", this.onWindowBlur);
    this.el.addEventListener("body-loaded", this.onBodyLoaded);

    if (this.el.body) this.onBodyLoaded();
  },

  tick(time, timeDelta) {
    const body = this.el.body;
    if (!timeDelta || !body) return;

    // Le delta time rend le mouvement indépendant du nombre d'images par seconde.
    const deltaTime = Math.min(timeDelta / 1000, 0.05);

    const sidewaysInput =
      Number(Boolean(this.keys.KeyD)) - Number(Boolean(this.keys.KeyA));
    const forwardInput =
      Number(Boolean(this.keys.KeyW)) - Number(Boolean(this.keys.KeyS));

    // L'avant et la droite suivent l'orientation horizontale de la caméra.
    this.cameraForward.set(0, 0, -1);
    if (this.data.camera) {
      this.data.camera.object3D.getWorldQuaternion(this.cameraQuaternion);
      this.cameraForward.applyQuaternion(this.cameraQuaternion);
    }
    this.cameraForward.y = 0;
    this.cameraForward.normalize();
    this.cameraRight.set(
      -this.cameraForward.z,
      0,
      this.cameraForward.x,
    );

    this.direction
      .copy(this.cameraForward)
      .multiplyScalar(forwardInput)
      .addScaledVector(this.cameraRight, sidewaysInput);

    // Évite que le déplacement diagonal soit plus rapide.
    const isMoving = this.direction.lengthSq() > 0;
    if (isMoving) this.direction.normalize();

    const targetVelocityX = this.direction.x * this.data.maxSpeed;
    const targetVelocityZ = this.direction.z * this.data.maxSpeed;
    const speedChange =
      (isMoving ? this.data.acceleration : this.data.deceleration) * deltaTime;

    // La vitesse rejoint progressivement la vitesse souhaitée.
    body.velocity.x = this.moveTowards(
      body.velocity.x,
      targetVelocityX,
      speedChange,
    );
    body.velocity.z = this.moveTowards(
      body.velocity.z,
      targetVelocityZ,
      speedChange,
    );

    // Le saut ne démarre que si le cube touche le sol.
    const isGrounded = this.hasGroundContact(body);
    if (isGrounded && body.velocity.y <= 0.2) {
      this.canJump = true;
    }

    if (this.jumpRequested && this.canJump) {
      body.velocity.y = this.data.jumpSpeed;
      this.canJump = false;
    }
    this.jumpRequested = false;

    // Réveille le corps pour appliquer immédiatement les changements de vitesse.
    body.wakeUp();
  },

  moveTowards(currentValue, targetValue, maximumChange) {
    const difference = targetValue - currentValue;

    if (Math.abs(difference) <= maximumChange) {
      return targetValue;
    }

    return currentValue + Math.sign(difference) * maximumChange;
  },

  hasGroundContact(body) {
    const groundBody = this.data.ground && this.data.ground.body;
    if (!groundBody || !body.world) return false;

    return body.world.contacts.some(
      (contact) =>
        (contact.bi === body && contact.bj === groundBody) ||
        (contact.bj === body && contact.bi === groundBody),
    );
  },

  remove() {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("blur", this.onWindowBlur);
    this.el.removeEventListener("body-loaded", this.onBodyLoaded);
  },
});
