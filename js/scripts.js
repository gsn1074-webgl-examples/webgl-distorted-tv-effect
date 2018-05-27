var camera, scene, renderer;
var video, videoTexture, videoMaterial;
var composer;
var shaderTime = 0;
var badTVParams, badTVPass;
var staticParams, staticPass;
var rgbParams, rgbPass;
var filmParams, filmPass;
var renderPass, copyPass;
var pnoise, globalParams;
var textureLoader = new THREE.TextureLoader();
var mouseX = 0, mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

init();
animate();

function init() {

    camera = new THREE.PerspectiveCamera(55, 1080 / 720, 20, 3000);
    camera.position.z = 1000;
    scene = new THREE.Scene();

    //init video texture
    var bgTexture = textureLoader.load('./img/dark3.jpg');
    bgMaterial = new THREE.MeshBasicMaterial({
        map: bgTexture
    });

    //Add video plane
    var planeGeometry = new THREE.PlaneGeometry(1920, 1080, 1, 1);
    var plane = new THREE.Mesh(planeGeometry, bgMaterial);
    scene.add(plane);
    plane.z = 0;
    plane.scale.x = plane.scale.y = 1.45;

    //init renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(800, 600);
    document.body.appendChild(renderer.domElement);

    //POST PROCESSING
    //Create Shader Passes
    renderPass = new THREE.RenderPass(scene, camera);
    badTVPass = new THREE.ShaderPass(THREE.BadTVShader);
    rgbPass = new THREE.ShaderPass(THREE.RGBShiftShader);
    filmPass = new THREE.ShaderPass(THREE.FilmShader);
    copyPass = new THREE.ShaderPass(THREE.CopyShader);

    //set shader uniforms
    filmPass.uniforms.grayscale.value = 0;

    composer = new THREE.EffectComposer(renderer);
    composer.addPass(renderPass);
    composer.addPass(filmPass);
    composer.addPass(badTVPass);
    composer.addPass(rgbPass);
    composer.addPass(copyPass);
    copyPass.renderToScreen = true;

    params();

    window.addEventListener('resize', onResize, false);
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    onResize();

}

function onDocumentMouseMove(event) {
    mouseX = (event.clientX - windowHalfX);
    mouseY = (event.clientY - windowHalfY);
}

function params() {

    badTVPass.uniforms['distortion'].value = 1;
    badTVPass.uniforms['distortion2'].value = 0.5;
    badTVPass.uniforms['speed'].value = 0.07;
    badTVPass.uniforms['rollSpeed'].value = 0;

    rgbPass.uniforms['angle'].value = 0;
    rgbPass.uniforms['amount'].value = 0.0044;

    filmPass.uniforms['sCount'].value = 1000;
    filmPass.uniforms['sIntensity'].value = 0.6;
    filmPass.uniforms['nIntensity'].value = 0.4;
}

function animate() {

    camera.position.x += ((mouseX / 4) - camera.position.x) * 0.05;
    camera.position.y += (-(mouseY / 4) - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    shaderTime += 0.1;
    badTVPass.uniforms['time'].value = shaderTime;
    filmPass.uniforms['time'].value = shaderTime;

    requestAnimationFrame(animate);
    composer.render(0.1);
}

function onResize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}