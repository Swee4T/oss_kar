// 🏆 WORLD-CLASS 3D CAR VIEWER 2025 
// Inspired by Tesla, Porsche, BMW configurators

$(document).ready(function() {
    console.log('🚗 Initializing Premium Car Viewer...');
    initWorldClassViewer();
});

function initWorldClassViewer() {
    const container = document.getElementById('threejs-container');
    if (!container) {
        console.error('❌ Container not found');
        return;
    }
    
    const width = container.offsetWidth;
    const height = container.offsetHeight;
    
    // 🎬 SCENE - Professional Studio Setup
    const scene = new THREE.Scene();
    
    // 📷 CAMERA - Auto Focus Perspective
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(4, 2, 6); // ✅ NÄHER dran!
    
    // 🎨 RENDERER - Ultra Quality
    const renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: false,
        powerPreference: "high-performance"
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);
    
    // 🌟 LIGHTING - Studio Perfect
    // Ambient light for general illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    // Key light - main illumination
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
    keyLight.position.set(10, 10, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.setScalar(2048);
    keyLight.shadow.camera.near = 0.1;
    keyLight.shadow.camera.far = 50;
    keyLight.shadow.camera.left = -10;
    keyLight.shadow.camera.right = 10;
    keyLight.shadow.camera.top = 10;
    keyLight.shadow.camera.bottom = -10;
    scene.add(keyLight);
    
    // Fill light - soften shadows
    const fillLight = new THREE.DirectionalLight(0x87ceeb, 0.4);
    fillLight.position.set(-5, 5, -5);
    scene.add(fillLight);
    
    // Rim light - edge definition
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.3);
    rimLight.position.set(0, 5, -10);
    scene.add(rimLight);
    
    // 🏞️ ENVIRONMENT - Premium Studio
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    
    // Create studio environment
    const studioEnvironment = pmremGenerator.fromScene(new THREE.Scene()).texture;
    scene.environment = studioEnvironment;
    
    // Background gradient
    scene.background = new THREE.Color(0xf5f5f5);
    
    // 🎮 CONTROLS - Smooth Interaction
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 3;
    controls.maxDistance = 15;
    controls.maxPolarAngle = Math.PI * 0.75;
    controls.enablePan = false;
    controls.autoRotate = false;
    
    // 🚗 LOAD CAR MODEL
    const loader = new THREE.GLTFLoader();
    
    // Show loading
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.style.display = 'block';
    }
    
    loader.load('1998_audi_tt_8n_lpmp/scene.gltf', 
        function(gltf) {
            console.log('✅ Car model loaded successfully');
            
            const car = gltf.scene;
            
            // 📏 AUTO-SCALE & CENTER
            const box = new THREE.Box3().setFromObject(car);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            
            // Center the model
            car.position.sub(center);
            
            // Scale to LARGE size - Auto dominiert!
            const maxDim = Math.max(size.x, size.y, size.z);
            const targetSize = 6; // ✅ VIEL GRÖßER!
            const scale = targetSize / maxDim;
            car.scale.setScalar(scale);
            
            // Position on ground
            const newBox = new THREE.Box3().setFromObject(car);
            car.position.y = -newBox.min.y;
            
            // Slight rotation for presentation
            car.rotation.y = Math.PI * 0.1;
            
            // 🎨 ENHANCE MATERIALS
            car.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    
                    if (child.material) {
                        // Enhance material properties
                        child.material.envMapIntensity = 1.0;
                        child.material.needsUpdate = true;
                    }
                }
            });
            
            // 🏁 STUDIO FLOOR
            const floorGeometry = new THREE.PlaneGeometry(20, 20);
            const floorMaterial = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                metalness: 0.0,
                roughness: 0.1,
                transparent: true,
                opacity: 0.9
            });
            const floor = new THREE.Mesh(floorGeometry, floorMaterial);
            floor.rotation.x = -Math.PI / 2;
            floor.receiveShadow = true;
            scene.add(floor);
            
            scene.add(car);
            
            // 🎯 FOCUS CAMERA ON CAR
            controls.target.copy(car.position);
            controls.update();
            
            // Hide loading
            if (loadingElement) {
                loadingElement.style.display = 'none';
            }
            
            console.log('🏆 Premium car viewer ready!');
        },
        
        function(progress) {
            console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%');
        },
        
        function(error) {
            console.error('❌ Error loading car model:', error);
            if (loadingElement) {
                loadingElement.innerHTML = '<p>❌ Error loading 3D model</p>';
            }
        }
    );
    
    // 🎬 RENDER LOOP
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();
    
    // 📱 RESPONSIVE RESIZE
    function handleResize() {
        const newWidth = container.offsetWidth;
        const newHeight = container.offsetHeight;
        
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
    }
    
    window.addEventListener('resize', handleResize);
}