AFRAME.registerComponent("orbit-camera", {
  schema: {
    target: { type: "selector" },
    distance: { default: 15 },
    minDistance: { default: 5 },
    maxDistance: { default: 25 },
    initialAzimuth: { default: 34 },
    initialElevation: { default: 25 },
    minElevation: { default: 0 },
    maxElevation: { default: 90 },
    rotationSpeed: { default: 0.25 },
    zoomSpeed: { default: 0.01 },
    smoothing: { default: 12 },
  },

  init() {
    this.pivot = this.el.querySelector("[data-orbit-pivot]");
    this.camera = this.el.querySelector("[camera]");
    this.isDragging = false;

    this.azimuth = THREE.MathUtils.degToRad(this.data.initialAzimuth);
    this.elevation = THREE.MathUtils.degToRad(this.data.initialElevation);
    this.targetAzimuth = this.azimuth;
    this.targetElevation = this.elevation;
    this.distance = this.data.distance;
    this.targetDistance = this.distance;

    this.onPointerDown = (event) => {
      if (event.button !== 0) return;

      this.isDragging = true;
      this.previousPointerX = event.clientX;
      this.previousPointerY = event.clientY;
      this.canvas.style.cursor = "grabbing";
      event.preventDefault();
    };

    this.onPointerMove = (event) => {
      if (!this.isDragging) return;

      const movementX = event.clientX - this.previousPointerX;
      const movementY = event.clientY - this.previousPointerY;
      const rotationSpeed = THREE.MathUtils.degToRad(this.data.rotationSpeed);

      this.targetAzimuth -= movementX * rotationSpeed;
      this.targetElevation -= movementY * rotationSpeed;

      const minimum = THREE.MathUtils.degToRad(this.data.minElevation);
      const maximum = THREE.MathUtils.degToRad(this.data.maxElevation);
      this.targetElevation = THREE.MathUtils.clamp(
        this.targetElevation,
        minimum,
        maximum,
      );

      this.previousPointerX = event.clientX;
      this.previousPointerY = event.clientY;
    };

    this.onPointerUp = () => {
      this.isDragging = false;
      if (this.canvas) this.canvas.style.cursor = "grab";
    };

    this.onWheel = (event) => {
      event.preventDefault();

      this.targetDistance = THREE.MathUtils.clamp(
        this.targetDistance + event.deltaY * this.data.zoomSpeed,
        this.data.minDistance,
        this.data.maxDistance,
      );
    };

    this.onRenderTargetLoaded = () => this.attachControls();

    if (this.el.sceneEl.canvas) {
      this.attachControls();
    } else {
      this.el.sceneEl.addEventListener(
        "render-target-loaded",
        this.onRenderTargetLoaded,
      );
    }
  },

  attachControls() {
    if (this.canvas) return;

    this.canvas = this.el.sceneEl.canvas;
    this.canvas.style.cursor = "grab";
    this.canvas.addEventListener("pointerdown", this.onPointerDown);
    this.canvas.addEventListener("wheel", this.onWheel, { passive: false });
    window.addEventListener("pointermove", this.onPointerMove);
    window.addEventListener("pointerup", this.onPointerUp);
  },

  tick(time, timeDelta) {
    if (!timeDelta || !this.data.target || !this.pivot || !this.camera) return;

    const deltaTime = Math.min(timeDelta / 1000, 0.05);
    const smoothFactor = 1 - Math.exp(-this.data.smoothing * deltaTime);

    // L'orbite et le zoom rejoignent progressivement les valeurs demandées.
    this.azimuth = THREE.MathUtils.lerp(
      this.azimuth,
      this.targetAzimuth,
      smoothFactor,
    );
    this.elevation = THREE.MathUtils.lerp(
      this.elevation,
      this.targetElevation,
      smoothFactor,
    );
    this.distance = THREE.MathUtils.lerp(
      this.distance,
      this.targetDistance,
      smoothFactor,
    );

    // Le rig reste centré sur le cube pendant ses déplacements et ses sauts.
    this.el.object3D.position.copy(this.data.target.object3D.position);
    this.el.object3D.rotation.y = this.azimuth;
    this.pivot.object3D.rotation.x = -this.elevation;
    this.camera.object3D.position.z = this.distance;
  },

  remove() {
    this.el.sceneEl.removeEventListener(
      "render-target-loaded",
      this.onRenderTargetLoaded,
    );

    if (this.canvas) {
      this.canvas.removeEventListener("pointerdown", this.onPointerDown);
      this.canvas.removeEventListener("wheel", this.onWheel);
    }

    window.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("pointerup", this.onPointerUp);
  },
});
